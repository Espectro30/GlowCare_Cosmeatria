from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/usuarios/', include('apps.usuarios.urls')),
    path('api/servicios/', include('apps.servicios.urls')),
    path('api/citas/', include('apps.citas.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
