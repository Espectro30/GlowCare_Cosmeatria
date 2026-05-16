# 🌿 GlowCare Cosmiatría v2.2.0

![Version](https://img.shields.io/badge/Version-2.2.0-brightgreen?style=for-the-badge)
![Status](https://img.shields.io/badge/Estado-Produccion_Demo-green?style=for-the-badge)
![Django](https://img.shields.io/badge/Django-5.x-092E20?style=for-the-badge&logo=django&logoColor=white)
![React](https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind](https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

> **GlowCare** es una plataforma ecosistémica de gestión clínica para consultorios de cosmiatría y estética profesional. Desarrollada con arquitectura modular, autenticación JWT segura y una experiencia visual premium en paleta blanco / nut / verde naturaleza.

---

## 🏛️ Arquitectura del Sistema

El proyecto se divide en tres pilares:

| Capa | Tecnología | Puerto |
|------|-----------|--------|
| **Backend API** | Django 5 + Django REST Framework + SimpleJWT | `8003` |
| **Frontend SPA** | React 19 + Vite 8 + TailwindCSS 3 | `3000` |
| **Base de Datos** | SQLite (dev) / PostgreSQL (prod) | — |

### Módulos del Backend (`backend/apps/`)

| App | Responsabilidad |
|-----|----------------|
| `usuarios` | Gestión de identidades, roles (admin, cosmiatra, cliente), JWT auth |
| `servicios` | Catálogo de tratamientos estéticos |
| `citas` | Agendamiento, estados y registro de pagos |
| `auditoria` | Log inalterable de acciones críticas (IP, usuario, timestamp) |

---

## 🚀 Inicio Rápido

### Con Docker (recomendado)
```bash
git clone https://github.com/Espectro30/GlowCare_Cosmeatria_v2.git
cd "GlowCare_Cosmeatria_v2"
docker-compose up --build
```

### Sin Docker (desarrollo local)
```bash
# Backend
cd backend
python -m venv venv && .\venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python seed_db.py        # Carga usuarios y servicios demo
python manage.py runserver 8003

# Frontend (otra terminal)
cd frontend
npm install
npm run dev
```

Acceso: **Frontend** → `http://localhost:3000` | **API** → `http://localhost:8003/api`

---

## 🔐 Credenciales de Demo

| Rol | Correo | Contraseña | Acceso |
|-----|--------|-----------|--------|
| **Admin Maestro** | `admin@glowcare.com` | `admin123` | Panel completo, gestión de staff y métricas |
| **Cosmiatra** | `dra_elena@glowcare.com` | `admin123` | Agenda, creación de citas, gestión de pacientes |
| **Paciente** | `paciente@gmail.com` | `admin123` | Catálogo, agendamiento, perfil, historial |

---

## ✨ Funcionalidades v2.2.0

### Módulo Admin
- 📊 Panel de métricas en tiempo real (pacientes, citas, seguridad)
- 👩‍⚕️ Alta de especialistas con contraseña personalizada o generada automáticamente
- 🔔 Notificaciones con dropdown de actividad reciente
- 🧾 Tabla de gestión de pacientes con auditoría de perfiles

### Módulo Cosmiatra
- 📅 Agenda profesional con vista de citas del día
- ➕ Creación manual de citas desde el consultorio
- ✅ Marcado de citas realizadas

### Módulo Paciente
- 🛍️ Catálogo de 6 tratamientos con descripción clínica detallada
- 📋 Registro en 2 pasos: datos de cuenta + **Datos Clínicos** (alergias, tratamientos previos, fototipo, etc.)
- 💳 Pasarela de pago (Pago Móvil, Zinli, Transferencia) con referencia de 4 dígitos
- 👤 Perfil editable: foto, nombre, teléfono, descripción

### Seguridad
- 🔑 JWT via `Authorization: Bearer` header (localStorage + HttpOnly cookie como capa adicional)
- 🛡️ RBAC (Role-Based Access Control) en frontend y backend
- 📝 AuditLog de acciones críticas
- 🔒 UUIDs en modelos de servicios y citas

---

## 📂 Estructura del Repositorio

```
GlowCare_Cosmeatria_v2/
├── backend/
│   ├── apps/
│   │   ├── auditoria/
│   │   ├── citas/
│   │   ├── servicios/
│   │   └── usuarios/
│   ├── core/          # settings, urls, wsgi
│   ├── seed_db.py     # Datos demo (usuarios + servicios)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/       # axios, auth, appointments, services
│   │   ├── components/
│   │   ├── context/   # AuthContext
│   │   ├── hooks/
│   │   └── pages/
│   ├── tailwind.config.js
│   └── package.json
├── docs/              # Documentación extendida
└── docker-compose.yml
```

---

## 👨‍💻 Autores

- **Angel** — Arquitectura, Backend, Frontend, UX/UI
- **Miguel** — Colaboración y QA

**Universidad / Materia**: Lenguaje de Programación 2  
**Versión**: `2.2.0` — *"Very Green Edition"*

---

*GlowCare: La ciencia del bienestar hecha software.*