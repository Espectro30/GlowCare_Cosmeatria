from django.urls import path
from . import views

urlpatterns = [
    path('', views.services, name='services_list_create'),
    path('horarios/', views.service_schedules, name='service_schedules'),
    path('horarios/<uuid:pk>/', views.service_schedule_detail, name='service_schedule_detail'),
]
