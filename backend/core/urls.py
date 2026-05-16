from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/usuarios/', include('apps.usuarios.urls')),
    path('api/servicios/', include('apps.servicios.urls')),
    path('api/citas/', include('apps.citas.urls')),
]
