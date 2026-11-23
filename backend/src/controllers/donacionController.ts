// src/controllers/donacionController.ts
// ============================================================================
// CAPA: Presentación (HTTP). Solo traduce req → service → res.
// ============================================================================
import type { Request, Response, NextFunction } from 'express';
import { donacionService } from '../services/donacionService';
import { actorDesdeRequest } from '../middlewares/donacionAccess';

type Handler = (req: Request, res: Response) => Promise<void>;

/** Envuelve el handler: cualquier error cae en el manejador de errores. */
const manejar =
  (fn: Handler) =>
  (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res).catch(next);
  };

const actor = (req: Request) => actorDesdeRequest(req);

export const donacionController = {
  fotos: manejar(async (req, res) => {
    res.status(200).json(await donacionService.listarFotos(actor(req), req.params.id));
  }),
  subirFotos: manejar(async (req, res) => {
    const files = (req.files ?? []) as Express.Multer.File[];
    res.status(201).json(await donacionService.registrarFotos(actor(req), req.params.id, files));
  }),
  verFoto: manejar(async (req, res) => {
    const foto = await donacionService.foto(actor(req), req.params.id, req.params.fotoId);
    const fs = await import('fs');
    const path = await import('path');
    const archivo = path.resolve(process.cwd(), 'storage', 'donaciones', foto.clave_almacenamiento);
    if (!fs.existsSync(archivo)) { res.status(404).json({ error: 'El archivo no está disponible.' }); return; }
    res.setHeader('Content-Type', foto.mime_type);
    res.setHeader('Content-Disposition', 'inline');
    fs.createReadStream(archivo).pipe(res);
  }),

  inventario: manejar(async (_req, res) => {
    res.status(200).json(await donacionService.listarInventario());
  }),

  catalogos: manejar(async (_req, res) => {
    res.status(200).json(await donacionService.catalogos());
  }),

  campanasActivas: manejar(async (_req, res) => {
    res.status(200).json(await donacionService.campanasActivas());
  }),

  buscarDonantes: manejar(async (req, res) => {
    res.status(200).json(await donacionService.buscarDonantes(req.query.q));
  }),

  beneficiariosAsignables: manejar(async (_req, res) => {
    res.status(200).json(await donacionService.beneficiariosAsignables());
  }),

  listar: manejar(async (req, res) => {
    res.status(200).json(await donacionService.listar(actor(req), req.query));
  }),

  obtener: manejar(async (req, res) => {
    res.status(200).json(await donacionService.obtener(actor(req), req.params.id));
  }),

  registrarPropia: manejar(async (req, res) => {
    res.status(201).json(await donacionService.registrarPropia(actor(req), req.body));
  }),

  registrarPresencial: manejar(async (req, res) => {
    res.status(201).json(await donacionService.registrarPresencial(actor(req), req.body));
  }),

  modificar: manejar(async (req, res) => {
    res.status(200).json(await donacionService.modificar(actor(req), req.params.id, req.body));
  }),

  anular: manejar(async (req, res) => {
    res.status(200).json(await donacionService.anular(actor(req), req.params.id, req.body));
  }),

  auditoria: manejar(async (req, res) => {
    res.status(200).json(await donacionService.auditoria(req.params.id));
  }),

  asignables: manejar(async (req, res) => {
    res.status(200).json(await donacionService.asignables(req.query, actor(req)));
  }),

  registrarRecepcion: manejar(async (req, res) => {
    res.status(201).json(await donacionService.registrarRecepcion(actor(req), req.params.id, req.body));
  }),

  asignar: manejar(async (req, res) => {
    res.status(201).json(await donacionService.asignar(actor(req), req.params.id, req.body));
  }),

  cancelarAsignacion: manejar(async (req, res) => {
    res.status(200).json(await donacionService.cancelarAsignacion(actor(req), req.params.idAsignacion, req.body));
  }),

  listarAsignaciones: manejar(async (req, res) => {
    res.status(200).json(await donacionService.listarAsignaciones(req.query));
  }),

  entregasPendientes: manejar(async (_req, res) => {
    res.status(200).json(await donacionService.entregasPendientes());
  }),

  historialEntregas: manejar(async (_req, res) => {
    res.status(200).json(await donacionService.historialEntregas());
  }),

  registrarEntrega: manejar(async (req, res) => {
    res.status(201).json(await donacionService.registrarEntrega(actor(req), req.body));
  }),

  reporte: manejar(async (req, res) => {
    res.status(200).json(await donacionService.reporte(actor(req), req.query));
  }),
};
