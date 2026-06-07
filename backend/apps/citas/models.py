from django.db import models
from django.contrib.auth.models import User
import uuid

class Appointment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    schedule = models.ForeignKey('servicios.ServiceSchedule', on_delete=models.CASCADE, related_name='appointments', null=True, blank=True)
    scheduled_date = models.DateField(null=True, blank=True) # El día específico que seleccionó el paciente
    status = models.CharField(max_length=50, default="pendiente")
    
    # Auditoría de pagos P2P
    payment_method = models.CharField(max_length=50, null=True, blank=True) 
    payment_reference = models.CharField(max_length=50, null=True, blank=True)
    payment_phone_origin = models.CharField(max_length=20, null=True, blank=True)
    
    # Cupones y Descuentos
    coupon = models.ForeignKey('servicios.Coupon', on_delete=models.SET_NULL, null=True, blank=True)
    discount_applied = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    final_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
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

class CosmiatricAnnotation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='annotation')
    notes = models.TextField(help_text="Acciones realizadas durante el servicio")
    products_used = models.TextField(help_text="Productos aplicados (ej. Ácido Hialurónico, Limpiador X)")
    reaction = models.CharField(max_length=50, choices=(
        ('positive', 'Positiva/Normal'),
        ('neutral', 'Leve enrojecimiento'),
        ('negative', 'Reacción adversa/Alergia')
    ), default='positive')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Anotación Cosmeátrica"
        verbose_name_plural = "Anotaciones Cosmeátricas"

    def __str__(self):
        return f"Anotación para Cita {self.appointment.id}"
