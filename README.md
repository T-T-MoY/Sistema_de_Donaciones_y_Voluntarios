<div align="center">

# 🤝 Sistema de Donaciones y Voluntariados

**Plataforma para conectar donantes, voluntarios y beneficiarios:** gestión de usuarios por rol, donaciones en especie, campañas solidarias y trazabilidad de la ayuda con una interfaz accesible en modo claro y oscuro.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4.3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

</div>

---

## 📚 Tabla de Contenidos

- 🧱 [Stack Tecnológico](#-stack-tecnológico)
- 🎨 [Sistema de Diseño](#-sistema-de-diseño)
- 🖥️ [Pantallas](#️-pantallas)
- 📁 [Estructura del Proyecto](#-estructura-del-proyecto)
- 🚀 [Puesta en Marcha](#-puesta-en-marcha)
- 🧩 [Endpoints](#-endpoints)
- 🛠️ [Comandos Útiles](#️-comandos-útiles)

---

## 🧱 Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Backend** | Node.js 20 · Express 4 · TypeScript |
| **Base de datos** | PostgreSQL 15 vía `pg` (SQL puro, sin ORM) |
| **Autenticación** | JWT (`jsonwebtoken`) + `bcrypt` |
| **Archivos** | `multer` (fotos de perfil) |
| **Correo** | `nodemailer` (recuperación de contraseña) |
| **Frontend** | React 18 · Vite 8 · TypeScript |
| **Ruteo** | React Router 7 |
| **Cliente HTTP** | Axios |
| **Estilos** | **Tailwind CSS 4.3** (plugin `@tailwindcss/vite`, sin PostCSS) |
| **Animación** | CSS puro: `@keyframes`, `@utility` y tokens de easing |
| **Infraestructura** | Docker Compose |

### Tailwind CSS v4

- La configuración vive **solo** en `frontend/src/index.css`: `@import "tailwindcss"`, `@custom-variant dark` y `@theme`.
- Ya **no existen** `tailwind.config.js` ni `postcss.config.js`; el plugin `@tailwindcss/vite` hace el trabajo.
- El modo oscuro se activa con la clase `.dark` en `<html>` (`ThemeContext`).
- Los tokens de color, sombras, easings y animaciones están declarados como variables CSS dentro de `@theme`, por lo que se consumen como utilidades normales (`bg-primary`, `shadow-lift`, `ease-out-soft`, `animate-modal-in`).

---

## 🎨 Sistema de Diseño

### Paleta ONG (Solidaridad Nocturna)

La identidad combina un **azul marino profundo** (confianza, transparencia, trabajo comunitario) con un **dorado cálido** (calidez, cercanía, acción solidaria) y un **crema** de apoyo para fondos. Todos los pares texto/fondo cumplen **WCAG AA**.

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `primary` | `#16294F` | `#E8B960` | Acciones primarias, enlaces, foco |
| `accent` | `#D4A24C` | `#E8B960` | Énfasis, badges, elementos de marca |
| `surface` | `#FFFDF8` | `#0F1A2E` | Fondo de las tarjetas |
| `surface-elevated` | `#FFFFFF` | `#162544` | Tarjetas que flotan |
| `surface-sunken` | `#F7F3EA` | `#080E1A` | Fondo de página e inputs |
| `text` | `#0A1428` | `#F6F7FB` | Texto principal |
| `text-muted` | `#4C5871` | `#A8B6CE` | Texto secundario |

**Marca "Arena"** (landing y pantallas de acceso): `night #0B1730`, `cream #F7F3EA`, `gold #D4A24C`.

> **Justificación:** el azul marino transmite confianza institucional y rinde AA con texto blanco; el dorado funciona como color de acción y acento humano, destacando perfectamente sobre fondos oscuros.

### Movimiento

Principios aplicados (skills de Emil Kowalski: `animate`, `emil-design-eng`, `review-animations`, `remove-animations`, `find-animation-opportunities`, `improve-animations`, `apple-design`, `gestures`):

- Entradas con **ease-out** fuerte (`cubic-bezier(0.22, 1, 0.36, 1)`), **150–300 ms**; modales hasta 500 ms.
- Solo se animan **`transform`** y **`opacity`** (compositor, sin reflow).
- Sin `scale(0)`: los orígenes parten de `scale(0.975)` para evitar el efecto "pop".
- Sin `transition: all`: cada transición declara sus propiedades.
- Hover gateado por `@media (hover: hover)` en Tailwind v4 y transformaciones con `motion-safe:`.
- `prefers-reduced-motion` conserva el cambio de color pero elimina desplazamientos.
- Feedback de presión unificado con la utilidad `press` (`scale(0.97)` en `:active`).

### Utilidades propias

`anim-rise`, `anim-fade`, `press`, `grid-paper`, `grid-paper-light`, `marquee-track`, `marquee-mask`, `auth-photo`, `glass-night`.

---

## 🖥️ Pantallas

| Ruta | Pantalla | Rediseño |
|---|---|---|
| `/` | Landing | Hero con panel de impacto, pasos, roles y cinta animada |
| `/login` | Inicio de sesión | Fondo continuo, panel con barra de acento, toggle de tema integrado |
| `/registro` | Registro | Mismo layout que Login, medidor de contraseña, secciones |
| `/dashboard` | Panel | KPIs, módulos, header con degradado de marca |
| `/usuarios` | Gestión de usuarios (admin) | KPIs, filtros, tabla y cards móviles |
| `/perfil` | Perfil | Tarjeta de avatar, formulario por secciones, feedback AA |
| `/solicitar-recuperacion` · `/reset-password` | Recuperación | Mismo lenguaje visual que Login/Registro |

Rutas en desarrollo: campañas, donaciones, voluntariados, reportes y demás módulos muestran el estado "En desarrollo"; no se eliminó ningún componente ni se alteró la lógica de datos.

---

## 📁 Estructura del Proyecto

```text
Sistema de Donaciones y Voluntariados/
├── compose.yaml
├── .env                     # No versionado — se crea localmente
├── database/
│   ├── 01_schema.sql        # Tablas, relaciones y restricciones
│   └── 02_inserts.sql       # Datos de prueba
├── backend/
│   ├── Dockerfile
│   └── src/
│       ├── server.ts / app.ts
│       ├── config/          # Conexión a PostgreSQL
│       ├── controllers/     # req/res por endpoint
│       ├── services/        # Lógica de negocio
│       ├── repositories/    # Acceso a datos
│       ├── models/          # Tipos e interfaces
│       ├── routes/          # authRoutes, userRoutes
│       ├── middlewares/     # JWT y roles
│       └── validators/ utils/ types/
└── frontend/
    ├── vite.config.ts       # react + tailwindcss + svgr
    └── src/
        ├── index.css        # @theme, keyframes, utilidades, base
        ├── App.tsx / main.tsx
        ├── api/             # Cliente Axios e interceptores
        ├── context/         # AuthContext, ThemeContext
        ├── hooks/
        ├── components/
        │   ├── landing/     # Hero, HowItWorks, ServicesShowcase
        │   ├── layout/      # PublicLayout, AppLayout, Navbar, Header, Footer
        │   ├── usuarios/    # UsuarioList, UsuarioCard, UsuarioModal
        │   ├── guards/      # RutasProtegidas, RutasAdmin
        │   └── ui/          # FieldError, ThemeToggle
        ├── pages/
        ├── types/
        └── utils/
```

---

## 🚀 Puesta en Marcha

### Requisitos

| Herramienta | Versión |
|---|---|
| Node.js | 20+ |
| Docker Desktop | última estable |
| Git | cualquiera |

### 1️⃣ Clonar

```bash
git clone https://github.com/T-T-MoY/Sistema_de_Donaciones_y_Voluntarios.git
cd Sistema_de_Donaciones_y_Voluntarios
```

### 2️⃣ Variables de entorno

> [!IMPORTANT]
> `.env` no se versiona. Crea uno en la raíz (lo usa `compose.yaml`) y otro en `backend/` con los mismos valores de base de datos.

```env
PORT=4000

DB_USER=<usuario>
DB_PASSWORD=<contraseña>
DB_HOST=localhost
DB_PORT=5432
DB_NAME=<base_de_datos>

JWT_SECRET=<secreto_propio>

EMAIL_USER=<correo_remitente>
EMAIL_PASS=<contraseña_de_aplicación>
FRONTEND_URL=http://localhost:5173
```

### 3️⃣ Levantar el proyecto

Consulta la sección de [Comandos Útiles](#️-comandos-útiles) para levantar el proyecto en modo desarrollo o en producción.

| Servicio | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API | http://localhost:4000/api |
| Health check | http://localhost:4000/api/health |

### 4️⃣ Validar el frontend

```bash
cd frontend
npx tsc --noEmit    # tipos
npm run build       # tsc + vite build
```

---

## 🧩 Endpoints

| Módulo | Endpoint | Descripción |
|---|---|---|
| 🔐 Autenticación | `/api/auth` | Registro público, login con JWT y recuperación de contraseña por correo. |
| 👤 Usuarios | `/api/usuarios` | Perfil propio y, desde el panel admin, listado, creación, edición, estado y eliminación. |

---

## 🛠️ Comandos Útiles

### 💻 Modo Desarrollo (Local)

Para trabajar con hot-reload tanto en el backend como en el frontend.

```bash
# 1. Levantar solo la base de datos en Docker
docker compose up -d db

# 2. Iniciar el Backend (en una terminal)
cd backend
npm install
npm run dev

# 3. Iniciar el Frontend (en otra terminal)
cd frontend
npm install
npm run dev
```

### 🚀 Despliegue Final (Docker Completo)

Para levantar todo el ecosistema (base de datos + backend + frontend) en contenedores.

```bash
# Construir y levantar todos los servicios
docker compose up -d --build
```

### 🔧 Mantenimiento y Logs

```bash
# Ver logs de la base de datos
docker logs postgres-db-donaciones_y_voluntariado

# Detener todos los servicios
docker compose down

# Reiniciar servicios (sin reconstruir)
docker compose up -d

# Reconstruir solo el backend tras cambiar dependencias
docker compose up -d --build backend
```

---

<div align="center">

⬆️ [Volver arriba](#-sistema-de-donaciones-y-voluntariados)

</div>