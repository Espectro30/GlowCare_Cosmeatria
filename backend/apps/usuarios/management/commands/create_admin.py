from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from apps.usuarios.models import ClientProfile

class Command(BaseCommand):
    help = 'Crea un superusuario por defecto para la evaluación del jurado'

    def handle(self, *args, **kwargs):
        if not User.objects.filter(username='admin').exists():
            user = User.objects.create_superuser('admin', 'admin@glowcare.com', 'admin123')
            ClientProfile.objects.get_or_create(user=user, defaults={'role': 'admin'})
            self.stdout.write(self.style.SUCCESS("¡Superusuario creado exitosamente para el Jurado! Usuario: admin / Clave: admin123"))
        else:
            user = User.objects.get(username='admin')
            ClientProfile.objects.get_or_create(user=user, defaults={'role': 'admin'})
            self.stdout.write("[INFO] El superusuario 'admin' ya existe y su rol ha sido verificado.")
