# 🚀 Guía para Miguel — Cómo Correr GlowCare v2.2.0 desde Cero

¡Hola Miguel! Este documento es tu mapa para levantar el proyecto GlowCare en tu PC sin dramas. Está actualizado a la versión **v2.2.0** con todos los cambios más recientes.

---

## 📋 ¿Qué es GlowCare?

GlowCare es una plataforma web de gestión para una clínica de cosmiatría (estética profesional). Tiene:

- **Backend**: Django (Python) — la lógica del servidor y la base de datos.
- **Frontend**: React + Vite — la interfaz visual que ve el usuario.
- **3 tipos de usuario**: Admin, Cosmiatra y Paciente, cada uno con su propio panel.

---

## 🐳 MÉTODO 1: Docker (Lo más fácil)

Este método no requiere instalar Python ni Node.js. Docker lo hace todo.

### Pasos:
1. Descargar e instalar **Docker Desktop** desde [docker.com](https://www.docker.com/products/docker-desktop/)
2. Abrir Docker Desktop y esperar a que el ícono de la ballena quede en verde.
3. Abrir una terminal PowerShell en la carpeta raíz del proyecto.
4. Ejecutar:
   ```powershell
   docker-compose up --build
   ```
5. Esperar a que termine (la primera vez descarga dependencias, luego es rápido).
6. Abrir el navegador en: **http://localhost:3000**

---

## 💻 MÉTODO 2: Manual (Sin Docker)

### Lo que necesitas instalar primero:

| Herramienta | Versión | Descarga |
|-------------|---------|---------|
| Python | 3.11 o 3.12 | [python.org](https://www.python.org/downloads/) — ¡marcar "Add to PATH"! |
| Node.js | LTS (v20 o v22) | [nodejs.org](https://nodejs.org/) |
| Git | Cualquiera reciente | [git-scm.com](https://git-scm.com/) |

> [!CAUTION]
> **No uses versiones de npm superiores a la que viene con Node.js LTS.** Algunas versiones más nuevas de npm tuvieron vulnerabilidades en 2024. Con el LTS estás seguro.

### Paso a paso:

#### Terminal 1 — Backend:
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python seed_db.py
python manage.py runserver 8003
```

#### Terminal 2 — Frontend:
```powershell
cd frontend
npm install
npm run dev
```

Acceso: **http://localhost:3000**

---

## 🔑 Usuarios de Prueba

| ¿Quién es? | Correo | Contraseña | ¿Qué puede hacer? |
|-----------|--------|-----------|------------------|
| **Admin** | `admin@glowcare.com` | `admin123` | Ver y gestionar todo: pacientes, métricas, registrar cosmiatras con contraseña |
| **Cosmiatra** | `dra_elena@glowcare.com` | `admin123` | Ver su agenda, crear citas manualmente, ver pacientes |
| **Paciente** | `paciente@gmail.com` | `admin123` | Explorar servicios, agendar cita, pagar, editar perfil |

---

## 🆕 ¿Qué cambió en v2.2.0?

- **Navbar** rediseñado: fondo blanco, textos y botones con contraste correcto.
- **Registro en 2 pasos**: después de crear cuenta, el paciente llena sus datos clínicos (alergias, tratamientos previos, fototipo de piel, etc.).
- **Perfil editable**: cualquier usuario puede editar su foto, nombre, teléfono y descripción.
- **Pago**: la referencia es solo 4 dígitos y los inputs ya no pierden el foco al escribir.
- **Admin**: al crear una cosmiatra, se puede definir o generar su contraseña y el sistema la muestra para entregársela.
- **ServiceDetail**: descripción completa con beneficios, cuidados post-tratamiento e imagen correcta en Drenaje Linfático.
- **Encoding**: textos con caracteres especiales corregidos (Gestión, Clínica, Técnico, etc.).
- **Notificaciones**: el botón de campana en el Admin ahora abre un panel de actividad reciente.

---

## 🛠️ Si algo falla...

| Problema | Solución |
|---------|---------|
| "No encuentro Python" | Reinstalar marcando **"Add Python to PATH"** |
| Los dropdowns de la cosmiatra están vacíos | Correr `python seed_db.py` en la carpeta backend |
| El login dice "no autorizado" | Abrir DevTools → Application → Local Storage → Clear All, luego volver a loguearse |
| Puerto 8003 ya ocupado | Cerrar otra terminal que esté corriendo el backend |
| `npm install` da error | Probar `npm install --legacy-peer-deps` |

---

¡Cualquier duda el código está sincronizado en GitHub! ¡Éxito en la presentación!
