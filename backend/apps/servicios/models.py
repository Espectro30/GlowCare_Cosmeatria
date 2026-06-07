from django.db import models
import uuid
from django.contrib.auth.models import User

class ServicePackage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    slug = models.CharField(max_length=255, unique=True)
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=255, default="Estética")
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2) 
    duration_minutes = models.IntegerField()
    image_url = models.URLField(null=True, blank=True)
    image = models.ImageField(upload_to='services/', null=True, blank=True)
    protocol_benefits = models.TextField(blank=True, null=True)
    post_care = models.TextField(blank=True, null=True)
    glow_points_reward = models.IntegerField(default=50)

    class Meta:
        verbose_name = "Paquete de Servicio"
        verbose_name_plural = "Paquetes de Servicios"

    def __str__(self):
        return self.title

class ServiceSchedule(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    service = models.ForeignKey(ServicePackage, on_delete=models.CASCADE, related_name='schedules')
    cosmiatra = models.ForeignKey('usuarios.Cosmiatra', on_delete=models.CASCADE, related_name='schedules')
    date = models.DateField(null=True, blank=True)
    days_of_week = models.JSONField(default=list, blank=True) # ["Lunes", "Martes"] etc.
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_paused = models.BooleanField(default=False)
    paused_until = models.DateTimeField(null=True, blank=True)
    overtime_justification = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = "Horario de Servicio"
        verbose_name_plural = "Horarios de Servicios"

    def __str__(self):
        if self.date:
            return f"{self.service.title} - {self.date} {self.start_time}"
        return f"{self.service.title} - {', '.join(self.days_of_week)} {self.start_time}"

class Coupon(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=50, unique=True)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    valid_until = models.DateTimeField(null=True, blank=True)
    max_uses = models.IntegerField(default=1)
    is_unlimited = models.BooleanField(default=False)
    current_uses = models.IntegerField(default=0)
    usage_limit_per_user = models.IntegerField(default=1)
    is_active = models.BooleanField(default=True)
    is_approved_by_admin = models.BooleanField(default=False)
    assigned_to = models.ForeignKey('usuarios.ClientProfile', on_delete=models.SET_NULL, null=True, blank=True, related_name='coupons')

    class Meta:
        verbose_name = "Cupón de Descuento"
        verbose_name_plural = "Cupones de Descuento"

    def __str__(self):
        return f"Cupón: {self.code} ({self.discount_percentage}%)"

class ServiceReview(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    service = models.ForeignKey(ServicePackage, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='service_reviews')
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField(blank=True, null=True)
    staff_reply = models.TextField(blank=True, null=True)
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Reseña de Servicio"
        verbose_name_plural = "Reseñas de Servicios"
        ordering = ['-created_at']

    def __str__(self):
        return f"Review de {self.user.username} - {self.rating} estrellas"

class RewardProduct(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField()
    glow_points_cost = models.IntegerField()
    image_url = models.URLField(null=True, blank=True)
    image = models.ImageField(upload_to='products/', null=True, blank=True)
    is_mock = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.name} ({self.glow_points_cost} Puntos)"

class ProductRedemption(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='redemptions')
    product = models.ForeignKey(RewardProduct, on_delete=models.CASCADE)
    redeemed_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=[('pending', 'Pendiente'), ('delivered', 'Entregado')], default='pending')
    delivery_image = models.ImageField(upload_to='deliveries/', null=True, blank=True)
    
    def __str__(self):
        return f"Canje de {self.user.username} - {self.product.name}"
