# 🗺️ Guía de Instalación Maestra — GlowCare v2.2.0

Esta guía documenta paso a paso cómo desplegar el ecosistema **GlowCare** en una PC desde cero, tanto con Docker como de forma manual, asegurando un entorno funcional y seguro.

---

## 🛠️ Requisitos Previos

### 1. Docker Desktop *(método recomendado)*
Permite ejecutar el proyecto sin instalar Python ni Node localmente.

- **Descarga:** [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/)
- En Windows: habilitar **WSL 2** durante la instalación.

### 2. Node.js LTS *(método manual)*

> [!CAUTION]
> **Alerta de Seguridad NPM:** En 2024 se detectaron vulnerabilidades en versiones de npm `>= 10.4.x` relacionadas con dependencias transitivas. Se recomienda exclusivamente la versión **LTS estable (v20.x o v22.x)** y ejecutar `npm audit` tras cada instalación de paquetes.

- **Descarga:** [nodejs.org](https://nodejs.org/) — elegir rama **LTS**
- Verificar: `node -v` debe mostrar `v20.x` o `v22.x`

### 3. Python 3.11+ *(método manual)*
- **Descarga:** [python.org/downloads](https://www.python.org/downloads/)
- ⚠️ Marcar **"Add Python to PATH"** durante la instalación en Windows.
- Verificar: `python --version`

### 4. Git
- **Descarga:** [git-scm.com](https://git-scm.com/)
- Verificar: `git --version`

---

## 🐳 Método 1: Docker (Recomendado para Presentación)

```bash
# 1. Clonar el repositorio
git clone https://github.com/Espectro30/GlowCare_Cosmeatria_v2.git
cd GlowCare_Cosmeatria_v2

# 2. Levantar el ecosistema completo
docker-compose up --build
```

El sistema se auto-configura: ejecuta migraciones, carga los datos demo y levanta ambos servidores.

| Servicio | URL |
|---------|-----|
| 🌐 Frontend | http://localhost:3000 |
| ⚙️ API Backend | http://localhost:8003/api |

---

## 💻 Método 2: Manual (Desarrollo Local)

### Backend (Django)

```bash
cd backend

# Crear y activar entorno virtual
python -m venv venv
.\venv\Scripts\activate        # Windows PowerShell
# source venv/bin/activate     # Linux / macOS

# Instalar dependencias
pip install -r requirements.txt

# Aplicar migraciones
python manage.py migrate

# Cargar datos de demostración (usuarios + 6 servicios)
python seed_db.py

# Iniciar servidor en puerto 8003
python manage.py runserver 8003
```

### Frontend (React + Vite)
*(abrir una segunda terminal)*

```bash
cd frontend

# Instalar dependencias (usar ci para mayor reproducibilidad)
npm install

# Iniciar servidor de desarrollo
npm run dev
```

Acceso: **http://localhost:3000**

---

## 🔐 Credenciales de Acceso — Demo

| Rol | Correo | Contraseña | Capacidades principales |
|-----|--------|-----------|------------------------|
| **Admin Maestro** | `admin@glowcare.com` | `admin123` | Gestionar staff, ver métricas, registrar cosmiatras con contraseña |
| **Cosmiatra** | `dra_elena@glowcare.com` | `admin123` | Agenda profesional, crear citas, ver pacientes |
| **Paciente** | `paciente@gmail.com` | `admin123` | Explorar catálogo, agendar, pagar, ver historial y editar perfil |

---

## 🗃️ Seed de Base de Datos

El script `backend/seed_db.py` crea automáticamente:

- ✅ Admin Maestro
- ✅ Cosmiatra demo (Dra. Elena Pérez)
- ✅ Paciente demo (Juan Pueblo)
- ✅ 6 servicios clínicos con imágenes y descripciones

```bash
# Ejecutar desde backend/ con el venv activo:
python seed_db.py
```

---

## 🛡️ Arquitectura de Seguridad Implementada

| Medida | Descripción |
|--------|-------------|
| **JWT Bearer Token** | Token almacenado en `localStorage` + inyectado por interceptor de Axios en cada request |
| **HttpOnly Cookie** | Capa adicional de seguridad para el token en contextos de cookie |
| **RBAC** | Rutas protegidas por rol (admin / cosmiatra / cliente) en frontend y backend |
| **UUID Primary Keys** | IDs no secuenciales en servicios y citas — previene scraping y IDOR |
| **AuditLog** | Registro inalterable de acciones críticas: login, creación de citas, cambios de estado |
| **CORS Controlado** | Solo orígenes autorizados (`localhost:3000`) pueden consumir la API |
| **Serializers estrictos** | El backend nunca expone campos sensibles (hash de contraseña, datos internos) |

---

## ❓ Solución de Problemas Frecuentes

| Problema | Solución |
|---------|---------|
| `python: command not found` | Reinstalar Python marcando "Add to PATH" |
| Puerto 8003 ocupado | `netstat -ano \| findstr 8003` y cerrar el proceso |
| Dropdowns vacíos en modal | Ejecutar `python seed_db.py` para cargar servicios |
| Token inválido / 401 | Limpiar LocalStorage en DevTools → Application → Local Storage |
| `npm install` falla | Usar `npm install --legacy-peer-deps` o cambiar a Node LTS |

---

*GlowCare v2.2.0 — Desarrollado por Angel & Miguel | Lenguaje de Programación 2*
