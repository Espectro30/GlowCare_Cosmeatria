from django.db import models
import uuid

class ServicePackage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    slug = models.CharField(max_length=255, unique=True)
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=255, default="Estética")
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2) 
    duration_minutes = models.IntegerField()
    image_url = models.URLField()

    class Meta:
        verbose_name = "Paquete de Servicio"
        verbose_name_plural = "Paquetes de Servicios"

    def __str__(self):
        return self.title

class ServiceSchedule(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    service = models.ForeignKey(ServicePackage, on_delete=models.CASCADE, related_name='schedules')
    cosmiatra = models.ForeignKey('usuarios.Cosmiatra', on_delete=models.CASCADE, related_name='schedules')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_booked = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Horario de Servicio"
        verbose_name_plural = "Horarios de Servicios"
        ordering = ['date', 'start_time']

    def __str__(self):
        return f"{self.service.title} - {self.date} {self.start_time}"
