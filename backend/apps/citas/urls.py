from django.urls import path
from . import views

urlpatterns = [
    path('', views.list_appointments, name='list_appointments'),
    path('crear/', views.create_appointment, name='create_appointment'),
    path('status/<uuid:pk>/', views.update_appointment_status, name='update_status'),
    path('<uuid:pk>/anotacion/', views.create_annotation, name='create_annotation'),
    path('historial/paciente/<int:pk>/', views.patient_history, name='patient_history'),
]
