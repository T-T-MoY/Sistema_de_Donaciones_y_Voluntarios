import type { Request } from 'express';
import { asyncHandler as manejar } from '../middlewares/asyncHandler';
import { ayudaService as s } from '../services/ayudaService';

const actor = (r: Request) => s.actor(r.usuario?.id_usuario ?? r.usuario?.id);
export const ayudaController = {
  acceso: manejar(async (req, res) => {
    res.json(await s.acceso(req.usuario?.id_usuario ?? req.usuario?.id));
  }),
  catalogos: manejar(async (req, res) => {
    res.json(await s.catalogos(await actor(req)));
  }),
  fichas: manejar(async (req, res) => {
    res.json(await s.fichas(await actor(req)));
  }),
  crearFicha: manejar(async (req, res) => {
    res
      .status(201)
      .json(await s.guardarFicha(await actor(req), null, req.body));
  }),
  editarFicha: manejar(async (req, res) => {
    res.json(await s.guardarFicha(await actor(req), req.params.id, req.body));
  }),
  solicitudes: manejar(async (req, res) => {
    res.json(await s.solicitudes(await actor(req)));
  }),
  solicitud: manejar(async (req, res) => {
    res.json(await s.detalleSolicitud(await actor(req), req.params.id));
  }),
  crearSolicitud: manejar(async (req, res) => {
    res
      .status(201)
      .json(await s.guardarSolicitud(await actor(req), null, req.body));
  }),
  editarSolicitud: manejar(async (req, res) => {
    res.json(
      await s.guardarSolicitud(await actor(req), req.params.id, req.body),
    );
  }),
  evaluar: manejar(async (req, res) => {
    res.json(await s.evaluar(await actor(req), req.params.id, req.body));
  }),
  apoyos: manejar(async (req, res) => {
    res.json(await s.apoyos(await actor(req)));
  }),
  apoyo: manejar(async (req, res) => {
    res.json(await s.detalleApoyo(await actor(req), req.params.id));
  }),
  crearApoyo: manejar(async (req, res) => {
    res.status(201).json(await s.crearApoyo(await actor(req), req.body));
  }),
  editarApoyo: manejar(async (req, res) => {
    res.json(
      await s.actualizarApoyo(await actor(req), req.params.id, req.body),
    );
  }),
  subirEvidencia: manejar(async (req, res) => {
    res
      .status(201)
      .json(
        await s.subirEvidencia(
          await actor(req),
          req.params.id,
          req.file,
          req.body?.descripcion,
        ),
      );
  }),
  verEvidencia: manejar(async (req, res) => {
    const f = await s.verEvidencia(await actor(req), req.params.id);
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
    res.type(f.mime).send(f.contenido);
  }),
  adjuntar: manejar(async (req, res) => {
    res
      .status(201)
      .json(
        await s.adjuntar(
          await actor(req),
          req.params.id,
          (req.files as Express.Multer.File[]) || [],
        ),
      );
  }),
  descargar: manejar(async (req, res) => {
    const f = await s.descargar(await actor(req), req.params.id);
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.type(f.mime);
    res.attachment(f.nombre);
    res.send(f.contenido);
  }),
};
