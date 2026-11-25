import api from './client';
import type {
  FichaBeneficiario,
  FichaDatos,
  SolicitudAyuda,
  SolicitudDatos,
  ApoyoAyuda,
  ApoyoDatos,
  CatalogosAyuda,
  AdjuntoAyuda,
} from '../types/ayuda.types';
const base = '/ayudas';
export const ayudaApi = {
  acceso: async () =>
    (
      await api.get<{ id: number; admin: boolean; beneficiario: boolean }>(
        `${base}/acceso`,
      )
    ).data,
  catalogos: async () =>
    (await api.get<CatalogosAyuda>(`${base}/catalogos`)).data,
  fichas: async () =>
    (await api.get<FichaBeneficiario[]>(`${base}/beneficiarios`)).data,
  guardarFicha: async (id: number | null, d: FichaDatos) =>
    (
      await (id
        ? api.put<FichaBeneficiario>(`${base}/beneficiarios/${id}`, d)
        : api.post<FichaBeneficiario>(`${base}/beneficiarios`, d))
    ).data,
  solicitudes: async () =>
    (await api.get<SolicitudAyuda[]>(`${base}/solicitudes`)).data,
  solicitud: async (id: number) =>
    (await api.get<SolicitudAyuda>(`${base}/solicitudes/${id}`)).data,
  guardarSolicitud: async (id: number | null, d: SolicitudDatos) =>
    (
      await (id
        ? api.put<SolicitudAyuda>(`${base}/solicitudes/${id}`, d)
        : api.post<SolicitudAyuda>(`${base}/solicitudes`, d))
    ).data,
  evaluar: async (
    id: number,
    d: {
      estado: string;
      observaciones: string;
      revisada: boolean;
      evaluada: boolean;
      version: number;
    },
  ) =>
    (
      await api.post<SolicitudAyuda>(
        `${base}/solicitudes/${id}/evaluaciones`,
        d,
      )
    ).data,
  apoyos: async () => (await api.get<ApoyoAyuda[]>(`${base}/apoyos`)).data,
  apoyo: async (id: number) =>
    (await api.get<ApoyoAyuda>(`${base}/apoyos/${id}`)).data,
  subirEvidencia: async (id: number, foto: File, descripcion: string) => {
    const data = new FormData();
    data.append('foto', foto);
    data.append('descripcion', descripcion);
    return (
      await api.post<ApoyoAyuda>(`${base}/apoyos/${id}/evidencias`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    ).data;
  },
  imagenEvidencia: async (id: number) =>
    (await api.get<Blob>(`${base}/evidencias/${id}`, { responseType: 'blob' }))
      .data,
  guardarApoyo: async (id: number | null, d: ApoyoDatos) =>
    (
      await (id
        ? api.put<ApoyoAyuda>(`${base}/apoyos/${id}`, d)
        : api.post<ApoyoAyuda>(`${base}/apoyos`, d))
    ).data,
  adjuntar: async (id: number, files: File[]) => {
    const d = new FormData();
    files.forEach((f) => d.append('archivos', f));
    return (
      await api.post<AdjuntoAyuda[]>(`${base}/solicitudes/${id}/adjuntos`, d, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    ).data;
  },
  descargar: async (f: AdjuntoAyuda) => {
    const r = await api.get<Blob>(`${base}/adjuntos/${f.id_adjunto}`, {
      responseType: 'blob',
    });
    const url = URL.createObjectURL(r.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = f.nombre;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },
};
