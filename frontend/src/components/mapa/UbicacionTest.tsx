import { useState, useEffect, useRef, useCallback } from 'react';
import { usuarioApi } from '../../api/usuario.api';
import type { PuntoMapa } from '../../types/usuario.types';
import Mapa from './Mapa';

export interface UbicacionTestProps {
  /** Callback opcional cuando se actualiza la posición del usuario */
  onUbicacionActualizada?: (lat: number, lng: number) => void;
  /** Mostrar u ocultar la tarjeta de cabecera con el título */
  mostrarCabecera?: boolean;
}

export const UbicacionTest = ({
  onUbicacionActualizada,
  mostrarCabecera = true,
}: UbicacionTestProps) => {
  // Lista de usuarios donantes cargados desde el backend
  const [puntos, setPuntos] = useState<PuntoMapa[]>([]);
  const [cargandoPuntos, setCargandoPuntos] = useState<boolean>(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  // Estado del rastreo en vivo
  const [rastreando, setRastreando] = useState<boolean>(false);
  const [miUbicacion, setMiUbicacion] = useState<{ lat: number; lng: number } | null>(null);
  const [mensajeEstado, setMensajeEstado] = useState<string>('');
  const [ultimoEnvioHora, setUltimoEnvioHora] = useState<string | null>(null);
  const [sincronizando, setSincronizando] = useState<boolean>(false);

  // Referencias para control de watchPosition y throttling de 10s
  const watchIdRef = useRef<number | null>(null);
  const ultimoEnvioTimestampRef = useRef<number>(0);
  const INTERVALO_MINIMO_MS = 10000; // Máximo una vez cada 10 segundos

  // ============================================================================
  // CARGA DE USUARIOS CON UBICACIÓN (GET /api/usuarios/ubicaciones)
  // Ignora lat/lng en NULL y convierte DECIMAL a number en frontend
  // ============================================================================
  const cargarUbicaciones = useCallback(async () => {
    try {
      setCargandoPuntos(true);
      setErrorCarga(null);
      const data = await usuarioApi.getUbicaciones();

      // Filtrar los que tengan lat/lng válidos y convertir de DECIMAL (string/number) a number
      const puntosNormalizados: PuntoMapa[] = data
        .filter(
          (u) =>
            u.lat !== null &&
            u.lng !== null &&
            u.lat !== undefined &&
            u.lng !== undefined &&
            String(u.lat).trim() !== '' &&
            String(u.lng).trim() !== ''
        )
        .map((u) => ({
          id: u.id,
          nombre: u.nombre,
          lat: Number(u.lat), // Conversión de DECIMAL a number en frontend
          lng: Number(u.lng), // Conversión de DECIMAL a number en frontend
          direccion: u.direccion,
        }))
        .filter((p) => !Number.isNaN(p.lat) && !Number.isNaN(p.lng));

      setPuntos(puntosNormalizados);
    } catch (err: any) {
      console.error('Error al cargar ubicaciones de donantes:', err);
      setErrorCarga('No se pudieron cargar los donantes en el mapa.');
    } finally {
      setCargandoPuntos(false);
    }
  }, []);

  useEffect(() => {
    void cargarUbicaciones();
  }, [cargarUbicaciones]);

  // ============================================================================
  // ENVÍO AL ENDPOINT POST /api/usuarios/mi-ubicacion (THROTTLED A 10s)
  // ============================================================================
  const enviarUbicacionAlBackend = async (lat: number, lng: number) => {
    try {
      setSincronizando(true);
      await usuarioApi.actualizarMiUbicacion({
        latitud: lat,
        longitud: lng,
      });
      const horaActual = new Date().toLocaleTimeString('es-BO');
      setUltimoEnvioHora(horaActual);
      setMensajeEstado(`Ubicación sincronizada a las ${horaActual}`);
      if (onUbicacionActualizada) {
        onUbicacionActualizada(lat, lng);
      }
    } catch (err: any) {
      console.error('Error al enviar ubicación:', err);
      setMensajeEstado('Error al guardar ubicación en el servidor.');
    } finally {
      setSincronizando(false);
    }
  };

  // ============================================================================
  // ACTIVAR / DETENER RASTREO CON navigator.geolocation.watchPosition
  // ============================================================================
  const detenerRastreo = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setRastreando(false);
    setMensajeEstado('Rastreo detenido');
  };

  const iniciarRastreo = () => {
    if (!('geolocation' in navigator)) {
      setMensajeEstado('Tu navegador no soporta geolocalización.');
      return;
    }

    setMensajeEstado('Obteniendo tu ubicación en tiempo real...');
    setRastreando(true);

    const id = navigator.geolocation.watchPosition(
      (posicion) => {
        const { latitude, longitude } = posicion.coords;

        // Actualizar punto en vivo en la interfaz inmediatamente
        setMiUbicacion({ lat: latitude, lng: longitude });

        // Control de límite de envío: máximo una vez cada 10 s
        const ahora = Date.now();
        const tiempoTranscurrido = ahora - ultimoEnvioTimestampRef.current;

        if (tiempoTranscurrido >= INTERVALO_MINIMO_MS) {
          ultimoEnvioTimestampRef.current = ahora;
          void enviarUbicacionAlBackend(latitude, longitude);
        } else {
          setMensajeEstado(
            `Punto actualizado en vivo (próxima sincronización en ${Math.ceil(
              (INTERVALO_MINIMO_MS - tiempoTranscurrido) / 1000
            )}s)`
          );
        }
      },
      (error) => {
        console.error('Error de geolocalización:', error);
        let errorMsg = 'No se pudo obtener tu ubicación.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Permiso de ubicación denegado por el navegador.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'La señal de ubicación no está disponible.';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'Tiempo de espera agotado al consultar ubicación.';
        }
        setMensajeEstado(errorMsg);
        detenerRastreo();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    watchIdRef.current = id;
  };

  const alternarRastreo = () => {
    if (rastreando) {
      detenerRastreo();
    } else {
      iniciarRastreo();
    }
  };

  // ============================================================================
  // LIMPIEZA OBLIGATORIA DEL WATCH AL DESMONTAR EL COMPONENTE
  // ============================================================================
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      {mostrarCabecera && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold/15 text-gold text-sm font-bold">
                📍
              </span>
              <h3 className="font-display text-lg font-bold tracking-[-0.02em] text-text">
                Ubicación test
              </h3>
            </div>
            <p className="mt-1 text-xs text-text-muted">
              Visualizá otros donantes en el mapa y compartí tu ubicación en vivo para logística de recojo.
            </p>
          </div>

          {/* Botón "Usar mi ubicación" */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={alternarRastreo}
              className={`press inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all shadow-soft ${
                rastreando
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 ring-2 ring-emerald-400/50'
                  : 'bg-primary text-on-primary hover:bg-primary-hover'
              }`}
            >
              {rastreando ? (
                <>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                  </span>
                  <span>Rastreando ubicación</span>
                </>
              ) : (
                <>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>Usar mi ubicación</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => void cargarUbicaciones()}
              disabled={cargandoPuntos}
              className="press rounded-xl border border-border bg-surface-elevated p-2.5 text-text-muted hover:text-text hover:border-accent disabled:opacity-50"
              title="Recargar donantes en el mapa"
            >
              <svg
                className={`h-4 w-4 ${cargandoPuntos ? 'animate-spin text-gold' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Estados informativos y feedback */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-elevated px-2.5 py-1 text-[11px] font-semibold text-text-muted">
            <span className="h-2 w-2 rounded-full bg-gold" />
            {puntos.length} {puntos.length === 1 ? 'donante con ubicación' : 'donantes con ubicación'}
          </span>

          {miUbicacion && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Punto en vivo: {miUbicacion.lat.toFixed(4)}, {miUbicacion.lng.toFixed(4)}
              {ultimoEnvioHora && <span className="opacity-70 font-normal">· Sincronizado {ultimoEnvioHora}</span>}
            </span>
          )}
        </div>

        {mensajeEstado && (
          <span className="text-[11px] text-text-muted italic flex items-center gap-1.5">
            {sincronizando && (
              <span className="inline-block h-2 w-2 animate-spin rounded-full border border-gold border-t-transparent" />
            )}
            {mensajeEstado}
          </span>
        )}
      </div>

      {errorCarga && (
        <div className="rounded-xl border border-danger/20 bg-danger/10 p-3 text-xs text-danger">
          {errorCarga}
        </div>
      )}

      {/* Componente <Mapa /> con lista de {id, nombre, lat, lng} y centro inicial La Paz */}
      <Mapa
        puntos={puntos}
        miUbicacion={miUbicacion}
        centro={[-16.5, -68.15]}
        zoom={13}
        altura="400px"
      />
    </div>
  );
};

export default UbicacionTest;
