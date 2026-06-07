from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from .models import Appointment
from .serializers import AppointmentSerializer
from apps.auditoria.models import AuditLog

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_appointments(request):
    user = request.user
    role = getattr(user.profile, 'role', 'cliente')
    
    if role == 'admin':
        appointments = Appointment.objects.all()
    elif role == 'cosmiatra':
        # Citas asignadas a este cosmiatra específico
        appointments = Appointment.objects.filter(cosmiatra__user=user)
    else:
        # Citas del paciente
        appointments = Appointment.objects.filter(user=user)
        
    serializer = AppointmentSerializer(appointments, many=True)
    return Response(serializer.data)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_appointment_status(request, pk):
    try:
        appointment = Appointment.objects.get(pk=pk)
    except Appointment.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
        
    # Solo Cosmiatra o Admin pueden cambiar estados
    role = getattr(request.user.profile, 'role', 'cliente')
    if role not in ['admin', 'cosmiatra']:
        return Response(status=status.HTTP_403_FORBIDDEN)
        
    status_value = request.data.get('status')
    payment_ref = request.data.get('payment_reference')
    
    changed = False
    old_status = appointment.status
    if status_value and status_value != old_status:
        appointment.status = status_value
        changed = True
        
        if status_value == 'finalizada' and old_status != 'finalizada':
            try:
                profile = appointment.user.profile
                if appointment.service:
                    profile.glow_points += appointment.service.glow_points_reward
                    profile.save()
            except Exception:
                pass

    if payment_ref is not None:
        appointment.payment_reference = payment_ref
        changed = True
        
    if changed:
        appointment.save()
        
        AuditLog.objects.create(
            user=request.user,
            action="ACTUALIZACIÓN DE ESTADO",
            description=f"Estado de cita {pk} cambiado a {status_value}",
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
    return Response(AppointmentSerializer(appointment).data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_appointment(request):
    data = request.data
    
    # Validar si es admin/secretaria agendando a nombre de alguien más
    user_to_book = request.user
    role = getattr(request.user.profile, 'role', '') if hasattr(request.user, 'profile') else ''
    if role in ['admin', 'secretaria'] and data.get('patient_id'):
        from django.contrib.auth.models import User
        try:
            user_to_book = User.objects.get(id=data.get('patient_id'))
        except User.DoesNotExist:
            pass
            
    # Asignación original de User por compatibilidad
    if role in ['admin', 'cosmiatra'] and 'user_id' in data:
        from django.contrib.auth.models import User
        try:
            user_to_book = User.objects.get(id=data['user_id'])
        except User.DoesNotExist:
            pass

    if 'schedule_id' in data and data['schedule_id'] and data['schedule_id'] != 'coordinar':
        from apps.servicios.models import ServiceSchedule
        from datetime import datetime, time
        from django.utils import timezone
        try:
            real_id = data['schedule_id']
            virtual_date_str = None
            if '_' in str(real_id):
                parts = real_id.split('_')
                real_id = parts[0]
                virtual_date_str = parts[1]
                
            schedule = ServiceSchedule.objects.get(id=real_id)
            
            sched_date = schedule.date
            if virtual_date_str:
                sched_date = datetime.strptime(virtual_date_str, '%Y-%m-%d').date()
            elif not sched_date:
                return Response({"detail": "No se puede determinar la fecha de la cita"}, status=status.HTTP_400_BAD_REQUEST)
                
            # Verificar si ya está reservado para esa fecha
            from apps.citas.models import Appointment
            already_booked = Appointment.objects.filter(
                schedule=schedule,
                scheduled_date=sched_date,
                status__in=['pendiente', 'confirmada', 'completada']
            ).exists()
            
            if already_booked:
                return Response({"detail": "Este cupo ya está reservado."}, status=status.HTTP_400_BAD_REQUEST)
            
            final_date_time = timezone.make_aware(timezone.datetime.combine(sched_date, schedule.start_time))
            
            appointment = Appointment.objects.create(
                schedule=schedule,
                scheduled_date=sched_date,
                user=user_to_book,
                service=schedule.service,
                cosmiatra=schedule.cosmiatra,
                date_time=final_date_time,
                payment_method=data.get('payment_method'),
                payment_reference=data.get('payment_reference'),
                payment_phone_origin=data.get('payment_phone_origin'),
                coupon_id=data.get('coupon'),
                discount_applied=data.get('discount_applied', 0),
                final_price=data.get('final_price', schedule.service.price)
            )
            
            AuditLog.objects.create(
                user=request.user,
                action="CREACIÓN DE CITA MÉDICA",
                description=f"Se generó cita para {user_to_book.email} el {sched_date} con UUID {appointment.id}. Ref Pago: {appointment.payment_reference}",
                ip_address=request.META.get('REMOTE_ADDR')
            )
            
            return Response(AppointmentSerializer(appointment).data, status=status.HTTP_201_CREATED)
        except ServiceSchedule.DoesNotExist:
            return Response({"detail": "Horario no encontrado"}, status=status.HTTP_404_NOT_FOUND)
    else:
        # Modo 'coordinar' o sin horario
        from apps.servicios.models import ServicePackage
        from django.utils import timezone
        service_id = data.get('service_id')
        if not service_id:
            return Response({"detail": "Falta service_id para agendar sin horario"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            service = ServicePackage.objects.get(id=service_id)
            appointment = Appointment.objects.create(
                schedule=None,
                user=user_to_book,
                service=service,
                cosmiatra=None,
                date_time=timezone.now(), # Fecha dummy, se coordinará
                payment_method=data.get('payment_method'),
                payment_reference=data.get('payment_reference'),
                payment_phone_origin=data.get('payment_phone_origin'),
                coupon_id=data.get('coupon'),
                discount_applied=data.get('discount_applied', 0),
                final_price=data.get('final_price', service.price)
            )
            
            AuditLog.objects.create(
                user=request.user,
                action="CREACIÓN DE CITA (AGENDA ABIERTA)",
                description=f"Se generó cita a coordinar para {user_to_book.email} con UUID {appointment.id}. Ref Pago: {appointment.payment_reference}",
                ip_address=request.META.get('REMOTE_ADDR')
            )
            
            return Response(AppointmentSerializer(appointment).data, status=status.HTTP_201_CREATED)
        except ServicePackage.DoesNotExist:
            return Response({"detail": "Servicio no encontrado"}, status=status.HTTP_404_NOT_FOUND)

from .models import CosmiatricAnnotation
from .serializers import CosmiatricAnnotationSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_annotation(request, pk):
    try:
        appointment = Appointment.objects.get(pk=pk)
    except Appointment.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
        
    role = getattr(request.user.profile, 'role', '') if hasattr(request.user, 'profile') else ''
    if role not in ['admin', 'cosmiatra']:
        return Response(status=status.HTTP_403_FORBIDDEN)
        
    if hasattr(appointment, 'annotation'):
        return Response({'detail': 'Esta cita ya tiene una anotación.'}, status=status.HTTP_400_BAD_REQUEST)
        
    serializer = CosmiatricAnnotationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(appointment=appointment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_history(request, pk):
    role = getattr(request.user.profile, 'role', '') if hasattr(request.user, 'profile') else ''
    if role not in ['admin', 'cosmiatra', 'secretaria']:
        return Response(status=status.HTTP_403_FORBIDDEN)
        
    try:
        target_user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
        
    appointments = Appointment.objects.filter(user=target_user).order_by('-date_time')
    
    history_data = []
    for app in appointments:
        ann = getattr(app, 'annotation', None)
        fecha = ""
        if app.date_time:
            fecha = app.date_time.strftime('%Y-%m-%d %H:%M')
        elif app.schedule:
            fecha = f"{app.schedule.date} {app.schedule.start_time}"
            
        history_data.append({
            'cita_id': str(app.id),
            'servicio': app.service.title if app.service else '',
            'fecha': fecha,
            'cosmiatra': app.cosmiatra.name if app.cosmiatra else 'N/A',
            'estado': app.status,
            'pago': {
                'metodo': app.payment_method,
                'referencia': app.payment_reference,
                'monto_final': str(app.final_price)
            },
            'anotacion': {
                'notas': ann.notes,
                'productos': ann.products_used,
                'reaccion': ann.reaction
            } if ann else None
        })
        
    return Response({
        'paciente': {
            'nombre': target_user.first_name,
            'email': target_user.email,
            'cedula': target_user.profile.cedula if hasattr(target_user, 'profile') else '',
            'genero': target_user.profile.gender if hasattr(target_user, 'profile') else '',
            'datos_clinicos': target_user.profile.address if hasattr(target_user, 'profile') else ''
        },
        'historial': history_data
    })
