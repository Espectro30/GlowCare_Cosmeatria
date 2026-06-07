from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import ClientProfile, Cosmiatra
from .serializers import UserSerializer

@api_view(['POST'])
def register(request):
    data = request.data
    if User.objects.filter(email=data.get('email')).exists():
        return Response({"detail": "El correo ya se encuentra registrado"}, status=status.HTTP_400_BAD_REQUEST)
    
    user = User.objects.create_user(
        username=data['email'],
        email=data['email'],
        password=data['password']
    )
    user.first_name = data.get('full_name', '')
    user.save()

    ClientProfile.objects.create(
        user=user,
        cedula=data.get('cedula'),
        phone=data.get('telefono'),
        address=data.get('clinical_data', ''),
        gender=data.get('gender', '')
    )

    return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

@api_view(['POST'])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    # Soporte para entrar con Correo o con Username directo
    try:
        user_obj = User.objects.get(email=email)
        user = authenticate(username=user_obj.username, password=password)
    except User.DoesNotExist:
        user = authenticate(username=email, password=password)
    
    if user:
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        
        role = 'cliente'
        if hasattr(user, 'profile'):
            role = user.profile.role
        
        # Devolver el token en la respuesta para que el frontend lo almacene
        response = Response({
            "detail": "Login Exitoso",
            "access_token": access_token,
            "user": {
                "id": str(user.id), 
                "name": user.first_name, 
                "email": user.email,
                "role": role,
                "phone": getattr(user.profile, 'phone', '') if hasattr(user, 'profile') else '',
                "bio": getattr(user.profile, 'address', '') if hasattr(user, 'profile') else '',
                "avatar": getattr(user.profile, 'avatar', '') if hasattr(user, 'profile') else ''
            }
        })
        
        # También guardamos en cookie HttpOnly como capa de seguridad adicional
        response.set_cookie(
            key='access_token',
            value=access_token,
            httponly=True,
            secure=False,
            samesite='Lax'
        )
        return response
        
    return Response({"detail": "Correo o contraseña incorrectos"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def logout(request):
    response = Response({"detail": "Cierre de sesión exitoso"})
    response.delete_cookie('access_token')
    return response

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def me(request):
    user = request.user
    role = 'cliente'
    if hasattr(user, 'profile'):
        role = user.profile.role

    if request.method == 'PATCH':
        # Actualizar nombre
        if 'first_name' in request.data:
            user.first_name = request.data['first_name']
            user.save()
        # Actualizar telefono y bio en el perfil
        if hasattr(user, 'profile'):
            profile = user.profile
            if 'phone' in request.data:
                profile.phone = request.data['phone']
            if 'bio' in request.data:
                profile.address = request.data['bio']  # Reutilizamos 'address' para bio
            if 'avatar' in request.data:
                profile.avatar = request.data['avatar']
            profile.save()
        return Response({'detail': 'Perfil actualizado correctamente'})

    return Response({
        'id': str(user.id),
        'name': user.first_name,
        'email': user.email,
        'role': role,
        'is_staff': user.is_staff,
        'phone': user.profile.phone if hasattr(user, 'profile') else '',
        'bio': user.profile.address if hasattr(user, 'profile') else '',
        'avatar': user.profile.avatar if hasattr(user, 'profile') else '',
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_clients(request):
    role = getattr(request.user, 'profile', None)
    user_role = role.role if role else 'cliente'
    # Admin y Cosmiatra pueden ver la lista de pacientes
    if not request.user.is_staff and user_role not in ['admin', 'cosmiatra']:
        return Response({"detail": "No autorizado"}, status=status.HTTP_403_FORBIDDEN)
    
    users = User.objects.filter(profile__role='cliente')
    return Response(UserSerializer(users, many=True).data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_cosmiatra(request):
    role = getattr(request.user, 'profile', None)
    user_role = role.role if role else 'cliente'
    if not request.user.is_staff and user_role != 'admin':
        return Response({"detail": "No autorizado"}, status=status.HTTP_403_FORBIDDEN)
    
    data = request.data
    # Usar la contrasena enviada o generar una temporal segura
    password = data.get('password') or f"GlowCare{__import__('secrets').token_urlsafe(6)}!"
    
    if User.objects.filter(email=data['email']).exists():
        return Response({"detail": "Ya existe un usuario con ese correo"}, status=status.HTTP_400_BAD_REQUEST)
    
    new_user = User.objects.create_user(
        username=data['email'],
        email=data['email'],
        password=password
    )
    new_user.first_name = data['name']
    new_user.save()
    
    ClientProfile.objects.create(
        user=new_user, 
        role=data.get('role', 'cosmiatra'),
        phone=data.get('phone', ''),
        address=data.get('bio', '')
    )
    
    Cosmiatra.objects.create(
        user=new_user,
        name=data['name'],
        specialty=data['specialty']
    )
    
    return Response({"detail": "Cosmiatra creada exitosamente", "password_assigned": password})

@api_view(['GET'])
def list_cosmiatras(request):
    cosmiatras = Cosmiatra.objects.filter(is_active=True)
    data = []
    for c in cosmiatras:
        prof = getattr(c.user, 'profile', None)
        data.append({
            "id": str(c.id), 
            "name": c.name, 
            "email": c.user.email if c.user else '',
            "phone": prof.phone if prof else '',
            "bio": prof.address if prof else '',
            "specialty": c.specialty,
            "role": prof.role if prof else 'cosmiatra'
        })
    return Response(data)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_cosmiatra(request, pk):
    role = getattr(request.user, 'profile', None)
    if not request.user.is_staff and (not role or role.role != 'admin'):
        return Response(status=status.HTTP_403_FORBIDDEN)
        
    try:
        cosmiatra = Cosmiatra.objects.get(pk=pk, is_active=True)
        data = request.data
        if 'name' in data:
            cosmiatra.name = data['name']
            if cosmiatra.user:
                cosmiatra.user.first_name = data['name']
                cosmiatra.user.save()
        if 'specialty' in data:
            cosmiatra.specialty = data['specialty']
        cosmiatra.save()
        
        if cosmiatra.user and hasattr(cosmiatra.user, 'profile'):
            profile = cosmiatra.user.profile
            if 'phone' in data:
                profile.phone = data['phone']
            if 'bio' in data:
                profile.address = data['bio']
            profile.save()
            
        return Response({"detail": "Staff actualizado correctamente"})
    except Cosmiatra.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_cosmiatra(request, pk):
    role = getattr(request.user, 'profile', None)
    if not request.user.is_staff and (not role or role.role != 'admin'):
        return Response(status=status.HTTP_403_FORBIDDEN)
        
    try:
        cosmiatra = Cosmiatra.objects.get(pk=pk)
        cosmiatra.is_active = False
        cosmiatra.save()
        if cosmiatra.user:
            cosmiatra.user.is_active = False
            cosmiatra.user.save()
        return Response({"detail": "Staff eliminado correctamente"})
    except Cosmiatra.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_notifications(request):
    from .models import Notification
    notifs = Notification.objects.filter(user=request.user)
    data = [{"id": str(n.id), "message": n.message, "is_read": n.is_read, "created_at": n.created_at} for n in notifs]
    return Response(data)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, pk):
    from .models import Notification
    try:
        n = Notification.objects.get(pk=pk, user=request.user)
        n.is_read = True
        n.save()
        return Response({"status": "ok"})
    except Notification.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
