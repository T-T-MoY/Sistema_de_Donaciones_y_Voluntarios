import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import type { PuntoMapa } from '../../types/usuario.types';

// ============================================================================
// FIX DE ÍCONOS DE LEAFLET PARA VITE / BUNDLERS
// ============================================================================
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const defaultMarkerIcon = L.icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const liveMarkerIcon = L.divIcon({
  className: 'live-location-pin',
  html: `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;">
      <span style="position: absolute; width: 100%; height: 100%; border-radius: 9999px; background-color: #10b981; opacity: 0.75; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
      <span style="position: relative; width: 16px; height: 16px; border-radius: 9999px; background-color: #059669; border: 2.5px solid #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);"></span>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

// Helper para re-centrar el mapa de forma reactiva
function RecenterMap({ center, zoom }: { center: [number, number]; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom ?? map.getZoom(), { animate: true });
  }, [center, zoom, map]);
  return null;
}

// ============================================================================
// PROPS DEL COMPONENTE MAPA
// ============================================================================
export interface MapaProps {
  /** Lista de usuarios/puntos con id, nombre, lat, lng */
  puntos: PuntoMapa[];
  /** Coordenada de centro inicial [lat, lng]. Por defecto: La Paz, Bolivia [-16.5, -68.15] */
  centro?: [number, number];
  /** Nivel de zoom inicial (por defecto 13) */
  zoom?: number;
  /** Coordenadas en vivo del usuario actual (si están activas) */
  miUbicacion?: { lat: number; lng: number } | null;
  /** Clase CSS para contenedor */
  className?: string;
  /** Altura del mapa (ej. "450px") */
  altura?: string;
}

const CENTRO_LA_PAZ: [number, number] = [-16.5, -68.15];

export const Mapa = ({
  puntos,
  centro = CENTRO_LA_PAZ,
  zoom = 13,
  miUbicacion = null,
  className = '',
  altura = '420px',
}: MapaProps) => {
  const centroActivo: [number, number] = miUbicacion
    ? [miUbicacion.lat, miUbicacion.lng]
    : centro;

  return (
    <div
      className={`relative z-0 overflow-hidden rounded-2xl border border-border shadow-soft bg-surface-elevated ${className}`}
      style={{ height: altura, width: '100%' }}
    >
      <MapContainer
        center={centroActivo}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <RecenterMap center={centroActivo} zoom={zoom} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Marcadores de usuarios donantes */}
        {puntos.map((punto) => (
          <Marker
            key={punto.id}
            position={[punto.lat, punto.lng]}
            icon={defaultMarkerIcon}
          >
            <Popup>
              <div className="p-1 text-night">
                <div className="flex items-center gap-1.5 font-bold text-sm text-night">
                  <span className="inline-block h-2 w-2 rounded-full bg-gold" />
                  {punto.nombre}
                </div>
                {punto.direccion && (
                  <p className="mt-1 text-xs text-night/70">
                    📍 {punto.direccion}
                  </p>
                )}
                <div className="mt-2 text-[10.5px] font-mono text-night/60 border-t border-night/10 pt-1">
                  Lat: {punto.lat.toFixed(5)} · Lng: {punto.lng.toFixed(5)}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Marcador de mi ubicación en vivo */}
        {miUbicacion && (
          <Marker
            position={[miUbicacion.lat, miUbicacion.lng]}
            icon={liveMarkerIcon}
          >
            <Popup>
              <div className="p-1 text-night">
                <div className="flex items-center gap-1.5 font-bold text-sm text-emerald-700">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Tu ubicación en vivo
                </div>
                <p className="mt-1 text-xs text-night/70">
                  Transmitiendo posición en tiempo real para donaciones.
                </p>
                <div className="mt-2 text-[10.5px] font-mono text-emerald-800 font-semibold border-t border-night/10 pt-1">
                  Lat: {miUbicacion.lat.toFixed(5)} · Lng: {miUbicacion.lng.toFixed(5)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default Mapa;
