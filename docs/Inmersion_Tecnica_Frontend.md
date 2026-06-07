# Inmersión Técnica — Frontend GlowCare v3.1.0

Documentación del cliente web construido con **React 19**, **Vite 8** y **TailwindCSS 3** bajo principios de Inversión de Dependencias (DIP) y Diseño Orientado al Componente.

---

## 1. Stack Tecnológico

| Herramienta | Versión | Rol |
|-------------|---------|-----|
| React | 19 | UI declarativa y reactiva |
| Vite | 8 | Bundler ultrarrápido + HMR |
| TailwindCSS | 3 | Sistema de diseño utility-first |
| React Router DOM | 6 | Enrutamiento SPA |
| Lucide React | latest | Iconografía vectorial SVG |
| Axios | latest | Cliente HTTP con interceptores |

---

## 2. Capa de Red — Inversión de Dependencias (`src/api/`)

Los componentes nunca hacen peticiones directas. Todo se abstrae en módulos especializados:

```
src/api/
├── axios.js          # Cliente Axios base + interceptores de autenticación
├── auth.js           # login, logout, register, me, getClients, createCosmiatra, getStaff
├── appointments.js   # getAll, create, updateStatus
└── services.js       # getAll (normaliza image_url → image del backend)
```

### `axios.js` — Interceptores JWT
```js
// Interceptor de REQUEST: adjunta token en cada petición
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('glowcare_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de RESPONSE: maneja errores 401 globalmente
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('glowcare_token');
      // Redirigir a login si es necesario
    }
    return Promise.reject(error);
  }
);
```

### `services.js` — Normalización de campos
```js
// El backend devuelve 'image_url', el frontend espera 'image'
const mapService = s => ({
  ...s,
  image: s.image_url || s.image,
  duration: s.duration_minutes ? `${s.duration_minutes} min` : '60 min'
});
```

---

## 3. Gestión de Estado Global — `AuthContext`

El contexto de autenticación envuelve toda la aplicación y provee:

```jsx
// src/context/AuthContext.jsx
const AuthContext = createContext(null);

// src/context/AuthProvider.jsx
function AuthProvider({ children }) {
  const [user, setUser] = useState(
    () => JSON.parse(localStorage.getItem('glowcare_user')) || null
  );

  const login = (userData, token) => {
    localStorage.setItem('glowcare_token', token);
    localStorage.setItem('glowcare_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('glowcare_token');
    localStorage.removeItem('glowcare_user');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}
```

**Hook de consumo:**
```js
import { useAuth } from '../hooks/useAuth';
const { user, login, logout } = useAuth();
```

---

## 4. Enrutamiento y Rutas Protegidas

```jsx
// App.jsx — Rutas principales
<Routes>
  <Route path="/"               element={<Home />} />
  <Route path="/servicios"      element={<Services />} />
  <Route path="/servicios/:id"  element={<ServiceDetail />} />
  <Route path="/login"          element={<Login />} />
  <Route path="/registro"       element={<Register />} />
  <Route path="/checkout"       element={<ProtectedRoute><PaymentFlow /></ProtectedRoute>} />
  <Route path="/admin-dashboard"      element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
  <Route path="/agenda-especialista"  element={<ProtectedRoute roles={['cosmiatra']}><CosmiatraDashboard /></ProtectedRoute>} />
  <Route path="/mi-calendario"        element={<ProtectedRoute roles={['cliente']}><PatientCalendar /></ProtectedRoute>} />
  <Route path="/perfil"               element={<ProtectedRoute><Profile /></ProtectedRoute>} />
</Routes>
```

---

## 5. Paleta de Diseño — Sistema de Tokens (`tailwind.config.js`)

```js
theme: {
  extend: {
    colors: {
      // Verde Naturaleza — color principal de la marca
      brand: {
        50: '#f4f7f4',
        100: '#e3ebe3',
        // ... hasta 950
        600: '#5c8356',
        800: '#2d5228',
        900: '#1e3a1c',
        950: '#1b2a1a',
      },
      // Nut / Avellana — tono cálido secundario
      nut: {
        50: '#fdf8f6',
        100: '#f5ede8',
        // ... hasta 900
        500: '#8b5e52',
        700: '#3d2b25',
      }
    }
  }
}
```

**Regla de uso:**
- `brand-*` → botones de acción, acentos, dashboards oscuros
- `nut-*` → tarjetas informativas, campos de formulario, secciones cálidas
- `white` → fondos de tarjetas, navbar, superficies principales

---

## 6. Flujos de Usuario Implementados

### Paciente
```
Home → /servicios (catálogo) → /servicios/:id (detalle) 
     → Modal especialista → /checkout (pago) → /mi-calendario
```

### Cosmiatra
```
Login → /agenda-especialista → Modal nueva cita → Marcar realizada
```

### Admin
```
Login → /admin-dashboard → Modal alta cosmiatra → Ver notificaciones → Auditar paciente
```

---

## 7. Páginas Principales y su Propósito

| Página | Archivo | Descripción |
|--------|---------|-------------|
| Home | `Home.jsx` | Landing page con hero, valores y CTA |
| Servicios | `Services.jsx` | Grid de tarjetas del catálogo |
| Detalle Servicio | `ServiceDetail.jsx` | Info clínica completa + modal de especialista |
| Login | `Login.jsx` | Formulario de autenticación |
| Registro | `Register.jsx` | Flujo 2 pasos: cuenta + datos clínicos |
| PaymentFlow | `PaymentFlow.jsx` | Pasarela: método → monto → datos bancarios → referencia → éxito |
| AdminDashboard | `AdminDashboard.jsx` | Panel admin: métricas, pacientes, alta cosmiatra, notificaciones |
| CosmiatraDashboard | `CosmiatraDashboard.jsx` | Agenda profesional + modal crear cita |
| PatientCalendar | `PatientCalendar.jsx` | Historial de citas del paciente |
| Profile | `Profile.jsx` | Perfil editable: foto, nombre, teléfono, descripción |

---

## 8. Fix del Bug de Focus en Inputs Numéricos (v3.1.0)

**Problema:** Los inputs de referencia bancaria y teléfono perdían el foco del cursor al tipear cada dígito.

**Causa:** El uso de `type="number"` en React causa un re-render del input en cada keystroke, reposicionando el cursor al inicio.

**Solución aplicada:**
```jsx
// ANTES (con bug)
<input
  type="number"
  onChange={e => setRefNumber(e.target.value)}
/>

// DESPUÉS (sin bug)
<input
  type="text"
  inputMode="numeric"        // Teclado numérico en móvil
  maxLength={4}              // Solo 4 dígitos para referencia
  autoComplete="off"
  autoCorrect="off"
  spellCheck={false}
  onChange={useCallback((e) => {
    setRefNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 4));
  }, [])}                   // useCallback evita recrear el handler en cada render
/>
```

---

## 9. Generación de PDFs en el Cliente (v3.1.0)

Para evitar dependencias pesadas en el servidor y asegurar que el diseño de los documentos coincida exactamente con la interfaz visual, la generación de PDFs clínicos se realiza nativamente en el navegador.

**Funcionamiento (`AdminDashboard.jsx` y `CosmiatraDashboard.jsx`):**
1. Se realiza un `fetch` autenticado a `/api/citas/historial/paciente/:id/` para obtener los datos clínicos crudos.
2. La función auxiliar `parseClinicalData` limpia el JSON en caso de que esté anidado.
3. Se crea una nueva ventana invisible o pop-up mediante `window.open()`.
4. Se inyecta código HTML estático junto a estilos CSS (que incluyen la misma paleta y tipografía del sitio, y la carga del logo SVG).
5. Se dispara `window.print()` que abre el diálogo nativo del navegador, permitiendo al usuario guardar el documento directamente como PDF.

---

## 10. Componentes Reutilizables

| Componente | Archivo | Uso |
|-----------|---------|-----|
| Navbar | `components/Navbar.jsx` | Navegación adaptativa por rol |
| ProtectedRoute | `components/ProtectedRoute.jsx` | Guard de rutas por autenticación y rol |
| ServiceCard | Interno en `Services.jsx` | Tarjeta de servicio en el catálogo |
| Field | Interno en `Register.jsx` | Input label + input controlado reutilizable |
| SectionCard | Interno en `Register.jsx` | Sección agrupada de datos clínicos |
| RadioGroup | Interno en `Register.jsx` | Selección de opciones con estilo visual |

---

*GlowCare Frontend v3.1.0 — Experiencia de usuario premium y arquitectura escalable.*


## Actualizaciones Recientes (v2.4.1)
- Se estandarizó el uso de glowcare_token en lugar de ccess_token para la capa de autenticación Axios.
- Reemplazo de diálogos nativos (window.confirm) por modales UI personalizados (Glassmorphism y blur).
- Mejoras en la Minitienda del ClientDashboard y refactorización del SecretariaDashboard con interfaces de gestión compactas.
- Modales restrictivos para justificación de extensión de horarios en CosmiatraDashboard.