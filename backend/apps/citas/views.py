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
    if status_value:
        appointment.status = status_value
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
    data = request.data.copy()
    
    # Lógica de asignación de Paciente
    # Si es Admin o Cosmiatra, pueden agendar para OTRO usuario (pasando user_id)
    role = getattr(request.user.profile, 'role', 'cliente')
    target_user = request.user
    
    if role in ['admin', 'cosmiatra'] and 'user_id' in data:
        try:
            target_user = User.objects.get(id=data['user_id'])
        except User.DoesNotExist:
            return Response({"detail": "Usuario destino no encontrado"}, status=status.HTTP_404_NOT_FOUND)

    if 'schedule_id' in data:
        from apps.servicios.models import ServiceSchedule
        try:
            schedule = ServiceSchedule.objects.get(id=data['schedule_id'])
            if schedule.is_booked:
                return Response({"detail": "Este cupo ya está reservado."}, status=status.HTTP_400_BAD_REQUEST)
            data['schedule'] = schedule.id
            data['service'] = schedule.service_id
            data['cosmiatra'] = schedule.cosmiatra_id
            
            from datetime import datetime, time
            data['date_time'] = datetime.combine(schedule.date, schedule.start_time).isoformat()
        except ServiceSchedule.DoesNotExist:
            return Response({"detail": "Horario no encontrado"}, status=status.HTTP_404_NOT_FOUND)
    
    # Fallback to direct mapping if no schedule_id is provided
    if 'service_id' in data and 'service' not in data: data['service'] = data['service_id']
    if 'cosmiatra_id' in data and 'cosmiatra' not in data: data['cosmiatra'] = data['cosmiatra_id']

    serializer = AppointmentSerializer(data=data)
    if serializer.is_valid():
        appointment = serializer.save(user=target_user)
        
        if 'schedule_id' in data:
            schedule.is_booked = True
            schedule.save()
            
        # AUDITORÍA DE GRADO MÉDICO: Guardar trazabilidad inviolable
        AuditLog.objects.create(
            user=request.user,
            action="CREACIÓN DE CITA MÉDICA",
            description=f"Se generó cita para {target_user.email} con UUID {appointment.id}. Ref Pago: {appointment.payment_reference}",
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
