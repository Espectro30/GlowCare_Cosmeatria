import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from django.contrib.auth.models import User
from apps.usuarios.models import ClientProfile

if not User.objects.filter(username='admin').exists():
    user = User.objects.create_superuser('admin', 'admin@glowcare.com', 'admin123')
    ClientProfile.objects.get_or_create(user=user, role='admin')
    print("¡Superusuario creado exitosamente para el Jurado! Usuario: admin / Clave: admin123")
else:
    user = User.objects.get(username='admin')
    ClientProfile.objects.get_or_create(user=user, role='admin')
    print("El superusuario 'admin' ya existe y su rol ha sido verificado.")
