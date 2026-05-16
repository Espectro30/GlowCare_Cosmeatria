from django.db import models
from django.contrib.auth.models import User
import uuid

class Appointment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    schedule = models.OneToOneField('servicios.ServiceSchedule', on_delete=models.CASCADE, related_name='appointment', null=True, blank=True)
    status = models.CharField(max_length=50, default="pendiente")
    
    # Auditoría de pagos P2P
    payment_method = models.CharField(max_length=50, null=True, blank=True) 
    payment_reference = models.CharField(max_length=50, null=True, blank=True)
    payment_phone_origin = models.CharField(max_length=20, null=True, blank=True)
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='appointments')
    service = models.ForeignKey('servicios.ServicePackage', on_delete=models.CASCADE)
    cosmiatra = models.ForeignKey('usuarios.Cosmiatra', on_delete=models.SET_NULL, null=True)
    date_time = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Cita"
        verbose_name_plural = "Citas"

    def __str__(self):
        return f"Cita #{self.id}: {self.user.username}"

class ChatMessage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, related_name='messages')
    sender = models.CharField(max_length=50) 
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Mensaje de Chat"
        verbose_name_plural = "Mensajes de Chat"
