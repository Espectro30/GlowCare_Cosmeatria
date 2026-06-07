from django.urls import path
from . import views

urlpatterns = [
    path('', views.services, name='services_list_create'),
    path('<uuid:pk>/', views.service_detail, name='service_detail'),
    path('horarios/', views.service_schedules, name='service_schedules'),
    path('horarios/<uuid:pk>/', views.service_schedule_detail, name='service_schedule_detail'),
    path('cupones/', views.coupons_list_create, name='coupons_list_create'),
    path('cupones/<uuid:pk>/', views.coupon_detail, name='coupon_detail'),
    path('cupones/validar/', views.validate_coupon, name='validate_coupon'),
    path('<uuid:pk>/reviews/', views.service_reviews, name='service_reviews'),
    path('store/products/', views.reward_products, name='reward_products'),
    path('store/redemptions/', views.product_redemptions, name='product_redemptions'),
    path('store/redemptions/all/', views.all_product_redemptions, name='all_product_redemptions'),
    path('store/redemptions/<uuid:pk>/', views.product_redemption_detail, name='product_redemption_detail'),
]
