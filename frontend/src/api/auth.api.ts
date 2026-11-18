/**
 * ============================================================================
 * ARCHIVO: auth.api.ts
 * CAPA: API / Cliente HTTP para endpoints de autenticación (/api/auth).
 * ============================================================================
 */

import api from './client';
import type {
  LoginRequest,
  LoginResponse,
  RegistroRequest,
  ResetPasswordRequest,
  ValidarTokenResponse,
} from '../types/auth.types';

export const authApi = {
  /**
   * Inicia sesión con correo y contraseña.
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>('/auth/login', credentials);
    return res.data;
  },

  /**
   * Registra una nueva cuenta de donante / voluntario.
   */
  registrar: async (data: RegistroRequest): Promise<{ mensaje: string }> => {
    const res = await api.post<{ mensaje: string }>('/auth/registrar', data);
    return res.data;
  },

  /**
   * Solicita el correo de recuperación de contraseña.
   */
  solicitarRecuperacion: async (correo: string): Promise<{ mensaje: string }> => {
    const res = await api.post<{ mensaje: string }>('/auth/solicitar-recuperacion', {
      correo,
    });
    return res.data;
  },

  /**
   * Valida un token de recuperación de contraseña.
   */
  validarToken: async (token: string): Promise<ValidarTokenResponse> => {
    const res = await api.get<ValidarTokenResponse>(`/auth/validar-token/${token}`);
    return res.data;
  },

  /**
   * Restablece la contraseña usando el token de recuperación.
   */
  resetPassword: async (
    data: ResetPasswordRequest
  ): Promise<{ mensaje: string }> => {
    const res = await api.post<{ mensaje: string }>('/auth/reset-password', data);
    return res.data;
  },
};

export default authApi;
