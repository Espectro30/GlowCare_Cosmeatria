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

from .models import ServiceSchedule
from .serializers import ServiceScheduleSerializer

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
        elif role == 'cliente':
            qs = qs.filter(is_booked=False)
            
        return Response(ServiceScheduleSerializer(qs, many=True).data)
        
    elif request.method == 'POST':
        role = getattr(request.user.profile, 'role', '') if request.user.is_authenticated and hasattr(request.user, 'profile') else ''
        if role not in ['admin', 'cosmiatra']:
            return Response(status=status.HTTP_403_FORBIDDEN)
        
        data = request.data.copy()
        if role == 'cosmiatra':
            data['cosmiatra'] = request.user.cosmiatra_profile.id
            
        serializer = ServiceScheduleSerializer(data=data)
        if serializer.is_valid():
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
        old_date = schedule.date
        old_time = schedule.start_time
        serializer = ServiceScheduleSerializer(schedule, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            
            if (schedule.date != old_date or schedule.start_time != old_time) and schedule.is_booked:
                from apps.usuarios.models import Notification
                try:
                    appt = schedule.appointment
                    Notification.objects.create(
                        user=appt.user,
                        message=f"Tu cita de {schedule.service.title} ha sido reprogramada para el {schedule.date} a las {schedule.start_time.strftime('%I:%M %p')}."
                    )
                except Exception as e:
                    pass
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    elif request.method == 'DELETE':
        schedule.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
