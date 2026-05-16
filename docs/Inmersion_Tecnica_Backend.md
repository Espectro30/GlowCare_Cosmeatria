# Inmersión Técnica — Backend GlowCare v2.3.0

Documentación interna del servidor de GlowCare, diseñado bajo **Separación de Responsabilidades (SoC)**, **Clean Architecture** y estándares de seguridad **OWASP**.

---

## 1. Estructura de Aplicaciones (`backend/apps/`)

### `usuarios` — Identity Management

**Modelos:**
- `User` — Django built-in (username, email, first_name, password_hash)
- `ClientProfile` — Extensión 1-a-1 del User (UUID PK, role, cedula, phone, address*)
- `Cosmiatra` — Perfil profesional (UUID PK, user FK, name, specialty, is_active)

*El campo `address` se reutiliza para almacenar los **Datos Clínicos** del paciente en formato JSON.*

**Endpoints clave:**
```
POST   /api/usuarios/register/       → Registro de paciente (acepta clinical_data)
POST   /api/usuarios/login/          → Login, devuelve JWT access_token
GET    /api/usuarios/logout/         → Cierre de sesión, elimina cookie
GET    /api/usuarios/me/             → Datos del usuario autenticado
PATCH  /api/usuarios/me/             → Actualizar nombre, teléfono y bio
GET    /api/usuarios/clients/        → Lista de pacientes (admin + cosmiatra)
POST   /api/usuarios/cosmiatras/     → Crear cosmiatra (solo admin, con contraseña)
GET    /api/usuarios/staff/          → Lista de cosmiatras activas
```

**Lógica de roles:**
```python
# Roles disponibles en ClientProfile
ROLES = ('admin', 'cosmiatra', 'cliente')

# Verificación en vistas protegidas
role = getattr(request.user, 'profile', None)
user_role = role.role if role else 'cliente'
```

**v2.3.0 — Nuevos comportamientos:**
- `POST /register/` acepta `clinical_data` (JSON de historial clínico) y lo guarda en `ClientProfile.address`.
- `PATCH /me/` permite actualizar `first_name`, `phone` y `bio`.
- `POST /cosmiatras/` acepta `password` opcional; si no se envía, genera una contraseña segura con `secrets.token_urlsafe(6)` y la devuelve en la respuesta.

---

### `servicios` — Medical Catalog

**Modelo `ServicePackage`:**
```python
id            # UUID v4 (primary key no predecible)
slug          # Identificador URL amigable (ej: 'drenaje-linfatico')
title         # Nombre del tratamiento
category      # Categoría clínica
description   # Descripción clínica detallada
price         # Precio en USD
duration_minutes  # Duración en minutos
image_url     # URL de imagen de Unsplash
```

**Normalización en el frontend:**
El campo `image_url` del backend es mapeado a `image` por el servicio `servicesApi.getAll()` para mantener consistencia con las propiedades de React.

**6 servicios sembrados con `seed_db.py`:**
1. Limpieza Facial Profunda
2. Terapia Anti-Aging
3. Hidratación Intensiva
4. Masaje Descontracturante
5. Evaluación Cosmiatrica
6. Drenaje Linfático

---

### `citas` — Transaction Core

**Modelo `Appointment`:**
```python
id                   # UUID v4
schedule             # OneToOneField → ServiceSchedule (cupo reservado)
user                 # ForeignKey → User (paciente)
cosmiatra            # ForeignKey → Cosmiatra 
service              # ForeignKey → ServicePackage
date_time            # DateTimeField (copiado del schedule)
status               # ('pendiente', 'confirmada', 'completada', 'cancelada')
payment_method       # Método de pago seleccionado
payment_reference    # Últimos 4 dígitos de la referencia bancaria
payment_phone_origin # Teléfono desde donde se realizó el pago móvil
```

**Ciclo de vida de una cita:**
```
pendiente → confirmada → completada
         ↘ cancelada
```

**Endpoints:**
```
GET    /api/citas/          → Lista (filtrada por rol: admin ve todo, cosmiatra ve las suyas)
POST   /api/citas/          → Crear nueva cita (paciente o cosmiatra)
PATCH  /api/citas/{id}/     → Actualizar estado (cosmiatra o admin)
```

---

### `auditoria` — Safety & Traceability

**Modelo `AuditLog`:**
```python
id         # UUID v4
user       # ForeignKey → User (quién realizó la acción)
action     # Texto descriptivo de la acción (ej: 'CITA_CREADA')
ip_address # Dirección IP de origen
timestamp  # Fecha y hora exacta (auto-generada)
```

Registra automáticamente: logins exitosos, creación de citas, cambios de estado y altas de cosmiatras.

---

## 2. Autenticación JWT — SimpleJWT

**Flujo completo:**
1. `POST /api/usuarios/login/` recibe email + password
2. Django autentica con `authenticate(username=user_obj.username, password=password)`
3. Se generan tokens con `RefreshToken.for_user(user)`
4. La respuesta devuelve `{ access_token, user: { id, name, email, role } }` en el **body**
5. El backend también inyecta el token en una **Cookie HttpOnly** como capa adicional
6. El frontend guarda el `access_token` en `localStorage['glowcare_token']`
7. El interceptor de Axios lo adjunta en cada request: `Authorization: Bearer <token>`

```python
# Respuesta del login
return Response({
    "detail": "Login Exitoso",
    "access_token": str(refresh.access_token),
    "user": {
        "id": str(user.id),
        "name": user.first_name,
        "email": user.email,
        "role": role
    }
})
```

---

## 3. Seguridad Implementada

| Medida | Descripción Técnica |
|--------|-------------------|
| **JWT firmados** | Tokens criptográficos con `SECRET_KEY` configurada via `django-environ` |
| **HttpOnly Cookie** | `Set-Cookie: access_token=...; HttpOnly; SameSite=Lax` en el login |
| **RBAC en vistas** | Cada endpoint verifica `user.profile.role` antes de responder |
| **UUID PKs** | `uuid.uuid4()` como PK en `ServicePackage` y `Appointment` — previene IDOR |
| **DTOs estrictos** | Los Serializers nunca exponen `password`, `profile.address` ni datos internos |
| **CORS controlado** | Solo `http://localhost:3000` en `CORS_ALLOWED_ORIGINS` |
| **Verificación duplicados** | `POST /cosmiatras/` verifica existencia de email antes de crear |

---

## 4. Gestión de Entorno — `django-environ`

Las variables sensibles no están en el código fuente:
```
SECRET_KEY=<generada aleatoriamente>
DEBUG=True  # Falso en producción
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
```

---

## 5. Auto-Configuración con `seed_db.py`

El script `seed_db.py` en la raíz del backend realiza:
1. Crear Admin Maestro si no existe
2. Crear Cosmiatra demo + perfil Cosmiatra
3. Crear Paciente demo
4. Crear los 6 ServicePackages con sus slugs e imágenes

*(Para ver los correos y contraseñas creados, revisa `Credenciales.md`)*

```bash
cd backend
python seed_db.py
```

---

*GlowCare Backend v2.3.0 — Rendimiento, Seguridad y Orden.*
