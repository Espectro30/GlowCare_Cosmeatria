from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('me/', views.me, name='me'),
    path('clients/', views.list_clients, name='list_clients'),
    path('staff/', views.list_cosmiatras, name='list_cosmiatras'),
    path('create-cosmiatra/', views.create_cosmiatra, name='create_cosmiatra'),
    path('notifications/', views.my_notifications, name='my_notifications'),
    path('notifications/<uuid:pk>/read/', views.mark_notification_read, name='mark_notification_read'),
]
