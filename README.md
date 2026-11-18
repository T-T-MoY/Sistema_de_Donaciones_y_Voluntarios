<div align="center">

# 🤝 Sistema de Donaciones y Voluntariados

**Plataforma para conectar donantes, voluntarios y beneficiarios:** gestión de usuarios por rol, donaciones en especie, campañas solidarias y trazabilidad de la ayuda con una interfaz accesible en modo claro y oscuro.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4.3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Neon](https://img.shields.io/badge/Neon-00E599?style=for-the-badge&logo=neon&logoColor=black)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

</div>

---

## 🌐 URLs de Producción

| Servicio | URL |
|---|---|
| **Frontend** | https://sistema-de-donaciones-y-voluntarios-6qezhebag-yuners1.vercel.app |
| **Backend API** | https://sistema-de-donaciones-y-voluntarios.onrender.com/api |
| **Health check** | https://sistema-de-donaciones-y-voluntarios.onrender.com/api/health |

---

## 🧱 Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Backend** | Node.js 20 · Express 4 · TypeScript |
| **Base de datos** | PostgreSQL 16 vía `pg` (SQL puro, sin ORM) |
| **Autenticación** | JWT (`jsonwebtoken`) + `bcrypt` |
| **Archivos** | `multer` (fotos de perfil) |
| **Correo** | `nodemailer` (recuperación de contraseña) |
| **Frontend** | React 18 · Vite 8 · TypeScript |
| **Ruteo** | React Router 7 |
| **Cliente HTTP** | Axios |
| **Estilos** | **Tailwind CSS 4.3** (plugin `@tailwindcss/vite`, sin PostCSS) |
| **Animación** | CSS puro: `@keyframes`, `@utility` y tokens de easing |

### Tailwind CSS v4

- La configuración vive **solo** en `frontend/src/index.css`: `@import "tailwindcss"`, `@custom-variant dark` y `@theme`.
- Ya **no existen** `tailwind.config.js` ni `postcss.config.js`; el plugin `@tailwindcss/vite` hace el trabajo.
- El modo oscuro se activa con la clase `.dark` en `<html>` (`ThemeContext`).
- Los tokens de color, sombras, easings y animaciones están declarados como variables CSS dentro de `@theme`.

---

## ☁️ Infraestructura Online

### 🗄️ Base de datos — Neon

- **Proveedor:** [Neon](https://neon.tech) — PostgreSQL 16 serverless
- **Región:** AWS us-east-2
- **Base de datos:** `neondb`
- **Conexión:** pooled connection string con `sslmode=require`

El backend detecta automáticamente la variable `DATABASE_URL` y configura SSL. Si no existe, cae en las variables individuales `DB_HOST / DB_PORT / DB_USER / DB_PASSWORD / DB_NAME` para desarrollo local con Docker.

### 🚀 Backend — Render

- **Proveedor:** [Render](https://render.com) — Web Service
- **Runtime:** Node.js 20
- **Root dir:** `backend/`
- **Build:** `npm install && npm run build`
- **Start:** `npm start` (`node dist/server.js`)
- **Health check:** `/api/health`

#### Variables de entorno requeridas en Render

| Variable | Descripción |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `4000` |
| `DATABASE_URL` | Connection string de Neon (con SSL) |
| `JWT_SECRET` | Clave segura para firmar tokens |
| `EMAIL_USER` | Cuenta Gmail para envío de correos |
| `EMAIL_PASS` | App Password de Gmail |
| `FRONTEND_URL` | URL de Vercel (para CORS) |

> [!NOTE]
> El plan gratuito de Render hiberna el servicio tras 15 min de inactividad. El primer request puede tardar ~30 segundos en despertar.

### ⚡ Frontend — Vercel

- **Proveedor:** [Vercel](https://vercel.com)
- **Framework:** Vite
- **Root dir:** `frontend/`
- **Build:** `npm run build`
- **Output:** `dist/`
- **SPA routing:** `vercel.json` con rewrite `/* → /index.html`

#### Variable de entorno requerida en Vercel

| Variable | Valor |
|---|---|
| `VITE_API_URL` | `https://sistema-de-donaciones-y-voluntarios.onrender.com/api` |

> [!IMPORTANT]
> Las variables `VITE_*` se embeben en el bundle en tiempo de build. Si cambias `VITE_API_URL`, debes hacer un **Redeploy** en Vercel para que tome efecto.

---

## 🎨 Sistema de Diseño

### Paleta ONG (Solidaridad Nocturna)

La identidad combina un **azul marino profundo** (confianza, transparencia) con un **dorado cálido** (cercanía, acción solidaria) y un **crema** de apoyo para fondos. Todos los pares texto/fondo cumplen **WCAG AA**.

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `primary` | `#16294F` | `#E8B960` | Acciones primarias, enlaces, foco |
| `accent` | `#D4A24C` | `#E8B960` | Énfasis, badges, elementos de marca |
| `surface` | `#FFFDF8` | `#0F1A2E` | Fondo de las tarjetas |
| `surface-elevated` | `#FFFFFF` | `#162544` | Tarjetas que flotan |
| `surface-sunken` | `#F7F3EA` | `#080E1A` | Fondo de página e inputs |
| `text` | `#0A1428` | `#F6F7FB` | Texto principal |
| `text-muted` | `#4C5871` | `#A8B6CE` | Texto secundario |

---

## 🖥️ Pantallas

| Ruta | Pantalla |
|---|---|
| `/` | Landing — Hero con panel de impacto, pasos, roles y cinta animada |
| `/login` | Inicio de sesión |
| `/registro` | Registro con medidor de contraseña |
| `/dashboard` | Panel con KPIs y módulos |
| `/usuarios` | Gestión de usuarios (admin) |
| `/perfil` | Perfil con avatar y formulario por secciones |
| `/solicitar-recuperacion` · `/reset-password` | Recuperación de contraseña por correo |

---

## 🧪 Usuarios de Prueba

> [!NOTE]
> Datos cargados por `database/02_inserts.sql`. Contraseña de todos: **`123456`**

| Rol | Correo | Estado |
|---|---|---|
| Administrador (SUPERADMIN) | `carla.admin@donacionesbo.org` | Activo |
| Administrador (GENERAL) | `jorge.admin@donacionesbo.org` | Activo |
| Beneficiario (Persona) | `rosa.chambi@gmail.com` | Activo |
| Beneficiario (Familia) | `hector.poma@gmail.com` | Activo |
| Beneficiario (Institución) | `comedor.esperanza@gmail.com` | Activo |
| Donante | `diego.ramirez@gmail.com` | Activo |
| Donante | `sofia.paredes@gmail.com` | Activo |
| Donante | `andres.guzman@gmail.com` | Activo |
| Donante | `paola.duran@gmail.com` | Inactivo |
| Voluntario | `luis.choque@gmail.com` | Activo |
| Voluntario | `valeria.nina@gmail.com` | Activo |
| Voluntario | `sebastian.vega@gmail.com` | Activo |

---

## 🧩 Endpoints

| Módulo | Endpoint | Descripción |
|---|---|---|
| 🔐 Autenticación | `/api/auth` | Registro público, login con JWT y recuperación de contraseña por correo |
| 👤 Usuarios | `/api/usuarios` | Perfil propio y, desde el panel admin, listado, creación, edición, estado y eliminación |
| 🩺 Health | `/api/health` | Estado del servidor y timestamp |

---

<div align="center">

⬆️ [Volver arriba](#-sistema-de-donaciones-y-voluntariados)

</div>
