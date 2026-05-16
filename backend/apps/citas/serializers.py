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
        fields = ['id', 'schedule', 'date_time', 'status', 'payment_method', 'payment_reference', 'user', 'service', 'cosmiatra', 'messages', 'schedule_details']
        read_only_fields = ['id']
