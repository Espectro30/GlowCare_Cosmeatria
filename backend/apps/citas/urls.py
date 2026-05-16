from django.urls import path
from . import views

urlpatterns = [
    path('', views.list_appointments, name='list_appointments'),
    path('crear/', views.create_appointment, name='create_appointment'),
    path('status/<uuid:pk>/', views.update_appointment_status, name='update_status'),
]
