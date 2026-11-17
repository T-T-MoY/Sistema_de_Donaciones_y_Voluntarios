# Rebrand — Deportivo → Donaciones y Voluntariados

Registro del cambio de identidad del frontend: de una plataforma de reservas de
canchas ("SportPlex") a un **Sistema de Donaciones y Voluntariados**.

El backend ya mapea los roles antiguos a los nuevos nombres visibles
(`cliente → Donante`, `empleado → Voluntario`). El frontend **no** cambia los
identificadores internos: solo traduce etiquetas en el render.

---

## 1. Archivos modificados

### Pasada 1 (rebrand base)

| Archivo | Antes | Después |
| --- | --- | --- |
| `public/favicon.svg` | Ícono deportivo | Ícono de donaciones |
| `index.html` | Título/meta de complejo deportivo | Título/meta de Donaciones y Voluntariados |
| `package.json` | Nombre de proyecto deportivo | Nombre de la plataforma actual |
| `src/components/layout/Navbar.tsx` | Menú de canchas/reservas/eventos | Menú de la plataforma; rutas inexistentes como `En desarrollo` |
| `src/components/layout/LandingNavbar.tsx` | Enlaces y marca deportiva | Marca y enlaces de donaciones/voluntariado |
| `src/components/layout/Footer.tsx` | Textos de complejo | Textos de la plataforma |
| `src/components/layout/Header.tsx` | Título "SportPlex" | Título "Donaciones y Voluntariados" |
| `src/components/landing/Hero.tsx` | Hero de reservas de canchas | Hero de donaciones y voluntariado |
| `src/components/landing/HowItWorks.tsx` | Pasos: buscar cancha, reservar, jugar | Pasos: registrarse, donar, participar |
| `src/components/landing/ServicesShowcase.tsx` | Servicios del complejo deportivo | Campañas, donaciones y voluntariados |
| `src/pages/Login.tsx` | Copy de reservas | Copy de acceso a la plataforma |

### Pasada 2 (esta sesión)

| Archivo | Antes | Después |
| --- | --- | --- |
| `src/pages/Registro.tsx` | "Una cuenta, todas las canchas", "reservar", "partido" | "Una cuenta, todo el impacto", "participar", voluntariados/donaciones |
| `src/pages/SolicitarRecuperacion.tsx` | "volver a la cancha" | "recuperar el acceso a tu cuenta" |
| `src/pages/Dashboard.tsx` | KPIs y módulos de canchas, reservas, torneos, partidos | KPIs y módulos de campañas, donaciones, beneficiarios y voluntariados; módulos con ruta inexistente marcados como `En desarrollo` |
| `src/pages/Perfil.tsx` | "Así te identificamos en cada reserva" | "Así te identificamos en la plataforma" |
| `src/components/usuarios/UsuarioCard.tsx` | Render de `rol` crudo (Cliente/Empleado) | Render con `getRolDisplay()` → Donante/Voluntario |
| `src/components/usuarios/UsuarioList.tsx` | Filtro y celdas con rol crudo; alertas con "reservas" | Rol visible mapeado; alertas con "donaciones" |
| `src/components/usuarios/UsuarioModal.tsx` | Opciones "Cliente"/"Empleado"; placeholder "Recepcionista"; "Datos laborales"/"Fecha de contratación" | Opciones "Donante"/"Voluntario"; placeholder "Coordinador de voluntariado"; "Datos de voluntariado"/"Fecha de incorporación" |
| `src/components/layout/Header.tsx` | Claves `/canchas` y `/reservas` en `titulosPorRuta` | Claves eliminadas (esas rutas no existen: caen en el fallback) |
| `src/types/usuario.types.ts` | Sin helper de etiqueta de rol | Nuevo `getRolDisplay()` (solo render; el tipo `Rol` queda intacto) |
| `src/index.css` | Comentarios con "cancha"/"estadio"/`canchas-landing.css` | Comentarios neutros (sin cambios de CSS) |

### Revisados sin cambios

| Archivo | Motivo |
| --- | --- |
| `src/pages/UsuariosPage.tsx` | Solo compone `<UsuarioList modo="app" />`; sin textos propios |
| `src/pages/Home.tsx` | Solo compone Hero / HowItWorks / ServicesShowcase; sin residuos deportivos |

---

## 2. Enlaces deshabilitados como "En desarrollo"

Rutas realmente existentes en `App.tsx`: `/`, `/login`, `/registro`,
`/solicitar-recuperacion`, `/reset-password`, `/dashboard`, `/perfil`,
`/usuarios` (solo admin). Todo lo demás se muestra deshabilitado.

Patrón usado (igual que `Navbar`): `<span>` con
`opacity-50 cursor-not-allowed pointer-events-none` y `aria-disabled="true"`,
en lugar de `<Link>`/`<NavLink>`.

| Ubicación | Elemento |
| --- | --- |
| `Navbar` | Canchas, Reservas, Gestión de Reservas, Eventos, Mis Inscripciones, Gestión de Eventos, Reportes |
| `Dashboard` → `MODULOS_ADMIN` | Gestión de Donaciones, Verificar Pagos, Gestión de Campañas, Gestión de Voluntariados, Reportes y Métricas |
| `Dashboard` → `MODULOS_EMPLEADO` | Verificar Pagos, Gestión de Voluntariados, Gestión de Campañas |
| `Dashboard` → `MODULOS_CLIENTE` | Campañas Solidarias, Mis Donaciones, Voluntariados, Mis Voluntariados |
| `Dashboard` → CTA del header | "Explorar Usuarios" solo para admin (link a `/usuarios`); para el resto, "En desarrollo" |

> `/usuarios` existe, pero está protegida por `RutasAdmin`: un usuario sin rol
> administrador es redirigido a `/dashboard`. Por eso el CTA del header no se
> muestra como enlace a esos roles.

---

## 3. Deuda técnica

1. **`Rol` con nombres antiguos** — `src/types/usuario.types.ts`:
   ```ts
   export type Rol = 'Cliente' | 'Empleado' | 'Admin' | 'Administrador';
   ```
   Se mantiene para no romper el contrato con el backend ni los formularios.
   La traducción a Donante/Voluntario se hace solo en el render con
   `getRolDisplay()`.

2. **`src/utils/validaciones.ts`** — las validaciones están condicionadas por
   `'Cliente'`/`'Empleado'`. Deben migrarse cuando el backend use los roles
   nuevos de forma nativa.

3. **`src/pages/Perfil.tsx`** — `esCliente` / `esEmpleado` derivan de
   `'cliente'` / `'empleado'`. Son identificadores de lógica, no etiquetas:
   se dejan como están.

4. **Rol visible en `Perfil`** — la tarjeta lateral muestra el rol tal como
   llega del backend. Si el backend no lo mapea, se verá "Cliente"/"Empleado".

5. **`/reportes` en `Header.tsx`** — la clave sigue en `titulosPorRuta`
   aunque la ruta no existe en `App.tsx` (el fallback redirige a `/`, así que
   es inofensiva, pero es una entrada muerta).

6. **Rutas internas heredadas** — `Navbar` y `Dashboard` conservan strings como
   `/canchas`, `/reservas` o `/gestion-reservas` como claves de items
   deshabilitados. No navegan a ningún lado; conviene limpiarlas cuando los
   módulos reales estén definidos.

7. **Nombre de clase CSS `pitch-lines`** — clase utilitaria de fondo de rejilla
   que conserva el nombre deportivo. Renombrarla implica tocar los componentes
   que la usan, fuera del alcance de este rebrand.

---

## 4. Nota sobre el backend

El backend ya expone `cliente → Donante` y `empleado → Voluntario` en las
respuestas visibles. Mientras el frontend siga enviando `rol: 'Cliente'` o
`rol: 'Empleado'` en los formularios, el mapeo ocurre del lado del servidor y
la UI muestra la etiqueta nueva vía `getRolDisplay()`.
