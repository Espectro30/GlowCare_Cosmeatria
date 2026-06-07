# 🌿 GlowCare Cosmiatría `v3.1.0`

![Version](https://img.shields.io/badge/Version-3.1.0-brightgreen?style=for-the-badge)
![Status](https://img.shields.io/badge/Estado-Final_Entregado-green?style=for-the-badge)
![Django](https://img.shields.io/badge/Django-5.x-092E20?style=for-the-badge&logo=django&logoColor=white)
![React](https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind](https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

> **GlowCare** es una plataforma ecosistémica de gestión clínica para consultorios de cosmiatría y estética profesional. Desarrollada con arquitectura modular, autenticación JWT segura y una experiencia visual premium en paleta blanco / nut / verde naturaleza.

---

## 🏛️ Arquitectura del Sistema

El proyecto se divide en tres pilares:

| Capa              | Tecnología                                   | Puerto |
| ----------------- | -------------------------------------------- | ------ |
| **Backend API**   | Django 5 + Django REST Framework + SimpleJWT | `8003` |
| **Frontend SPA**  | React 19 + Vite 8 + TailwindCSS 3            | `3000` |
| **Base de Datos** | SQLite                                       | —      |

### Módulos del Backend (`backend/apps/`)

| App         | Responsabilidad                                                     |
| ----------- | ------------------------------------------------------------------- |
| `usuarios`  | Gestión de identidades, roles (admin, cosmiatra, cliente), JWT auth |
| `servicios` | Catálogo de tratamientos estéticos                                  |
| `citas`     | Agendamiento, estados y registro de pagos                           |
| `auditoria` | Log inalterable de acciones críticas (IP, usuario, timestamp)       |

---

## 🚀 Inicio Rápido

### Desarrollo local

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

| Rol               | Correo                   | Contraseña | Acceso                                          |
| ----------------- | ------------------------ | ---------- | ----------------------------------------------- |
| **Admin Maestro** | `angel@glowcare.com`     | `admin123` | Panel completo, gestión de staff y métricas     |
| **Cosmiatra**     | `ellen@glowcare.com`     | `admin123` | Agenda, creación de citas, gestión de pacientes |
| **Secretaria**    | `laura@glowcare.com`     | `admin123` | Panel administrativo, gestión de catálogo       |
| **Paciente**      | `miguel@glowcare.com`    | `admin123` | Catálogo, agendamiento, perfil, historial       |

---

## ✨ Funcionalidades (v3.0.0 y v3.1.0)

### Módulo Admin

- 📊 Panel de métricas en tiempo real (pacientes, citas, seguridad)
- 👩‍⚕️ Alta de especialistas con contraseña personalizada o generada automáticamente
- 🔔 Notificaciones con dropdown de actividad reciente
- 🧾 Tabla de gestión de pacientes con auditoría de perfiles
- 📄 Generación y descarga de Ficha Clínica en PDF con formato institucional

### Módulo Cosmiatra

- 📅 Agenda profesional con vista de citas del día
- ➕ Creación manual de citas desde el consultorio
- ✅ Marcado de citas realizadas
- 📄 Descarga de Ficha Clínica en PDF por paciente agendado

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
GlowCare_Cosmeatria/
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
└── docs/              # Documentación extendida
```

---

## 👨‍💻 Autores

- **Angel** — Arquitectura, Backend, Frontend, UX/UI
- **Miguel** — Presentador y Corrector (QA, limitación y ajustes de interfaz)

**Universidad / Materia**: Lenguaje de Programación 2
**Versión**: `3.1.0` — _"Versión Final Proyecto"_

---

## ⚖️ Licencia y Derechos de Autor

> **Copyright (c) 2026 Angel & Miguel. Todos los derechos reservados.**
> 
> Este proyecto es de uso exclusivamente académico y evaluativo. Está **estrictamente prohibida** la copia, clonación (fork), distribución, modificación o comercialización del código fuente o de sus bases de datos sin la autorización explícita de los autores.

---

_GlowCare: La ciencia del bienestar hecha software._
