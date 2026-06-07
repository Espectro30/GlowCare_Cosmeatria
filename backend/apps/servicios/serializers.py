from rest_framework import serializers
from .models import ServicePackage, ServiceSchedule

class ServicePackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServicePackage
        fields = ['id', 'slug', 'title', 'category', 'description', 'price', 'duration_minutes', 'image_url', 'image', 'protocol_benefits', 'post_care', 'glow_points_reward']

    def validate_image_url(self, value):
        if value:
            if not value.startswith('https://images.unsplash.com/') and not value.startswith('https://unsplash.com/') and not value.startswith('https://plus.unsplash.com/'):
                raise serializers.ValidationError("Por seguridad, solo se permiten URLs de Unsplash (https://images.unsplash.com/, https://unsplash.com/ o https://plus.unsplash.com/).")
        return value

    def validate_image(self, value):
        if value:
            ext = value.name.split('.')[-1].lower()
            if ext not in ['jpg', 'jpeg', 'png']:
                raise serializers.ValidationError("Por seguridad, solo se permiten imágenes en formato JPG o PNG.")
        return value


from .models import Coupon
class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = '__all__'

from .models import ServiceReview
class ServiceReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = ServiceReview
        fields = ['id', 'service', 'user', 'user_name', 'rating', 'comment', 'staff_reply', 'is_public', 'created_at']
        read_only_fields = ['id', 'user']

    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username

class ServiceScheduleSerializer(serializers.ModelSerializer):
    service_title = serializers.ReadOnlyField(source='service.title')
    cosmiatra_name = serializers.ReadOnlyField(source='cosmiatra.name')
    class Meta:
        model = ServiceSchedule
        fields = ['id', 'service', 'cosmiatra', 'date', 'days_of_week', 'start_time', 'end_time', 'is_paused', 'paused_until', 'service_title', 'cosmiatra_name', 'overtime_justification']

from .models import RewardProduct, ProductRedemption

class RewardProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = RewardProduct
        fields = '__all__'

class ProductRedemptionSerializer(serializers.ModelSerializer):
    product_details = RewardProductSerializer(source='product', read_only=True)
    user_name = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductRedemption
        fields = ['id', 'user', 'user_name', 'product', 'product_details', 'redeemed_at', 'status']
        read_only_fields = ['id', 'user']
        
    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username
