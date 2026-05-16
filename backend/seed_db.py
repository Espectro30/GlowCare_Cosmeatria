import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from django.contrib.auth.models import User
from apps.usuarios.models import ClientProfile, Cosmiatra
from apps.servicios.models import ServicePackage


def create_user(username, email, password, role, first_name, last_name, specialty=None):
    """Crea o actualiza un usuario de demostración con el rol especificado."""
    if not User.objects.filter(username=username).exists() and not User.objects.filter(email=email).exists():
        user = User.objects.create_user(username=username, email=email, password=password)
        user.first_name = first_name
        user.last_name = last_name
        user.save()

        ClientProfile.objects.get_or_create(user=user, defaults={'role': role})

        if role == 'cosmiatra':
            Cosmiatra.objects.get_or_create(
                user=user,
                defaults={'name': f"{first_name} {last_name}", 'specialty': specialty or "Estetica General"}
            )

        print(f"[OK] Usuario creado: {username} ({role})")
    else:
        user = User.objects.filter(username=username).first() or User.objects.get(email=email)
        profile, _ = ClientProfile.objects.get_or_create(user=user)
        profile.role = role
        profile.save()

        if role == 'cosmiatra':
            Cosmiatra.objects.get_or_create(
                user=user,
                defaults={'name': f"{first_name} {last_name}", 'specialty': specialty or "Estetica General"}
            )

        print(f"[INFO] Usuario {username} ya existia. Rol verificado: {role}")


# ─── 1. ADMIN MAESTRO ───────────────────────────────────────────────
if not User.objects.filter(username='angel_admin').exists():
    user = User.objects.create_superuser('angel_admin', 'angel@glowcare.com', 'admin123')
    user.first_name = 'Angel'
    user.last_name = 'Delgado'
    user.save()
    ClientProfile.objects.get_or_create(user=user, defaults={'role': 'admin'})
    print("[OK] Admin Maestro creado: angel_admin / admin123")
else:
    user = User.objects.get(username='angel_admin')
    profile, _ = ClientProfile.objects.get_or_create(user=user)
    profile.role = 'admin'
    profile.save()
    print("[INFO] Admin Maestro verificado.")

# ─── 2. COSMIATRA ─────────────────────────────────────────────────────
create_user('ellen_cosmiatra', 'ellen@glowcare.com', 'admin123', 'cosmiatra', 'Ellen', 'De Los Santos', 'Estética Profesional')

# ─── 3. PACIENTE ─────────────────────────────────────────────────────
create_user('miguel_paciente', 'miguel@glowcare.com', 'admin123', 'cliente', 'Miguel', 'Delgado')

# ─── 4. SERVICIOS ─────────────────────────────────────────────────────
servicios_demo = [
    {
        'slug': 'limpieza-profunda',
        'title': 'Limpieza Facial Profunda',
        'description': 'Tratamiento purificante con extraccion, exfoliacion y mascarilla hidratante organica.',
        'price': 45.00, 'duration_minutes': 60, 'category': 'De la piel',
        'image_url': 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800'
    },
    {
        'slug': 'anti-aging',
        'title': 'Terapia Anti-Aging',
        'description': 'Protocolo rejuvenecedor con radiofrecuencia y sueros concentrados de alta gama.',
        'price': 75.00, 'duration_minutes': 90, 'category': 'Estetica',
        'image_url': 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=800'
    },
    {
        'slug': 'hidratacion-intensiva',
        'title': 'Hidratacion Intensiva',
        'description': 'Restablece la barrera cutanea con acido hialuronico puro y vitaminas esenciales.',
        'price': 55.00, 'duration_minutes': 75, 'category': 'De la piel',
        'image_url': 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=800'
    },
    {
        'slug': 'masaje-descontracturante',
        'title': 'Masaje Descontracturante',
        'description': 'Terapia focalizada en aliviar tensiones musculares y mejorar la alineacion corporal.',
        'price': 60.00, 'duration_minutes': 60, 'category': 'Muscular',
        'image_url': 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800'
    },
    {
        'slug': 'consulta-inicial',
        'title': 'Evaluacion Cosmiatrica',
        'description': 'Diagnostico instrumental de biotipo cutaneo y plan clinico personalizado.',
        'price': 30.00, 'duration_minutes': 45, 'category': 'Consulta',
        'image_url': 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800'
    },
    {
        'slug': 'drenaje-linfatico',
        'title': 'Drenaje Linfatico',
        'description': 'Estimulacion avanzada del sistema linfatico para detoxificacion y reduccion de edemas.',
        'price': 50.00, 'duration_minutes': 60, 'category': 'Salud',
        'image_url': 'https://images.unsplash.com/photo-1544161513-087ceb91ef47?auto=format&fit=crop&q=80&w=800'
    },
]

servicios_creados = 0
for s in servicios_demo:
    _, created = ServicePackage.objects.get_or_create(slug=s['slug'], defaults=s)
    if created:
        servicios_creados += 1

print(f"[OK] Servicios en BD: {ServicePackage.objects.count()} ({servicios_creados} nuevos)")

print("\n[READY] Base de datos GlowCare lista para demostracion.")
print("  Admin:     angel@glowcare.com  (angel_admin) / admin123")
print("  Cosmiatra: ellen@glowcare.com  (ellen_cosmiatra) / admin123")
print("  Paciente:  miguel@glowcare.com (miguel_paciente) / admin123")
