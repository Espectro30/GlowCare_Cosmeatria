from rest_framework import serializers
from django.contrib.auth.models import User
from .models import ClientProfile, Cosmiatra

class ClientProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientProfile
        fields = ['id', 'cedula', 'phone', 'address']

class UserSerializer(serializers.ModelSerializer):
    profile = ClientProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'is_active', 'profile']
