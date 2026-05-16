# Plan de Pruebas y Validación (QA) — GlowCare v2.3.0

Este documento es la bitácora de verificación funcional del sistema. Sirve para que el evaluador, el equipo de desarrollo o un tester externo pueda confirmar la integridad y robustez de la plataforma.

---

## 1. Pruebas de Autenticación y Sesión

| ID | Caso de Prueba | Acción | Resultado Esperado |
|----|---------------|--------|--------------------|
| A-01 | Login exitoso — Admin | Ingresar correo de Admin (ver `Credenciales.md`) | Redirección a Panel Maestro. Token en localStorage |
| A-02 | Login exitoso — Cosmiatra | Ingresar correo de Cosmiatra (ver `Credenciales.md`) | Redirección a `/agenda-especialista` |
| A-03 | Login exitoso — Paciente | Ingresar correo de Paciente (ver `Credenciales.md`) | Redirección a `/mi-calendario` |
| A-04 | Login fallido | Ingresar correo no registrado | Mensaje de error visible, sin redirección |
| A-05 | Persistencia de sesión | Hacer F5 estando logueado | La sesión se mantiene activa |
| A-06 | Cierre de sesión | Hacer clic en "Salir" | Limpia localStorage y redirige al Home |
| A-07 | Ruta protegida sin sesión | Intentar acceder a `/admin-dashboard` sin login | Redirección automática al login |
| A-08 | Protección XSS | Ejecutar `document.cookie` en la consola del browser | El token JWT no es visible en las cookies accesibles |

---

## 2. Pruebas de Registro de Paciente (Flujo 2 Pasos)

| ID | Caso de Prueba | Acción | Resultado Esperado |
|----|---------------|--------|--------------------|
| R-01 | Paso 1 completo | Llenar todos los campos de cuenta y continuar | Avanza al Paso 2 de datos clínicos |
| R-02 | Paso 1 incompleto | Intentar avanzar sin llenar campos requeridos | El botón permanece deshabilitado |
| R-03 | Datos clínicos sin alergias | Seleccionar "No tengo alergias" | El campo de detalle no aparece |
| R-04 | Datos clínicos con alergias | Seleccionar "Sí, tengo alergias" | Aparece textarea para describir |
| R-05 | Tratamiento previo positivo | Seleccionar "He recibido tratamientos" | Aparecen campos de tipo y resultado |
| R-06 | Registro completo | Completar ambos pasos y enviar | Redirección a `/login` con registro exitoso |
| R-07 | Correo duplicado | Registrar con un correo ya existente | Error visible "El correo ya se encuentra registrado" |
| R-08 | Contraseña muy corta | Ingresar contraseña de 3 caracteres | Botón deshabilitado hasta alcanzar 6 caracteres |

---

## 3. Pruebas del Panel Administrador

| ID | Caso de Prueba | Acción | Resultado Esperado |
|----|---------------|--------|--------------------|
| AD-01 | Visualizar métricas | Entrar al panel admin | Tarjetas de métricas muestran totales reales de la BD |
| AD-02 | Tabla de pacientes | Ver tabla en el panel | Lista de usuarios con rol `cliente` renderizada |
| AD-03 | Registrar cosmiatra sin contraseña | Llenar modal sin campo de contraseña | El sistema genera una contraseña automática y la muestra |
| AD-04 | Registrar cosmiatra con contraseña | Llenar modal con contraseña personalizada | El sistema usa esa contraseña y la muestra para entregar |
| AD-05 | Correo de cosmiatra duplicado | Intentar registrar con correo existente | Error "Ya existe un usuario con ese correo" |
| AD-06 | Notificaciones | Hacer clic en el ícono de campana | Dropdown con lista de actividad reciente del sistema |
| AD-07 | Cierre del modal | Abrir y cerrar el modal de alta | El formulario se resetea al cerrar |

---

## 4. Pruebas del Panel Cosmiatra

| ID | Caso de Prueba | Acción | Resultado Esperado |
|----|---------------|--------|--------------------|
| C-01 | Ver agenda | Entrar a `/agenda-especialista` | Lista de citas asignadas renderizada desde la BD |
| C-02 | Crear cita manual | Abrir modal y seleccionar paciente + servicio + fecha + hora | Cita creada y visible en la agenda |
| C-03 | Dropdown de pacientes | Abrir modal de nueva cita | Lista de pacientes registrados en el sistema |
| C-04 | Dropdown de servicios | Abrir modal de nueva cita | Lista de 6 servicios con nombre y precio |
| C-05 | Marcar cita realizada | Hacer clic en "Marcar Realizada" | Estado de la cita cambia a `completada` |

---

## 5. Pruebas del Catálogo y Detalle de Servicio

| ID | Caso de Prueba | Acción | Resultado Esperado |
|----|---------------|--------|--------------------|
| S-01 | Catálogo visible sin sesión | Entrar a `/servicios` sin login | Tarjetas de servicios visibles |
| S-02 | Imágenes de servicios | Ver catálogo completo | Todas las imágenes cargan correctamente (incluyendo Drenaje Linfático) |
| S-03 | Descripción en detalle | Hacer clic en cualquier servicio | Página de detalle con descripción completa, beneficios y cuidados |
| S-04 | CTA sin login | Entrar a detalle sin estar logueado | Muestra botones de login/registro, no el de agendar |
| S-05 | CTA con login | Entrar a detalle logueado como cliente | Muestra el botón "Seleccionar Especialista y Agendar" |
| S-06 | Modal de especialistas | Hacer clic en agendar | Modal con lista de cosmiatras disponibles |
| S-07 | Selección de especialista | Seleccionar una cosmiatra | El radio button se marca y el botón de continuar se habilita |

---

## 6. Pruebas del Flujo de Pago

| ID | Caso de Prueba | Acción | Resultado Esperado |
|----|---------------|--------|--------------------|
| P-01 | Selección de método | Entrar a `/checkout` | Se muestran las 3 opciones de pago |
| P-02 | Confirmación de monto | Seleccionar cualquier método | Se muestra el monto en USD y su equivalente en Bs. |
| P-03 | Datos bancarios | Avanzar al paso de cuentas | Se muestran banco, RIF y teléfono con botón copiar |
| P-04 | Copiar al portapapeles | Hacer clic en el ícono de copiar | El valor se copia y el ícono cambia a confirmación verde |
| P-05 | Input de referencia — focus | Tipear dígitos en el campo de referencia | El cursor NO salta ni pierde el foco entre dígitos |
| P-06 | Input de referencia — longitud | Tipear más de 4 dígitos | Se acepta máximo 4 dígitos |
| P-07 | Input de teléfono — focus | Tipear en el campo de teléfono | El cursor NO salta ni pierde el foco |
| P-08 | Botón deshabilitado | Dejar referencia o teléfono incompleto | El botón "Finalizar" permanece deshabilitado (opaco) |
| P-09 | Finalizar agendamiento | Llenar referencia (4 dig.) y teléfono (10 dig.) y enviar | Pantalla de éxito, cita registrada en BD |

---

## 7. Pruebas de Perfil Editable

| ID | Caso de Prueba | Acción | Resultado Esperado |
|----|---------------|--------|--------------------|
| PF-01 | Ver perfil | Entrar a `/perfil` | Datos del usuario actual mostrados |
| PF-02 | Entrar en modo edición | Hacer clic en "Editar Perfil" | Formulario editable activo |
| PF-03 | Subir foto de perfil | Hacer clic en el avatar y seleccionar imagen | Preview de la nueva foto visible inmediatamente |
| PF-04 | Editar nombre | Cambiar el nombre y guardar | El nombre se actualiza en pantalla |
| PF-05 | Cancelar edición | Editar y hacer clic en "Cancelar" | Los campos vuelven a los valores originales |
| PF-06 | Guardar cambios | Completar edición y guardar | Indicador de "Guardado ✓" y modo lectura restaurado |

---

## 8. Pruebas de Seguridad

| ID | Caso de Prueba | Acción | Resultado Esperado |
|----|---------------|--------|--------------------|
| SEC-01 | Acceso directo a API sin token | `GET http://localhost:8003/api/usuarios/clients/` sin header | HTTP 401 Unauthorized |
| SEC-02 | Acceso de cliente a ruta admin | Login como paciente, navegar a `/admin-dashboard` | Redirección o componente vacío (sin datos de admin) |
| SEC-03 | Enumeración de IDs | Intentar `GET /api/citas/1/` (ID numérico) | HTTP 404 (IDs son UUIDs, no secuenciales) |

---

## 9. Pruebas de Infraestructura

| ID | Caso de Prueba | Acción | Resultado Esperado |
|----|---------------|--------|--------------------|
| I-01 | Docker build | `docker-compose up --build` desde raíz | Frontend en 3000 y Backend en 8003 levantados |
| I-02 | Auto-migración | Borrar `db.sqlite3` y reiniciar Docker | BD recreada automáticamente con admin y datos demo |
| I-03 | Hot Reload | Modificar un componente React | Vite actualiza el browser sin recargar la página completa |

---

## ✅ Resumen de Cobertura

| Módulo | Casos Definidos | Estado |
|--------|----------------|--------|
| Autenticación | 8 | ✅ Probado |
| Registro Paciente | 8 | ✅ Probado |
| Panel Admin | 7 | ✅ Probado |
| Panel Cosmiatra | 5 | ✅ Probado |
| Catálogo / Detalle | 7 | ✅ Probado |
| Flujo de Pago | 9 | ✅ Probado |
| Perfil Editable | 6 | ✅ Probado |
| Seguridad | 3 | ✅ Verificado |
| Infraestructura | 3 | ✅ Verificado |
| **TOTAL** | **56** | |

---

*GlowCare QA v2.3.0 — Calidad certificada para presentación académica*
