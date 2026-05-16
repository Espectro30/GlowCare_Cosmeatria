from rest_framework import serializers
from .models import ServicePackage, ServiceSchedule

class ServicePackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServicePackage
        fields = ['id', 'slug', 'title', 'category', 'description', 'price', 'duration_minutes', 'image_url']

class ServiceScheduleSerializer(serializers.ModelSerializer):
    service_title = serializers.ReadOnlyField(source='service.title')
    cosmiatra_name = serializers.ReadOnlyField(source='cosmiatra.name')
    class Meta:
        model = ServiceSchedule
        fields = ['id', 'service', 'cosmiatra', 'date', 'start_time', 'end_time', 'is_booked', 'service_title', 'cosmiatra_name']
