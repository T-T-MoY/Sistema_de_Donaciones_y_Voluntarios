import { useMemo, useState } from 'react';
import { usuarioApi } from '../../api/usuario.api';
import Mapa from './Mapa';

interface Coordenadas {
  lat: number;
  lng: number;
}

interface MiUbicacionProps {
  coordenadas: Coordenadas | null;
  onActualizada: (coordenadas: Coordenadas) => void;
}

const CENTRO_LA_PAZ: [number, number] = [-16.5, -68.15];

export default function MiUbicacion({ coordenadas, onActualizada }: MiUbicacionProps) {
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const centro = useMemo<[number, number]>(
    () => coordenadas ? [coordenadas.lat, coordenadas.lng] : CENTRO_LA_PAZ,
    [coordenadas?.lat, coordenadas?.lng]
  );

  const guardarUbicacionActual = () => {
    if (!navigator.geolocation) {
      setMensaje('Este navegador no permite acceder a la ubicación.');
      return;
    }

    setGuardando(true);
    setMensaje('Obteniendo tu ubicación…');
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const nueva = { lat: coords.latitude, lng: coords.longitude };
      try {
        await usuarioApi.actualizarMiUbicacion({ latitud: nueva.lat, longitud: nueva.lng });
        onActualizada(nueva);
        setMensaje('Tu ubicación se guardó en el perfil.');
      } catch (error: any) {
        setMensaje(error.response?.data?.error || 'No se pudo guardar la ubicación. Intentá nuevamente.');
      } finally {
        setGuardando(false);
      }
    }, (error) => {
      const detalle = error.code === error.PERMISSION_DENIED
        ? 'Permití el acceso a la ubicación en el navegador.'
        : error.code === error.TIMEOUT
          ? 'Se agotó el tiempo para obtener la ubicación. Intentá nuevamente.'
          : 'La ubicación no está disponible en este momento.';
      setMensaje(detalle);
      setGuardando(false);
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 });
  };

  return (
    <section className="space-y-4" aria-labelledby="mi-ubicacion-titulo">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 id="mi-ubicacion-titulo" className="font-display text-base font-bold text-text">Mi ubicación</h2>
          <p className="mt-1 text-sm text-text-muted">
            {coordenadas
              ? `Guardada: ${coordenadas.lat.toFixed(5)}, ${coordenadas.lng.toFixed(5)}`
              : 'Aún no guardaste una ubicación en tu perfil.'}
          </p>
        </div>
        <button
          type="button"
          onClick={guardarUbicacionActual}
          disabled={guardando}
          className="press inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-on-primary hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21s7-4.35 7-11a7 7 0 10-14 0c0 6.65 7 11 7 11z" />
            <circle cx="12" cy="10" r="2.5" strokeWidth={2} />
          </svg>
          {guardando ? 'Obteniendo ubicación…' : coordenadas ? 'Actualizar ubicación' : 'Usar mi ubicación'}
        </button>
      </div>
      {mensaje && <p role="status" className="text-xs text-text-muted">{mensaje}</p>}
      <Mapa
        puntos={[]}
        miUbicacion={coordenadas}
        centro={centro}
        zoom={coordenadas ? 15 : 12}
        altura="360px"
      />
    </section>
  );
}
