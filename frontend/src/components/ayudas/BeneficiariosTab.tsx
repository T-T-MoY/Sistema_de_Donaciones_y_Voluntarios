import { useState, type FormEvent } from 'react';
import { ayudaApi } from '../../api/ayuda.api';
import { useToast } from '../../context/ToastContext';
import type {
  FichaBeneficiario,
  FichaDatos,
  CatalogosAyuda,
} from '../../types/ayuda.types';
import {
  Campo,
  Panel,
  Estado,
  Aviso,
  Vacio,
  Paginacion,
  claseInput,
  btnPrimario,
  btnSecundario,
  mensajeError,
} from './Compartidos';

interface Props {
  fichas: FichaBeneficiario[];
  catalogos: CatalogosAyuda;
  admin: boolean;
  onActualizar: () => Promise<void>;
  onSolicitar: (id: number) => void;
}
const vacia: FichaDatos = {
  nombre: '',
  apellido: '',
  correo: '',
  telefono: '',
  tipo_documento: 'CI',
  documento: '',
  tipo_beneficiario: 'Persona',
  direccion: '',
  necesidad: '',
  descripcion: '',
  estado: 'Pendiente',
  password: '',
};
export default function BeneficiariosTab({
  fichas,
  catalogos,
  admin,
  onActualizar,
  onSolicitar,
}: Props) {
  const [seleccion, setSeleccion] = useState<FichaBeneficiario | null>(null);
  const [editando, setEditando] = useState(false),
    [datos, setDatos] = useState<FichaDatos>(vacia);
  const [modo, setModo] = useState('nueva'),
    [busqueda, setBusqueda] = useState(''),
    [tipo, setTipo] = useState(''),
    [estado, setEstado] = useState('');
  const [pagina, setPagina] = useState(1),
    [guardando, setGuardando] = useState(false),
    [error, setError] = useState(''),
    [guardado, setGuardado] = useState(false);
  const toast = useToast();
  const actualizar = (k: keyof FichaDatos, v: string | number) =>
    setDatos((d) => ({ ...d, [k]: v }));
  const abrir = (f: FichaBeneficiario | null) => {
    setSeleccion(f);
    setDatos(
      f
        ? { ...f, descripcion: f.descripcion || '', telefono: f.telefono || '' }
        : { ...vacia },
    );
    setEditando(true);
    setModo('nueva');
    setError('');
    setGuardado(false);
  };
  const filtradas = fichas.filter(
    (f) =>
      (!tipo || f.tipo_beneficiario === tipo) &&
      (!estado || f.estado === estado) &&
      `${f.nombre} ${f.apellido} ${f.documento} ${f.correo}`
        .toLowerCase()
        .includes(busqueda.toLowerCase()),
  );
  const page = Math.min(pagina, Math.max(1, Math.ceil(filtradas.length / 10)));
  async function guardar(e: FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError('');
    try {
      const f = await ayudaApi.guardarFicha(
        seleccion?.id_usuario || null,
        datos,
      );
      setSeleccion(f);
      setDatos(f);
      setGuardado(true);
      toast.exito(
        `Ficha BEN-${String(f.id_usuario).padStart(6, '0')} guardada.`,
      );
      await onActualizar();
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setGuardando(false);
    }
  }
  if (editando)
    return (
      <div className="space-y-5">
        <button
          type="button"
          className={btnSecundario}
          disabled={guardando}
          onClick={() => setEditando(false)}
        >
          ← Volver a beneficiarios
        </button>
        <form onSubmit={guardar} className="space-y-5">
          <Panel
            titulo={
              seleccion
                ? `Ficha BEN-${String(seleccion.id_usuario).padStart(6, '0')}`
                : 'Registrar beneficiario'
            }
            descripcion="Los campos con * son obligatorios. La ficha comparte los datos de la cuenta existente."
          >
            {guardado && (
              <Aviso>
                Información guardada. El identificador de esta ficha es{' '}
                <strong>
                  BEN-{String(seleccion?.id_usuario).padStart(6, '0')}
                </strong>
                .
              </Aviso>
            )}
            {error && <Aviso error>{error}</Aviso>}
            {!seleccion && admin && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo titulo="Cuenta del beneficiario">
                  <select
                    className={claseInput}
                    value={modo}
                    onChange={(e) => {
                      setModo(e.target.value);
                      setDatos({ ...vacia });
                    }}
                  >
                    <option value="nueva">Crear una cuenta nueva</option>
                    <option value="existente">Usar una cuenta existente</option>
                  </select>
                </Campo>
                {modo === 'existente' && (
                  <Campo titulo="Seleccionar cuenta *">
                    <select
                      className={claseInput}
                      required
                      value={datos.usuario_existente_id || ''}
                      onChange={(e) => {
                        const u = catalogos.usuarios.find(
                          (u) => u.id_usuario === Number(e.target.value),
                        );
                        setDatos((d) => ({
                          ...d,
                          usuario_existente_id: u?.id_usuario,
                          nombre: u?.nombre || '',
                          apellido: u?.apellido || '',
                          correo: u?.correo || '',
                          telefono: u?.telefono || '',
                        }));
                      }}
                    >
                      <option value="">Selecciona una cuenta</option>
                      {catalogos.usuarios.map((u) => (
                        <option key={u.id_usuario} value={u.id_usuario}>
                          {u.nombre} {u.apellido} · {u.correo}
                        </option>
                      ))}
                    </select>
                  </Campo>
                )}
              </div>
            )}
            <div className="grid gap-5 sm:grid-cols-2">
              <Campo titulo="Tipo de beneficiario *">
                <select
                  className={claseInput}
                  required
                  value={datos.tipo_beneficiario}
                  onChange={(e) =>
                    actualizar('tipo_beneficiario', e.target.value)
                  }
                >
                  {['Persona', 'Familia', 'Institucion'].map((v) => (
                    <option key={v} value={v}>
                      {v === 'Institucion' ? 'Institución' : v}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo titulo="Tipo de documento *">
                <select
                  className={claseInput}
                  value={datos.tipo_documento}
                  onChange={(e) => actualizar('tipo_documento', e.target.value)}
                >
                  {['CI', 'NIT', 'Pasaporte', 'Personeria juridica'].map(
                    (v) => (
                      <option key={v}>{v}</option>
                    ),
                  )}
                </select>
              </Campo>
              <Campo
                titulo="Número de documento *"
                ayuda="Entre 5 y 30 caracteres. El documento debe ser único."
              >
                <input
                  className={claseInput}
                  required
                  minLength={5}
                  maxLength={30}
                  value={datos.documento}
                  onChange={(e) => actualizar('documento', e.target.value)}
                />
              </Campo>
              <Campo titulo="Nombres *">
                <input
                  className={claseInput}
                  required
                  minLength={2}
                  maxLength={100}
                  value={datos.nombre}
                  onChange={(e) => actualizar('nombre', e.target.value)}
                />
              </Campo>
              <Campo titulo="Apellidos / razón social *">
                <input
                  className={claseInput}
                  required
                  minLength={2}
                  maxLength={100}
                  value={datos.apellido}
                  onChange={(e) => actualizar('apellido', e.target.value)}
                />
              </Campo>
              <Campo
                titulo="Correo electrónico *"
                ayuda="Se utiliza para iniciar sesión en el sistema."
              >
                <input
                  className={claseInput}
                  required
                  type="email"
                  maxLength={150}
                  value={datos.correo}
                  onChange={(e) => actualizar('correo', e.target.value)}
                />
              </Campo>
              <Campo
                titulo="Teléfono"
                ayuda="8 dígitos; prefijo +591 opcional."
              >
                <input
                  className={claseInput}
                  type="tel"
                  maxLength={20}
                  value={datos.telefono || ''}
                  onChange={(e) => actualizar('telefono', e.target.value)}
                />
              </Campo>
              {!seleccion && modo === 'nueva' && (
                <Campo
                  titulo="Contraseña inicial *"
                  ayuda="Mínimo 8 caracteres, con mayúscula, minúscula y número."
                >
                  <input
                    className={claseInput}
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    maxLength={100}
                    value={datos.password || ''}
                    onChange={(e) => actualizar('password', e.target.value)}
                  />
                </Campo>
              )}
              <Campo titulo="Dirección *">
                <input
                  className={claseInput}
                  required
                  minLength={5}
                  maxLength={255}
                  value={datos.direccion}
                  onChange={(e) => actualizar('direccion', e.target.value)}
                />
              </Campo>
              <Campo titulo="Necesidad principal *">
                <input
                  className={claseInput}
                  required
                  minLength={3}
                  maxLength={150}
                  placeholder="Ej. Alimentación familiar"
                  value={datos.necesidad}
                  onChange={(e) => actualizar('necesidad', e.target.value)}
                />
              </Campo>
              {admin ? (
                <Campo titulo="Estado del beneficiario *">
                  <select
                    className={claseInput}
                    value={datos.estado}
                    onChange={(e) => actualizar('estado', e.target.value)}
                  >
                    {['Pendiente', 'Verificado', 'Rechazado'].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </Campo>
              ) : (
                <div>
                  <p className="mb-2 text-sm text-text-muted">
                    Verificación del perfil
                  </p>
                  <Estado valor={datos.estado} />
                  <p className="mt-2 text-xs text-text-subtle">
                    Cambiar el documento o el tipo de beneficiario requiere una
                    nueva verificación.
                  </p>
                </div>
              )}
            </div>
            <Campo titulo="Descripción de la situación">
              <textarea
                className={claseInput}
                rows={3}
                maxLength={2000}
                value={datos.descripcion || ''}
                onChange={(e) => actualizar('descripcion', e.target.value)}
              />
            </Campo>
            <div className="flex flex-wrap justify-end gap-3">
              <button
                className={btnSecundario}
                type="button"
                disabled={guardando}
                onClick={() => setEditando(false)}
              >
                Cancelar
              </button>
              <button className={btnPrimario} disabled={guardando}>
                {guardando
                  ? 'Guardando…'
                  : seleccion
                    ? 'Actualizar ficha'
                    : 'Guardar beneficiario'}
              </button>
            </div>
          </Panel>
        </form>
      </div>
    );
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-text">
            {admin ? 'Gestión del beneficiario' : 'Mi ficha de beneficiario'}
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Consulta la información, necesidades y estado de verificación.
          </p>
        </div>
        {admin && (
          <button className={btnPrimario} onClick={() => abrir(null)}>
            + Registrar beneficiario
          </button>
        )}
      </div>
      {admin && (
        <Panel titulo="Buscar beneficiarios">
          <div className="grid gap-4 sm:grid-cols-3">
            <Campo titulo="Nombre, documento o correo">
              <input
                className={claseInput}
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setPagina(1);
                }}
                placeholder="Buscar una ficha"
              />
            </Campo>
            <Campo titulo="Tipo">
              <select
                className={claseInput}
                value={tipo}
                onChange={(e) => {
                  setTipo(e.target.value);
                  setPagina(1);
                }}
              >
                <option value="">Todos</option>
                {['Persona', 'Familia', 'Institucion'].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </Campo>
            <Campo titulo="Estado">
              <select
                className={claseInput}
                value={estado}
                onChange={(e) => {
                  setEstado(e.target.value);
                  setPagina(1);
                }}
              >
                <option value="">Todos</option>
                {['Pendiente', 'Verificado', 'Rechazado'].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </Campo>
          </div>
          <button
            className={btnSecundario}
            onClick={() => {
              setBusqueda('');
              setTipo('');
              setEstado('');
              setPagina(1);
            }}
          >
            Limpiar filtros
          </button>
        </Panel>
      )}
      {!filtradas.length ? (
        <Vacio
          titulo="No hay beneficiarios para mostrar"
          detalle="Prueba otros filtros o registra una nueva ficha."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtradas.slice((page - 1) * 10, page * 10).map((f) => (
            <article
              key={f.id_usuario}
              className="rounded-2xl border border-border bg-surface-elevated p-5 shadow-soft"
            >
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <p className="text-xs font-bold tracking-wider text-primary">
                    BEN-{String(f.id_usuario).padStart(6, '0')}
                  </p>
                  <h3 className="mt-1 font-display text-lg font-bold text-text">
                    {f.nombre} {f.apellido}
                  </h3>
                  <p className="mt-1 text-xs text-text-muted">
                    {f.tipo_beneficiario} · {f.tipo_documento} {f.documento}
                  </p>
                </div>
                <Estado valor={f.estado} />
              </div>
              <dl className="my-5 space-y-2 text-sm">
                <div>
                  <dt className="text-xs text-text-subtle">
                    Necesidad principal
                  </dt>
                  <dd className="font-medium text-text">{f.necesidad}</dd>
                </div>
                <div>
                  <dt className="text-xs text-text-subtle">Dirección</dt>
                  <dd className="text-text-muted">{f.direccion}</dd>
                </div>
                <div>
                  <dt className="text-xs text-text-subtle">Contacto</dt>
                  <dd className="break-words text-text-muted">
                    {f.correo}
                    {f.telefono ? ' · ' + f.telefono : ''}
                  </dd>
                </div>
              </dl>
              {f.estado_cuenta !== 'Activo' && (
                <p className="mb-3 text-sm text-error">
                  Cuenta {f.estado_cuenta.toLowerCase()}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <button className={btnSecundario} onClick={() => abrir(f)}>
                  Ver / editar ficha
                </button>
                <button
                  className={btnPrimario}
                  disabled={
                    f.estado === 'Rechazado' || f.estado_cuenta !== 'Activo'
                  }
                  onClick={() => onSolicitar(f.id_usuario)}
                >
                  Solicitar ayuda
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      {admin && (
        <Paginacion
          pagina={page}
          total={filtradas.length}
          onChange={setPagina}
        />
      )}
    </div>
  );
}
