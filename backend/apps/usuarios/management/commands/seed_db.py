from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from apps.usuarios.models import ClientProfile, Cosmiatra
from apps.servicios.models import ServicePackage, ServiceSchedule
from datetime import date, timedelta, time

class Command(BaseCommand):
    help = 'Carga datos iniciales para demostración (Usuarios, Servicios, Slots)'

    def handle(self, *args, **kwargs):
        def create_user(username, email, password, role, first_name, last_name, specialty=None, gender=None):
            if not User.objects.filter(username=username).exists() and not User.objects.filter(email=email).exists():
                user = User.objects.create_user(username=username, email=email, password=password)
                user.first_name = first_name
                user.last_name = last_name
                user.save()

                ClientProfile.objects.get_or_create(user=user, defaults={'role': role, 'gender': gender})

                if role == 'cosmiatra':
                    Cosmiatra.objects.get_or_create(
                        user=user,
                        defaults={'name': f"{first_name} {last_name}", 'specialty': specialty or "Estetica General"}
                    )
                self.stdout.write(self.style.SUCCESS(f"[OK] Usuario creado: {username} ({role})"))
            else:
                user = User.objects.filter(username=username).first() or User.objects.get(email=email)
                profile, _ = ClientProfile.objects.get_or_create(user=user)
                profile.role = role
                if gender:
                    profile.gender = gender
                profile.save()

                if role == 'cosmiatra':
                    Cosmiatra.objects.get_or_create(
                        user=user,
                        defaults={'name': f"{first_name} {last_name}", 'specialty': specialty or "Estetica General"}
                    )
                self.stdout.write(f"[INFO] Usuario {username} ya existia. Rol verificado: {role}")

        # ─── 1. ADMIN MAESTRO ───────────────────────────────────────────────
        if not User.objects.filter(username='angel_admin').exists():
            user = User.objects.create_superuser('angel_admin', 'angel@glowcare.com', 'admin123')
            user.first_name = 'Angel'
            user.last_name = 'Delgado'
            user.save()
            ClientProfile.objects.get_or_create(user=user, defaults={'role': 'admin'})
            self.stdout.write(self.style.SUCCESS("[OK] Admin Maestro creado: angel_admin / admin123"))
        else:
            user = User.objects.get(username='angel_admin')
            profile, _ = ClientProfile.objects.get_or_create(user=user)
            profile.role = 'admin'
            profile.save()
            self.stdout.write("[INFO] Admin Maestro verificado.")

        # ─── 2. COSMIATRA ─────────────────────────────────────────────────────
        create_user('ellen_cosmiatra', 'ellen@glowcare.com', 'admin123', 'cosmiatra', 'Ellen', 'De Los Santos', 'Estética Profesional')

        # ─── 3. PACIENTE ─────────────────────────────────────────────────────
        create_user('miguel_paciente', 'miguel@glowcare.com', 'admin123', 'cliente', 'Miguel', 'Delgado', gender='M')

        # ─── 4. SECRETARIA ─────────────────────────────────────────────────────
        create_user('laura_secretaria', 'laura@glowcare.com', 'admin123', 'secretaria', 'Laura', 'Gomez')

        # ─── 5. SERVICIOS ─────────────────────────────────────────────────────
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
                'image_url': 'https://images.unsplash.com/photo-1741522509438-a120c0bb5e88?q=80&w=687&auto=format&fit=crop'
            },
        ]

        servicios_creados = 0
        for s in servicios_demo:
            _, created = ServicePackage.objects.get_or_create(slug=s['slug'], defaults=s)
            if created:
                servicios_creados += 1

        self.stdout.write(self.style.SUCCESS(f"[OK] Servicios en BD: {ServicePackage.objects.count()} ({servicios_creados} nuevos)"))

        # ─── 6. HORARIOS (SLOTS) ────────────────────────────────────────────────
        cosmiatra = Cosmiatra.objects.first()
        if cosmiatra:
            today = date.today()
            slots_creados = 0
            for i in range(5): # Proximos 5 dias
                current_date = today + timedelta(days=i)
                for sp in ServicePackage.objects.all():
                    for hr in [10, 14, 16]:
                        _, created = ServiceSchedule.objects.get_or_create(
                            service=sp,
                            cosmiatra=cosmiatra,
                            date=current_date,
                            start_time=time(hour=hr, minute=0),
                            defaults={'end_time': time(hour=hr+1, minute=0)}
                        )
                        if created:
                            slots_creados += 1
            self.stdout.write(self.style.SUCCESS(f"[OK] Slots generados: {slots_creados} nuevos"))

        self.stdout.write(self.style.SUCCESS("\n[READY] Base de datos GlowCare lista para demostracion."))
        self.stdout.write("  Admin:     angel@glowcare.com  (angel_admin) / admin123")
        self.stdout.write("  Cosmiatra: ellen@glowcare.com  (ellen_cosmiatra) / admin123")
        self.stdout.write("  Paciente:  miguel@glowcare.com (miguel_paciente) / admin123")
