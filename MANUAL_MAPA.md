# Manual Técnico — Módulo de Mapa y Geolocalización

Guía técnica para que los distintos equipos del proyecto integren y reutilicen el módulo de mapa (`Leaflet` / `react-leaflet`) ya implementado en Perfil dentro de otros módulos (Donaciones, Beneficiarios, Campañas, Voluntarios, etc.).

---

## 1. Dependencias y Entorno

Ya están instaladas en `frontend/package.json` (no es necesario instalar paquetes nuevos):

- `leaflet` (`^1.9.4`)
- `react-leaflet` (`^4.2.1`)
- `@types/leaflet` (`^1.9.22`)

> **Nota sobre geolocalización:** `navigator.geolocation` requiere un contexto seguro (`HTTPS` en producción o `http://localhost` en desarrollo local).

---

## 2. Arquitectura y Archivos del Módulo

### Frontend
| Archivo | Rol |
| --- | --- |
| `frontend/src/components/mapa/Mapa.tsx` | Componente base reutilizable de mapa (OpenStreetMap + Leaflet). Incluye fix de íconos para Vite, `RecenterMap` y `ResizeMap` (`ResizeObserver`). |
| `frontend/src/components/mapa/MiUbicacion.tsx` | Widget integrado en Perfil para capturar la ubicación puntual del usuario (`getCurrentPosition`), guardarla en backend y mostrarla en `<Mapa />`. |
| `frontend/src/components/mapa/UbicacionTest.tsx` | Ejemplo completo de mapa con múltiples marcadores (`GET /usuarios/ubicaciones`) y rastreo en vivo (`watchPosition` con throttle de 10 s). |
| `frontend/src/pages/Perfil.tsx` | Referencia de integración en una pestaña (`panel-ubicacion` con `<MiUbicacion />`). |
| `frontend/src/api/usuario.api.ts` | Métodos `usuarioApi.getUbicaciones()` y `usuarioApi.actualizarMiUbicacion(...)`. |
| `frontend/src/types/usuario.types.ts` | Interfaces `UbicacionUsuario` y `PuntoMapa`. |

### Backend
| Archivo | Rol |
| --- | --- |
| `backend/src/routes/userRoutes.ts` | Expone `GET /api/usuarios/ubicaciones` y `POST /api/usuarios/mi-ubicacion` (ambas protegidas con `verificarToken`). |
| `backend/src/controllers/userController.ts` | Controladores `obtenerUsuariosConUbicacion` y `actualizarMiUbicacion`. |
| `backend/src/services/usuarioService.ts` | Lógica de negocio para consulta y actualización de coordenadas. |
| `backend/src/repositories/usuarioRepository.ts` | Consultas SQL de ubicaciones geográficas de donantes. |

---

## 3. Contrato de Datos y Endpoints

### Tipos (`frontend/src/types/usuario.types.ts`)

```ts
export interface UbicacionUsuario {
  id: number;
  nombre: string;
  lat: number | string; // PostgreSQL DECIMAL puede llegar como string
  lng: number | string;
  direccion?: string | null;
}

export interface PuntoMapa {
  id: number | string;
  nombre: string;
  lat: number;
  lng: number;
  direccion?: string | null;
}
```

### Endpoints (`frontend/src/api/usuario.api.ts`)

1. **Obtener ubicaciones registradas**
   - **Método:** `GET /api/usuarios/ubicaciones` (requiere JWT)
   - **Cliente:** `usuarioApi.getUbicaciones(): Promise<UbicacionUsuario[]>`
   - **Importante:** Filtrar registros con `lat`/`lng` vacíos o `null` y convertir con `Number(u.lat)` / `Number(u.lng)` antes de pasarlos a `Mapa`.

2. **Guardar / actualizar ubicación del usuario autenticado**
   - **Método:** `POST /api/usuarios/mi-ubicacion` (requiere JWT)
   - **Body:** `{ latitud: number, longitud: number }`
   - **Respuesta:** `{ mensaje: string; ubicacion: { lat: number; lng: number } }`
   - **Cliente:** `usuarioApi.actualizarMiUbicacion({ latitud, longitud })`

---

## 4. API del Componente `<Mapa />` (`frontend/src/components/mapa/Mapa.tsx`)

| Prop | Tipo | Por defecto | Descripción |
| --- | --- | --- | --- |
| `puntos` | `PuntoMapa[]` | *(requerido)* | Lista de marcadores a dibujar en el mapa (cada uno muestra nombre, dirección opcional y coordenadas en `<Popup>`). |
| `centro` | `[number, number]` | `[-16.5, -68.15]` | Coordenada inicial `[lat, lng]` (La Paz, Bolivia por defecto). |
| `zoom` | `number` | `13` | Nivel de zoom inicial. |
| `miUbicacion` | `{ lat: number; lng: number } \| null` | `null` | Si se envía, dibuja un pin verde animado (`liveMarkerIcon`) y centra el mapa en esa coordenada. |
| `className` | `string` | `''` | Clases CSS adicionales para el contenedor. |
| `altura` | `string` | `'420px'` | Alto CSS del contenedor del mapa (ej. `'360px'`, `'100%'`). |

### Características internas ya resueltas en `Mapa.tsx`
- **Pestañas ocultas y modales (`ResizeMap`):** Usa `ResizeObserver` + `map.invalidateSize()` para evitar que el mapa aparezca gris o cortado al mostrarse dentro de pestañas (`hidden`) o modales.
- **Capas (`z-0`):** El contenedor usa `relative z-0`, por lo que no se superpone sobre el sidebar, header o modales (`z-50` / `z-[100]`).
- **Íconos en Vite:** Ya resuelve `markerIcon2x`, `markerIcon` y `markerShadow` para evitar marcadores rotos en build de producción.

---

## 5. Patrones de Integración para Otros Equipos

### Patrón A: Permitir al usuario guardar su ubicación desde otro módulo (ej. Donaciones)
Reutiliza directamente `MiUbicacion`:

```tsx
import { useState } from 'react';
import MiUbicacion from '../components/mapa/MiUbicacion';

const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

<MiUbicacion
  coordenadas={coords}
  onActualizada={(nuevas) => setCoords(nuevas)}
/>
```

### Patrón B: Mostrar múltiples puntos en un mapa (ej. mapa de donantes, recojo o ayudas)
Normaliza los datos al tipo `PuntoMapa[]` y pásalos a `<Mapa />`:

```tsx
import { useEffect, useState } from 'react';
import Mapa from '../components/mapa/Mapa';
import { usuarioApi } from '../api/usuario.api';
import type { PuntoMapa } from '../types/usuario.types';

const [puntos, setPuntos] = useState<PuntoMapa[]>([]);

useEffect(() => {
  usuarioApi.getUbicaciones().then((data) => {
    const validos: PuntoMapa[] = data
      .filter((u) => u.lat != null && u.lng != null && String(u.lat).trim() !== '' && String(u.lng).trim() !== '')
      .map((u) => ({
        id: u.id,
        nombre: u.nombre,
        lat: Number(u.lat),
        lng: Number(u.lng),
        direccion: u.direccion,
      }))
      .filter((p) => !Number.isNaN(p.lat) && !Number.isNaN(p.lng));
    setPuntos(validos);
  });
}, []);

<Mapa puntos={puntos} zoom={13} altura="380px" />
```

> **Tip para otros módulos (Beneficiarios, Campañas, Actividades):** No estás limitado a `usuarioApi.getUbicaciones()`. Cualquier endpoint propio de tu módulo que devuelva `id`, `nombre`, `lat` y `lng` puede mapearse a `PuntoMapa[]` y renderizarse con `<Mapa puntos={...} />`.

### Patrón C: Selección de punto haciendo clic en el mapa (extensión opcional)
Si un equipo necesita que el usuario marque un punto manual haciendo clic en el mapa (por ejemplo, punto de entrega o recojo específico), se puede añadir a `Mapa.tsx` un prop opcional `onSeleccionarUbicacion?: (lat: number, lng: number) => void` usando `useMapEvents` de `react-leaflet`:

```tsx
import { useMapEvents } from 'react-leaflet';

function ClickHandler({ onClick }: { onClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick?.(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}
```

---

## 6. Checklist Rápido antes de Integrar
1. Convertir siempre `lat` y `lng` a `number` y filtrar `NaN` / `null` antes de pasarlos a `Mapa`.
2. Usar `altura` explícita (`'320px'`–`'420px'`) para que Leaflet tenga dimensiones iniciales válidas.
3. Si el mapa vive dentro de un modal, asegurarse de que el modal use un `z-index` mayor a `z-0` (ej. `z-50` o `z-[100]`).
4. Verificar en móvil que el contenedor padre no tenga `overflow-hidden` recortando popups si el mapa es muy bajo.
