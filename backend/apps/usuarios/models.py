from django.db import models
from django.contrib.auth.models import User
import uuid

class ClientProfile(models.Model):
    ROLE_CHOICES = (
        ('admin', 'Administrador'),
        ('cliente', 'Paciente/Cliente'),
        ('cosmiatra', 'Cosmiatra/Especialista'),
        ('secretaria', 'Secretaria/Recepcionista'),
    )
    
    GENDER_CHOICES = (
        ('M', 'Masculino'),
        ('F', 'Femenino'),
        ('O', 'Otro'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='cliente')
    cedula = models.CharField(max_length=20, unique=True, null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, null=True, blank=True)
    avatar = models.TextField(null=True, blank=True)
    glow_points = models.IntegerField(default=0)

    class Meta:
        verbose_name = "Perfil de Cliente"
        verbose_name_plural = "Perfiles de Clientes"

    def __str__(self):
        return f"{self.user.username} - {self.get_role_display()}"

class Cosmiatra(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cosmiatra_profile', null=True, blank=True)
    name = models.CharField(max_length=255)
    specialty = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Cosmiatra"
        verbose_name_plural = "Cosmiatras"

    def __str__(self):
        return f"Dra. {self.name} - {self.specialty}"

class Notification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Notificación"
        verbose_name_plural = "Notificaciones"
        ordering = ['-created_at']

    def __str__(self):
        return f"Notificación para {self.user.username}"
