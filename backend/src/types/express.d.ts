// src/types/express.d.ts
// Extiende Request para tipar el usuario decodificado del JWT.
import 'express';

declare global {
  namespace Express {
    interface Request {
      usuario?: {
        id: number;
        id_usuario: number;
        nombre: string;
        apellido: string;
        correo: string;
        rol: string;
        roles?: string[];
        es_coordinador?: boolean;
        es_donante?: boolean;
        estado_voluntario?: string | null;
        estado_beneficiario?: string | null;
      };
      file?: Express.Multer.File;
    }
  }
}

export {};s
