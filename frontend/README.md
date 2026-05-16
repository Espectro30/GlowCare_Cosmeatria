# GlowCare Frontend — React + Vite v2.2.0

Interfaz de usuario de la plataforma de gestión clínica GlowCare, construida con React 19, Vite 8 y TailwindCSS 3.

## Inicio rápido

```bash
npm install
npm run dev
```

Acceso: **http://localhost:3000**

> El backend debe estar corriendo en `http://localhost:8003`

## Variables de entorno

No se requieren variables de entorno adicionales para desarrollo local. El proxy a la API está configurado en `vite.config.js`.

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Build de producción |
| `npm run preview` | Preview del build de producción |

## Estructura del proyecto

```
src/
├── api/         # Capa de red: axios, auth, appointments, services
├── components/  # Navbar, ProtectedRoute
├── context/     # AuthContext, AuthProvider
├── hooks/       # useAuth
└── pages/       # Todas las páginas de la aplicación
```

## Paleta de colores

- `brand-*` — Verde naturaleza (botones, acentos, dashboards)
- `nut-*` — Beige/avellana (tarjetas informativas, formularios)
- `white` — Fondos de tarjetas y navbar

---
*GlowCare v2.2.0 — Lenguaje de Programación 2*
