from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import ServicePackage
from .serializers import ServicePackageSerializer

@api_view(['GET', 'POST'])
def services(request):
    if request.method == 'GET':
        services = ServicePackage.objects.all()
        return Response(ServicePackageSerializer(services, many=True).data)
    elif request.method == 'POST':
        if not request.user.is_authenticated:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        serializer = ServicePackageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def service_detail(request, pk):
    try:
        service = ServicePackage.objects.get(pk=pk)
    except ServicePackage.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    role = getattr(request.user.profile, 'role', '') if hasattr(request.user, 'profile') else ''
    if role != 'admin':
        return Response(status=status.HTTP_403_FORBIDDEN)
        
    if request.method == 'PUT':
        serializer = ServicePackageSerializer(service, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    elif request.method == 'DELETE':
        service.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

from .models import ServiceSchedule, Coupon
from .serializers import ServiceScheduleSerializer, CouponSerializer
from django.utils import timezone

@api_view(['POST'])
def validate_coupon(request):
    code = request.data.get('code')
    try:
        coupon = Coupon.objects.get(code__iexact=code, is_active=True)
        if coupon.valid_until and coupon.valid_until < timezone.now():
            return Response({'error': 'Cupón expirado'}, status=status.HTTP_400_BAD_REQUEST)
        if not coupon.is_unlimited and coupon.current_uses >= coupon.max_uses:
            return Response({'error': 'Cupón agotado'}, status=status.HTTP_400_BAD_REQUEST)
        
        if coupon.assigned_to:
            if not request.user.is_authenticated or not hasattr(request.user, 'profile'):
                return Response({'error': 'Autenticación requerida para este cupón'}, status=status.HTTP_401_UNAUTHORIZED)
            if coupon.assigned_to != request.user.profile:
                return Response({'error': 'Cupón no válido para este usuario'}, status=status.HTTP_400_BAD_REQUEST)

        return Response(CouponSerializer(coupon).data)
    except Coupon.DoesNotExist:
        return Response({'error': 'Cupón inválido'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def coupons_list_create(request):
    role = getattr(request.user.profile, 'role', '') if hasattr(request.user, 'profile') else ''
    if role not in ['admin', 'secretaria']:
        return Response(status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        return Response(CouponSerializer(Coupon.objects.all(), many=True).data)
    elif request.method == 'POST':
        serializer = CouponSerializer(data=request.data)
        if serializer.is_valid():
            if role == 'secretaria':
                serializer.save(is_approved_by_admin=False, is_active=False)
            else:
                serializer.save(is_approved_by_admin=True, is_active=True)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def coupon_detail(request, pk):
    role = getattr(request.user.profile, 'role', '') if hasattr(request.user, 'profile') else ''
    if role not in ['admin', 'secretaria']:
        return Response(status=status.HTTP_403_FORBIDDEN)
    try:
        coupon = Coupon.objects.get(pk=pk)
    except Coupon.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
        
    if request.method == 'PATCH':
        serializer = CouponSerializer(coupon, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        coupon.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

from datetime import timedelta, datetime
from apps.citas.models import Appointment

@api_view(['GET', 'POST'])
def service_schedules(request):
    if request.method == 'GET':
        service_id = request.query_params.get('service_id')
        qs = ServiceSchedule.objects.all()
        if service_id:
            qs = qs.filter(service_id=service_id)
            
        role = 'cliente'
        if request.user.is_authenticated and hasattr(request.user, 'profile'):
            role = request.user.profile.role
            
        if role == 'cosmiatra':
            qs = qs.filter(cosmiatra__user=request.user)
            return Response(ServiceScheduleSerializer(qs, many=True).data)
        else:
            # Cliente: Generate virtual slots based on active templates
            now = timezone.now()
            virtual_slots = []
            
            for template in qs:
                # Handle auto-unpause
                if template.is_paused:
                    if template.paused_until and template.paused_until < now:
                        template.is_paused = False
                        template.paused_until = None
                        template.save()
                    else:
                        continue # Skip paused templates
                
                booked_dates = set(Appointment.objects.filter(
                    schedule=template,
                    status__in=['pendiente', 'confirmada', 'completada']
                ).values_list('scheduled_date', flat=True))
                
                if template.date:
                    if template.date >= now.date() and template.date not in booked_dates:
                        data = ServiceScheduleSerializer(template).data
                        data['virtual_id'] = f"{template.id}_{template.date}"
                        virtual_slots.append(data)
                
                if template.days_of_week:
                    def get_dow(d):
                        d = d.lower()
                        if d.startswith('lun'): return 0
                        if d.startswith('mar'): return 1
                        if d.startswith('mi'): return 2
                        if d.startswith('jue'): return 3
                        if d.startswith('vie'): return 4
                        if d.startswith('s'): return 5
                        if d.startswith('dom'): return 6
                        return None
                        
                    selected_dows = [get_dow(d) for d in template.days_of_week if get_dow(d) is not None]
                    
                    for i in range(30):
                        current_date = now.date() + timedelta(days=i)
                        # Avoid duplicates if date was also set
                        if template.date and current_date == template.date:
                            continue
                        if current_date.weekday() in selected_dows and current_date not in booked_dates:
                            data = ServiceScheduleSerializer(template).data
                            data['date'] = str(current_date)
                            data['virtual_id'] = f"{template.id}_{current_date}"
                            virtual_slots.append(data)
                            
            virtual_slots.sort(key=lambda x: (x['date'], x['start_time']))
            return Response(virtual_slots)
        
    elif request.method == 'POST':
        role = getattr(request.user.profile, 'role', '') if request.user.is_authenticated and hasattr(request.user, 'profile') else ''
        if role not in ['admin', 'cosmiatra']:
            return Response(status=status.HTTP_403_FORBIDDEN)
        
        data = request.data.copy()
        if role == 'cosmiatra':
            data['cosmiatra'] = request.user.cosmiatra_profile.id
            
        serializer = ServiceScheduleSerializer(data=data)
        if serializer.is_valid():
            start = serializer.validated_data['start_time']
            end = serializer.validated_data['end_time']
            start_dt = datetime.strptime(start.strftime('%H:%M'), '%H:%M')
            end_dt = datetime.strptime(end.strftime('%H:%M'), '%H:%M')
            if end_dt <= start_dt + timedelta(minutes=19):
                return Response({"detail": "La hora de fin debe tener al menos 20 minutos de separación de la de inicio."}, status=status.HTTP_400_BAD_REQUEST)
                
            if end_dt.time() > datetime.strptime('18:50', '%H:%M').time() and not serializer.validated_data.get('overtime_justification'):
                return Response({"detail": "OVERTIME_WARNING"}, status=status.HTTP_400_BAD_REQUEST)
                
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def service_schedule_detail(request, pk):
    try:
        schedule = ServiceSchedule.objects.get(pk=pk)
    except ServiceSchedule.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
        
    role = getattr(request.user.profile, 'role', '') if hasattr(request.user, 'profile') else ''
    if role not in ['admin', 'cosmiatra']:
        return Response(status=status.HTTP_403_FORBIDDEN)
        
    if request.method == 'PUT':
        serializer = ServiceScheduleSerializer(schedule, data=request.data, partial=True)
        if serializer.is_valid():
            start = serializer.validated_data.get('start_time', schedule.start_time)
            end = serializer.validated_data.get('end_time', schedule.end_time)
            from datetime import datetime, timedelta
            start_dt = datetime.strptime(start.strftime('%H:%M'), '%H:%M')
            end_dt = datetime.strptime(end.strftime('%H:%M'), '%H:%M')
            if end_dt <= start_dt + timedelta(minutes=19):
                return Response({"detail": "La hora de fin debe tener al menos 20 minutos de separación de la de inicio."}, status=status.HTTP_400_BAD_REQUEST)
                
            if end_dt.time() > datetime.strptime('18:50', '%H:%M').time() and not serializer.validated_data.get('overtime_justification'):
                return Response({"detail": "OVERTIME_WARNING"}, status=status.HTTP_400_BAD_REQUEST)
                
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    elif request.method == 'DELETE':
        schedule.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

from .models import ServiceReview
from .serializers import ServiceReviewSerializer
from apps.citas.models import Appointment

@api_view(['GET', 'POST'])
def service_reviews(request, pk):
    try:
        service = ServicePackage.objects.get(pk=pk)
    except ServicePackage.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        reviews = service.reviews.all()
        return Response(ServiceReviewSerializer(reviews, many=True).data)

    elif request.method == 'POST':
        if not request.user.is_authenticated:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
            
        # Verify if patient has a completed appointment for this service
        has_completed = Appointment.objects.filter(
            user=request.user,
            service=service,
            status='finalizada'
        ).exists()
        
        if not has_completed:
            return Response({"detail": "Debes haber completado este servicio para dejar una reseña."}, status=status.HTTP_403_FORBIDDEN)
            
        serializer = ServiceReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(service=service, user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from .models import RewardProduct, ProductRedemption
from .serializers import RewardProductSerializer, ProductRedemptionSerializer

@api_view(['GET', 'POST'])
def reward_products(request):
    if request.method == 'GET':
        products = RewardProduct.objects.filter(is_active=True)
        return Response(RewardProductSerializer(products, many=True).data)
    elif request.method == 'POST':
        role = getattr(request.user.profile, 'role', '') if request.user.is_authenticated and hasattr(request.user, 'profile') else ''
        if role not in ['admin', 'secretaria']:
            return Response(status=status.HTTP_403_FORBIDDEN)
        serializer = RewardProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def product_redemptions(request):
    if request.method == 'GET':
        role = getattr(request.user.profile, 'role', '') if hasattr(request.user, 'profile') else ''
        if role in ['admin', 'secretaria']:
            redemptions = ProductRedemption.objects.all().order_by('-redeemed_at')
        else:
            redemptions = ProductRedemption.objects.filter(user=request.user).order_by('-redeemed_at')
        return Response(ProductRedemptionSerializer(redemptions, many=True).data)
        
    elif request.method == 'POST':
        product_id = request.data.get('product_id')
        try:
            product = RewardProduct.objects.get(id=product_id, is_active=True)
        except RewardProduct.DoesNotExist:
            return Response({"detail": "Producto no encontrado"}, status=status.HTTP_404_NOT_FOUND)
            
        # Mock payment/points verification since glow points aren't fully tracked yet
        # In future, check user's actual glow points
        redemption = ProductRedemption.objects.create(user=request.user, product=product)
        return Response(ProductRedemptionSerializer(redemption).data, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def all_product_redemptions(request):
    role = getattr(request.user.profile, 'role', '') if hasattr(request.user, 'profile') else ''
    if role not in ['admin', 'secretaria']:
        return Response(status=status.HTTP_403_FORBIDDEN)
    redemptions = ProductRedemption.objects.all().order_by('-redeemed_at')
    return Response(ProductRedemptionSerializer(redemptions, many=True).data)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def product_redemption_detail(request, pk):
    role = getattr(request.user.profile, 'role', '') if hasattr(request.user, 'profile') else ''
    if role not in ['admin', 'secretaria']:
        return Response(status=status.HTTP_403_FORBIDDEN)
    try:
        redemption = ProductRedemption.objects.get(pk=pk)
    except ProductRedemption.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
        
    # Compatibilidad con frontend que manda is_delivered o status
    data = request.data.copy()
    if 'is_delivered' in data and data['is_delivered']:
        data['status'] = 'delivered'
        
    serializer = ProductRedemptionSerializer(redemption, data=data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
