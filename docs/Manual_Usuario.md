# Manual de Usuario — Plataforma GlowCare v3.0.0

Bienvenido/a al Manual Oficial de GlowCare, la plataforma de gestión clínica para cosmiatría profesional. Este documento guía a pacientes, cosmiatras y administradores en el uso del sistema.

---

## 📌 Acceso a la Plataforma

**URL:** `http://localhost:3000` (entorno local de demostración)

---

## 👤 Módulo Paciente (Cliente)

### 1. Registro — Paso 1: Datos de Cuenta
1. Hacer clic en **"Ingresar"** en el navbar → botón **"¿No tienes cuenta? Regístrate"**
2. Completar los campos obligatorios:
   - Nombre Completo
   - Cédula de Identidad
   - Teléfono Personal
   - Correo Electrónico
   - Contraseña (mínimo 6 caracteres)
3. Hacer clic en **"Continuar"**

### 2. Registro — Paso 2: Datos Clínicos *(nuevo en v3.0.0)*
Antes de completar el registro, el sistema solicita información médica confidencial para personalizar los tratamientos:

| Campo | Descripción |
|-------|-------------|
| **Alergias** | Si tiene alergias, se solicita descripción detallada |
| **Tratamientos previos** | Tipo de tratamiento anterior y resultado obtenido |
| **Enfermedades cutáneas** | Rosácea, psoriasis, dermatitis, acné crónico, etc. |
| **Medicamentos actuales** | Especialmente isotretinoína, anticoagulantes, etc. |
| **Embarazo / Lactancia** | Estado fisiológico actual |
| **Fototipo cutáneo** | Tipo de piel del I al VI (si lo conoce) |
| **Observaciones** | Cualquier información adicional relevante |

> Esta información es **confidencial** y solo la puede ver la cosmiatra asignada.

### 3. Inicio de Sesión
1. Hacer clic en **"Ingresar"**
2. Ingresar correo electrónico y contraseña
3. El sistema redirige automáticamente al panel correspondiente

### 4. Explorar el Catálogo de Servicios
1. Hacer clic en **"Explorar Tratamientos"** o navegar a `/servicios`
2. Ver las 6 tarjetas de tratamientos disponibles
3. Hacer clic en cualquier tarjeta para ver el detalle completo:
   - Descripción clínica
   - Precio y duración
   - Beneficios del protocolo
   - Para quién es ideal
   - Cuidados post-tratamiento

### 5. Agendar una Cita
1. Desde la página de detalle de un servicio, hacer clic en **"Seleccionar Especialista y Agendar"**
2. Elegir la cosmiatra disponible
3. Hacer clic en **"Confirmar y Continuar"**
4. En la pasarela de pago:
   - Elegir el método: Pago Móvil, Zinli o Transferencia Bancaria
   - Confirmar el monto
   - Copiar los datos bancarios y realizar la transferencia
   - Ingresar los **últimos 4 dígitos** de la referencia y el teléfono emisor
5. Hacer clic en **"Finalizar Agendamiento"**

### 6. Ver Mis Citas
1. Ir al navbar → **"Mis Citas"** o navegar a `/mi-calendario`
2. Ver el historial de citas con su estado actual

### 7. Editar Mi Perfil *(nuevo en v3.0.0)*
1. Ir al navbar → **"Perfil"** o navegar a `/perfil`
2. Hacer clic en **"Editar Perfil"** (botón en la tarjeta)
3. Editar:
   - Foto de perfil (subir imagen desde el dispositivo)
   - Nombre completo
   - Teléfono
   - Descripción personal
4. Hacer clic en **"Guardar Cambios"**

---

## 👩‍⚕️ Módulo Cosmiatra

### 1. Acceso
- Usar las credenciales que el Administrador proporcionó al crear la cuenta.
- Navegar a `/agenda-especialista` o hacer clic en **"Mi Agenda"** en el navbar.

### 2. Ver la Agenda
- La página muestra las citas asignadas ordenadas cronológicamente.
- Cada cita muestra: paciente, servicio, fecha, hora y estado.
- Permite descargar la **Ficha Clínica (PDF)** del paciente directamente desde la tarjeta de la cita.

### 3. Crear una Cita Manual (desde el consultorio)
1. Hacer clic en **"Agendar Nueva Cita"**
2. En el modal:
   - **Seleccionar Paciente**: dropdown con todos los pacientes registrados
   - **Tratamiento a Realizar**: dropdown con todos los servicios (muestra nombre y precio)
   - **Fecha de la Cita**: selector de fecha
   - **Hora Exacta**: selector de hora
3. Hacer clic en **"Inscribir Turno"**

### 4. Marcar Cita como Realizada
- En la lista de citas, hacer clic en el botón **"Marcar Realizada"** correspondiente.
- La cita cambia de estado a `completada`.

---

## 🛡️ Módulo Administrador

### 1. Acceso al Panel Maestro
- Iniciar sesión con el correo de administrador
- Hacer clic en **"Panel Maestro"** en el navbar o navegar a `/admin-dashboard`

### 2. Métricas del Sistema
El header del panel muestra 4 indicadores en tiempo real:
- **Pacientes Activos**: total de clientes registrados en el sistema
- **Citas Totales**: total de agendamientos registrados
- **Seguridad Clínica**: versión del estándar OWASP aplicado
- **Estado General**: estado operativo de la plataforma

### 3. Gestión de Pacientes
- La tabla central muestra todos los pacientes registrados
- Buscar por nombre en el campo de búsqueda (funcionalidad en desarrollo)
- Hacer clic en **"Auditar Perfil"** para acceder al historial clínico
- Permite generar y descargar la **Ficha Clínica en PDF** con el historial y las notas de los especialistas.

### 4. Registrar Nueva Cosmiatra *(actualizado en v3.0.0)*
1. Hacer clic en **"Registrar Staff"**
2. Completar el formulario:
   - Nombre Completo
   - Correo Institucional (será su usuario de acceso)
   - Especialidad Clínica
   - Contraseña Temporal (opcional — si se deja en blanco, se genera una automáticamente)
3. Hacer clic en **"Registrar en GlowCare"**
4. El sistema muestra las credenciales para entregárselas a la especialista.

### 5. Notificaciones *(nuevo en v3.0.0)*
- Hacer clic en el ícono de **campana** (🔔) en el header del panel
- Se abre un dropdown con los últimos eventos del sistema:
  - Respaldos automáticos
  - Nuevas cosmiatras registradas
  - Logins administrativos detectados
  - Citas creadas

---

## 🎨 Interfaz de Usuario — Guía Visual

### Paleta de Colores
| Color | Significado | Uso |
|-------|-------------|-----|
| **Blanco** | Limpieza, pureza | Fondo principal, navbar, tarjetas |
| **Nut (Beige)** | Calidez, naturaleza | Campos de datos, secciones informativas |
| **Verde Naturaleza** | Salud, bienestar | Botones de acción, acentos, dashboards |

### Navegación por Rol
| Rol | Menú disponible en Navbar |
|-----|--------------------------|
| No autenticado | Catálogo → Ingresar |
| Admin | Panel Maestro · Perfil · Salir |
| Cosmiatra | Mi Agenda · Perfil · Salir |
| Paciente | Mis Citas · Perfil · Salir |

---

*GlowCare v3.0.0 — Documento de uso interno y evaluación académica*
