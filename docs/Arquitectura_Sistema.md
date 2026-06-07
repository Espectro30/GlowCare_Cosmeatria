# Documentación de Arquitectura del Sistema — GlowCare v3.0.0

Este documento detalla la ingeniería de software aplicada al proyecto GlowCare, una plataforma SaaS de gestión clínica para consultorios de cosmiatría, diseñada bajo estándares **OWASP Secure by Design** y principios de **Clean Architecture**.

---

## 1. Visión General del Sistema

GlowCare es un ecosistema distribuido de dos capas que respeta los principios de **separación de responsabilidades**, **cohesión alta** y **acoplamiento débil (Loose Coupling)**. La división cliente-servidor garantiza escalabilidad y mantenibilidad independiente.

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENTE (Browser)                   │
│   React 19 + Vite 8 + TailwindCSS 3                     │
│   Puerto: 3000                                          │
└────────────────────────┬────────────────────────────────┘
                         │  HTTP / REST (JSON)
                         │  Authorization: Bearer <JWT>
┌────────────────────────▼────────────────────────────────┐
│                   SERVIDOR (Backend)                     │
│   Django 5 + Django REST Framework + SimpleJWT           │
│   Puerto: 8000                                          │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                  BASE DE DATOS                           │
│   SQLite (Estructura Normalizada hasta 3NF)              │
└─────────────────────────────────────────────────────────┘
```

### Normalización de Base de Datos (3NF)
El esquema relacional de GlowCare ha sido diseñado garantizando integridad referencial y eliminando redundancias, alcanzando la **Tercera Forma Normal (3NF)**:
1. **1NF**: Todos los atributos son atómicos y existe una clave primaria (UUID/ID) en cada tabla (e.g. `Appointment`, `ServicePackage`).
2. **2NF**: No existen dependencias parciales; todos los atributos no clave dependen de la clave primaria completa (e.g. datos del paciente están en `ClientProfile`, no repetidos en las citas).
3. **3NF**: No existen dependencias transitivas; los atributos no clave no dependen de otros atributos no clave (e.g. la especialidad de la cosmiatra se consulta a través de la relación, no se repite en el registro del horario).

---

## 2. Arquitectura del Backend — Sub-Apps Django

Se adoptó una **Arquitectura Modular** donde cada `app` de Django es un componente independiente con responsabilidad única.

### `apps/usuarios`
- Orquesta identidades y roles del sistema.
- Modelos: `User` (Django built-in) + `ClientProfile` (rol, cédula, teléfono, datos clínicos) + `Cosmiatra` (especialidad, estado activo).
- Endpoints: `POST /register`, `POST /login`, `GET|PATCH /me/`, `GET /clients/`, `POST /cosmiatras/`, `GET /staff/`.
- **v3.0.0**: El endpoint `/register` acepta `clinical_data` (JSON con historial clínico del paciente). El endpoint `/me/` ahora acepta `PATCH` para actualizar perfil.

### `apps/servicios`
- Gestiona el inventario de tratamientos estéticos.
- Modelo: `ServicePackage` (UUID, slug, title, category, description, price, duration_minutes, image_url).
- 6 servicios demo sembrados via `seed_db.py`.

### `apps/citas`
- Módulo transaccional: une pacientes + cosmiatras + servicios.
- Modelo: `Appointment` (UUID, user, cosmiatra, service, date_time, status, payment_method, payment_reference).
- Estados: `pendiente` → `confirmada` → `completada` / `cancelada`.

### `apps/auditoria`
- Módulo de trazabilidad médica.
- Modelo: `AuditLog` (usuario, acción, IP de origen, timestamp).
- Registra: login, creación de citas, cambios de estado.

---

## 3. Arquitectura del Frontend — Capa de Red (`src/api/`)

El frontend implementa **Inversión de Dependencias (DIP)**: todos los componentes consumen la API a través de módulos especializados en `src/api/`, nunca con `fetch` directa.

```
src/api/
├── axios.js          # Cliente base + interceptores de JWT
├── auth.js           # login, logout, register, getClients, createCosmiatra
├── appointments.js   # getAll, create, updateStatus
└── services.js       # getAll (con normalización image_url → image)
```

### Interceptor de Autenticación (`axios.js`)
```js
// Inyecta el token en CADA petición automáticamente
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('glowcare_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

---

## 4. Sistema de Roles (RBAC)

| Rol | Acceso Frontend | Acceso API |
|-----|----------------|-----------|
| `admin` | Panel Maestro (`/admin-dashboard`) | Todo: usuarios, citas, cosmiatras |
| `cosmiatra` | Agenda Profesional (`/agenda-especialista`) | Citas propias, lista de pacientes y servicios |
| `cliente` | Mis Citas (`/mi-calendario`), Catálogo, Perfil | Solo sus propias citas y su perfil |
| *No autenticado* | Home, Catálogo (solo vista) | Solo `GET /servicios/` |

---

## 5. Flujo de Autenticación JWT (v3.0.0)

```
1. POST /api/usuarios/login/
   → Backend valida credenciales
   → Genera par de tokens (access + refresh) con SimpleJWT
   → Devuelve { access_token, user: { id, name, email, role } } en el BODY

2. Frontend (authApi.login):
   → Guarda access_token en localStorage['glowcare_token']
   → Guarda user en localStorage['glowcare_user']
   → Actualiza AuthContext

3. Interceptor de Axios:
   → En cada request adjunta: Authorization: Bearer <access_token>

4. Backend (JWTAuthentication):
   → Valida el token en cada endpoint protegido
   → Devuelve 401 si el token es inválido o expirado

5. Interceptor de respuesta:
   → Si 401, limpia localStorage y avisa al usuario
```

---

## 6. Registro de Paciente en 2 Pasos (v3.0.0)

El flujo de registro fue extendido para capturar datos clínicos críticos:

**Paso 1 — Datos de Cuenta**: Nombre, Cédula, Teléfono, Email, Contraseña.

**Paso 2 — Datos Clínicos**:
- ¿Tiene alergias? (con campo de detalle si aplica)
- ¿Ha tenido tratamientos estéticos previos? (tipo + resultado)
- Enfermedades cutáneas conocidas
- Medicamentos actuales
- ¿Embarazo o lactancia?
- Fototipo cutáneo (Tipo I–VI)
- Observaciones adicionales

Los datos clínicos se serializan como JSON y se almacenan en el campo `address` del `ClientProfile` del backend.

---

## 7. Paleta de Diseño — "Very Green Edition"

El sistema visual sigue una paleta de tres colores base definida en `tailwind.config.js`:

| Token | Color | Uso |
|-------|-------|-----|
| `white` | #FFFFFF | Fondos de tarjetas y navbar |
| `nut-*` | Beige/Avellana (#fdf8f6 – #3d2b25) | Tarjetas secundarias, campos editables |
| `brand-*` | Verde naturaleza (#f4f7f4 – #1b2a1a) | Botones, acentos, dashboards |

---

## 8. Seguridad Implementada

| Medida | Implementación |
|--------|---------------|
| **JWT Bearer** | `Authorization: Bearer` header via interceptor de Axios |
| **HttpOnly Cookie** | Capa adicional vía `Set-Cookie` en el response de login |
| **UUID PKs** | `ServicePackage` y `Appointment` usan UUIDv4 — previene IDOR |
| **RBAC** | Verificación de rol en frontend (rutas) y backend (decoradores) |
| **CORS controlado** | Solo `localhost:3000` en `CORS_ALLOWED_ORIGINS` |
| **DTOs estrictos** | Serializers nunca exponen hash de contraseña ni datos sensibles |
| **AuditLog** | Registro inalterable de acciones críticas con IP y timestamp |
| **OWASP Top 10** | Mitigaciones aplicadas para XSS, IDOR, Autenticación rota, CSRF |

---

## 9. Infraestructura de Servidor Local

```yaml
# Para levantar el proyecto de forma local:
# - Backend Django en puerto 8000
# - Frontend Vite en puerto 3000 con hot-reload
# - Base de datos local SQLite (db.sqlite3) auto-gestionada
```

---

## 10. Historial de Versiones

| Versión | Fecha | Cambios Principales |
|---------|-------|---------------------|
| `1.0.0` | 2025-03 | Monolito inicial |
| `2.0.0` | 2025-04 | Migración a arquitectura modular + Docker |
| `2.1.0` | 2026-04 | Fix JWT, seed de servicios, rediseño "Very Green" |
| `2.2.0` | 2026-05 | Registro Datos Clínicos, Perfil Editable, Navbar blanca/nut/verde, encoding UTF-8 |
| `3.0.0` | 2026-06 | Entrega final: Entorno estabilizado sin Docker/PostgreSQL, fix de lógica de agendamiento, visualización de cupos y exportación de Fichas Clínicas en PDF. |

---

*Documento generado para evaluación académica — Lenguaje de Programación 2*
