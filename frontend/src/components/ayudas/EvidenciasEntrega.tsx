import { useEffect, useState, type FormEvent } from 'react';
import { ayudaApi } from '../../api/ayuda.api';
import type { ApoyoAyuda, EvidenciaEntrega } from '../../types/ayuda.types';
import { useToast } from '../../context/ToastContext';
import {
  Panel,
  Campo,
  Aviso,
  claseInput,
  btnPrimario,
  btnSecundario,
  fechaCorta,
  mensajeError,
} from './Compartidos';

function FotoGuardada({ foto }: { foto: EvidenciaEntrega }) {
  const [url, setUrl] = useState(''),
    [fallo, setFallo] = useState(false),
    [intento, setIntento] = useState(0);
  useEffect(() => {
    let activa = true;
    let objetoUrl = '';
    setUrl('');
    setFallo(false);
    ayudaApi
      .imagenEvidencia(foto.id_evidencia)
      .then((blob) => {
        if (!activa) return;
        objetoUrl = URL.createObjectURL(blob);
        setUrl(objetoUrl);
      })
      .catch(() => {
        if (activa) setFallo(true);
      });
    return () => {
      activa = false;
      if (objetoUrl) URL.revokeObjectURL(objetoUrl);
    };
  }, [foto.id_evidencia, intento]);
  return (
    <figure className="overflow-hidden rounded-xl border border-border bg-surface">
      {fallo ? (
        <div role="alert" className="p-5 text-sm text-error">
          No se pudo cargar la fotografía.
          <button
            type="button"
            className={`${btnSecundario} mt-3`}
            onClick={() => setIntento((i) => i + 1)}
          >
            Reintentar
          </button>
        </div>
      ) : url ? (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          aria-label={`Ampliar evidencia: ${foto.descripcion || foto.nombre}`}
        >
          <img
            src={url}
            alt={foto.descripcion || 'Evidencia de la entrega realizada'}
            className="h-56 w-full object-contain"
            onError={() => setFallo(true)}
          />
        </a>
      ) : (
        <div
          role="status"
          className="flex h-56 items-center justify-center text-sm text-text-muted"
        >
          Cargando fotografía…
        </div>
      )}
      <figcaption className="space-y-2 p-4">
        <p className="break-words text-sm font-semibold text-text">
          {foto.descripcion || foto.nombre}
        </p>
        <p className="text-xs text-text-muted">
          Adjuntada por {foto.autor_nombre} · {fechaCorta(foto.creado_en)}
        </p>
        {url && (
          <a
            href={url}
            download={foto.nombre}
            className="inline-block text-xs font-bold text-primary underline"
          >
            Descargar imagen
          </a>
        )}
      </figcaption>
    </figure>
  );
}

export default function EvidenciasEntrega({
  apoyo,
  admin,
  onGuardada,
}: {
  apoyo: ApoyoAyuda;
  admin: boolean;
  onGuardada: (a: ApoyoAyuda) => void;
}) {
  const [foto, setFoto] = useState<File | null>(null),
    [preview, setPreview] = useState(''),
    [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState(''),
    [subiendo, setSubiendo] = useState(false),
    [inputKey, setInputKey] = useState(0);
  const toast = useToast();
  useEffect(() => {
    if (!foto) {
      setPreview('');
      return;
    }
    const url = URL.createObjectURL(foto);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [foto]);
  async function guardar(e: FormEvent) {
    e.preventDefault();
    if (!foto || subiendo) return;
    setSubiendo(true);
    setError('');
    try {
      const actual = await ayudaApi.subirEvidencia(
        apoyo.id_apoyo,
        foto,
        descripcion,
      );
      onGuardada(actual);
      setFoto(null);
      setDescripcion('');
      setInputKey((k) => k + 1);
      toast.exito('Evidencia de entrega guardada.');
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setSubiendo(false);
    }
  }
  const evidencias = apoyo.evidencias || [];
  return (
    <Panel
      titulo="Evidencia fotográfica de entrega"
      descripcion="Adjunta una fotografía que documente la ayuda entregada. El beneficiario también podrá consultarla."
    >
      {apoyo.estado !== 'Entregada' ? (
        <Aviso>
          Confirma la entrega para habilitar la carga de su fotografía.
        </Aviso>
      ) : (
        <>
          {evidencias.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {evidencias.map((f) => (
                <FotoGuardada key={f.id_evidencia} foto={f} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted">
              Todavía no se adjuntaron fotografías a esta entrega.
            </p>
          )}
          {admin && evidencias.length < 5 && (
            <form
              onSubmit={guardar}
              className="space-y-4 rounded-xl border border-dashed border-border-strong p-4 sm:p-5"
            >
              <Campo
                titulo="Fotografía de la entrega"
                ayuda="JPG, PNG o WEBP. Máximo 5 MB por imagen y 5 fotografías por entrega."
              >
                <input
                  key={inputKey}
                  className={claseInput}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  required
                  disabled={subiendo}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    setError('');
                    if (
                      f &&
                      (!['image/jpeg', 'image/png', 'image/webp'].includes(
                        f.type,
                      ) ||
                        f.size > 5242880 ||
                        f.size === 0)
                    ) {
                      setError(
                        'Selecciona una imagen JPG, PNG o WEBP de hasta 5 MB.',
                      );
                      setFoto(null);
                      e.target.value = '';
                      return;
                    }
                    setFoto(f || null);
                  }}
                />
              </Campo>
              {preview && (
                <div className="rounded-xl border border-border bg-surface p-3">
                  <p className="mb-2 text-xs font-bold text-text-muted">
                    Vista previa · {foto?.name}
                  </p>
                  <img
                    src={preview}
                    alt="Vista previa de la evidencia seleccionada"
                    className="max-h-72 w-full object-contain"
                    onError={() => {
                      setError(
                        'No se pudo leer esta imagen. Selecciona otra fotografía válida.',
                      );
                      setFoto(null);
                      setInputKey((k) => k + 1);
                    }}
                  />
                </div>
              )}
              <Campo titulo="Descripción de la fotografía (opcional)">
                <textarea
                  className={claseInput}
                  maxLength={500}
                  rows={2}
                  disabled={subiendo}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Ej. Entrega del kit alimentario al beneficiario."
                />
              </Campo>
              {error && <Aviso error>{error}</Aviso>}
              <div className="flex flex-wrap justify-end gap-3">
                {foto && (
                  <button
                    type="button"
                    className={btnSecundario}
                    disabled={subiendo}
                    onClick={() => {
                      setFoto(null);
                      setInputKey((k) => k + 1);
                      setError('');
                    }}
                  >
                    Quitar selección
                  </button>
                )}
                <button
                  type="submit"
                  className={btnPrimario}
                  disabled={!foto || subiendo}
                >
                  {subiendo ? 'Guardando fotografía…' : 'Guardar evidencia'}
                </button>
              </div>
            </form>
          )}
          {admin && evidencias.length >= 5 && (
            <p className="text-sm text-text-muted">
              Esta entrega tiene el máximo de 5 fotografías.
            </p>
          )}
        </>
      )}
    </Panel>
  );
}
