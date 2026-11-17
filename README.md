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
- 📌 [Notas y Pendientes](#-notas-y-pendientes)

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
- Los tokens de color, sombras, easings y animaciones están declarados como variables CSS dentro de `@theme`, por lo que se consumen como utilidades normales (`bg-claro-primario`, `shadow-lift`, `ease-out-soft`, `animate-modal-in`).

---

## 🎨 Sistema de Diseño

### Paleta ONG

La identidad combina un **teal profundo** (confianza, transparencia, trabajo comunitario) con un **ámbar cálido** (calidez, cercanía, acción solidaria) y un **terracota** de apoyo para alertas y acentos. Todos los pares texto/fondo cumplen **WCAG AA**.

| Token | Claro | Uso | Contraste |
|---|---|---|---|
| `claro-primario` | `#0E6E6D` | Acciones primarias, enlaces, foco | 6.0:1 sobre blanco |
| `claro-hover` | `#0A5A59` | Hover de acciones primarias | 7.8:1 sobre blanco |
| `claro-acento` | `#B4491F` | Errores, énfasis, terracota | 5.1:1 sobre blanco |
| `claro-fondo` | `#FAFBF6` | Superficie de página | — |
| `claro-tarjeta` | `#FFFFFF` | Tarjetas y paneles | — |
| `claro-borde` | `#E1E7E2` | Bordes neutros | — |
| `claro-texto` | `#152847` | Texto principal | 13.5:1 sobre blanco |
| `claro-texto2` | `#51607A` | Texto secundario | 6.2:1 sobre blanco |

| Token | Oscuro | Uso |
|---|---|---|
| `oscuro-primario` | `#5ED0CB` | Acciones primarias (teal luminoso) |
| `oscuro-acento` | `#FF9B85` | Acentos y alertas (coral) |
| `oscuro-fondo` | `#0F2233` | Fondo de página |
| `oscuro-tarjeta` | `#132B3B` | Tarjetas y paneles |
| `oscuro-borde` | `#26404F` | Bordes |
| `oscuro-texto` | `#F5F7FA` | Texto principal |
| `oscuro-texto2` | `#A8B8C4` | Texto secundario |

**Marca "Arena"** (landing y pantallas de acceso): `arena-base #0B3B3A`, `arena-deep #082C2B`, `arena-night #071F24`, `arena-accent #F5B267`, `arena-accent-soft #FFD9A8`, `arena-ivory #F6F3EA`, `arena-ink #0A2322`.

> **Justificación:** el teal profundo transmite confianza institucional y rinde AA con texto blanco; el ámbar funciona como color de acción sobre superficies oscuras sin competir con el teal; el terracota aporta un acento humano y mantiene legibilidad en errores y estados de riesgo.

### Movimiento

Principios aplicados (skills de Emil Kowalski: `animate`, `emil-design-eng`, `review-animations`, `remove-animations`, `find-animation-opportunities`, `improve-animations`, `apple-design`, `gestures`):

- Entradas con **ease-out** fuerte (`cubic-bezier(0.23, 1, 0.32, 1)`), **150–300 ms**; modales hasta 500 ms.
- Solo se animan **`transform`** y **`opacity`** (compositor, sin reflow).
- Sin `scale(0)`: los orígenes parten de `scale(0.985)` para no convertirse en "pop".
- Sin `transition: all`: cada transición declara sus propiedades.
- Hover gateado por `@media (hover: hover)` en Tailwind v4 y transformaciones con `motion-safe:`.
- `prefers-reduced-motion` conserva el cambio de color pero elimina desplazamientos.
- Feedback de presión unificado con la utilidad `press` (`scale(0.97)` en `:active`).

### Utilidades propias

`anim-rise`, `anim-fade`, `press`, `pitch-lines`, `pitch-lines-ink`, `marquee-track`, `marquee-mask`, `auth-photo`.

---

## 🖥️ Pantallas

| Ruta | Pantalla | Rediseño |
|---|---|---|
| `/` | Landing | Hero con panel de impacto, pasos, roles y cinta animada |
| `/login` | Inicio de sesión | Split screen, panel con barra de acento, CTA ámbar |
| `/registro` | Registro | Card elevada, medidor de contraseña, mensajes AA |
| `/dashboard` | Panel | KPIs, módulos, header con degradado de marca |
| `/usuarios` | Gestión de usuarios (admin) | KPIs laterales, filtros, tabla y cards móviles |
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
│       ├── models/          # Consultas SQL
│       ├── routes/          # authRoutes, userRoutes
│       ├── middlewares/     # JWT y roles
│       ├── validators/ utils/ types/
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
> `.env` no se versiona. Creá uno en la raíz (lo usa `compose.yaml`) y otro en `backend/` con los mismos valores de base de datos.

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

```bash
# Todo con Docker
docker compose up -d --build
```

```bash
# Modo desarrollo: solo la base de datos
docker compose up -d db

# Backend
cd backend && npm install && npm run dev

# Frontend (otra terminal)
cd frontend && npm install && npm run dev
```

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

```bash
# Logs de la base de datos
docker logs postgres-db-donaciones_y_voluntariado

# Reiniciar servicios
docker compose down
docker compose up -d

# Reconstruir backend tras cambiar dependencias
docker compose up -d --build backend
```

---

## 📌 Notas y Pendientes

- Los módulos de campañas, donaciones, voluntariados y reportes están marcados como **"En desarrollo"** en la navegación.
- `frontend/src/App.css` quedó sin uso tras la migración a Tailwind v4; se puede eliminar en una limpieza futura.
- La utilidad `pitch-lines` conserva un nombre heredado del proyecto anterior: hoy dibuja una retícula, no líneas de cancha.
- Verificá que `/api/usuarios` restrinja las operaciones de escritura a administradores antes de producción.
- `frontend/REBRAND_NOTES.md` documenta el cambio de textos y de identidad de la plataforma.

---

<div align="center">

⬆️ [Volver arriba](#-sistema-de-donaciones-y-voluntariados)

</div>
