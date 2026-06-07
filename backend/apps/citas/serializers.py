from rest_framework import serializers
from .models import Appointment, ChatMessage
from apps.servicios.serializers import ServiceScheduleSerializer

class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['id', 'sender', 'text', 'timestamp']

class AppointmentSerializer(serializers.ModelSerializer):
    messages = ChatMessageSerializer(many=True, read_only=True)
    schedule_details = ServiceScheduleSerializer(source='schedule', read_only=True)
    
    class Meta:
        model = Appointment
        fields = ['id', 'schedule', 'date_time', 'status', 'payment_method', 'payment_reference', 'user', 'service', 'cosmiatra', 'messages', 'schedule_details', 'coupon', 'discount_applied', 'final_price', 'annotation']
        read_only_fields = ['id']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['user_details'] = {
            'id': instance.user.id,
            'name': f"{instance.user.first_name} {instance.user.last_name}".strip() or instance.user.username,
            'phone': getattr(instance.user.profile, 'phone', '') if hasattr(instance.user, 'profile') else 'No registrado'
        }
        return representation

from .models import CosmiatricAnnotation
class CosmiatricAnnotationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CosmiatricAnnotation
        fields = '__all__'
