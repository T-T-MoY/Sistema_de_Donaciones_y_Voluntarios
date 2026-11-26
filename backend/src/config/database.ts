/**
 * ============================================================================
 * ARCHIVO: database.ts
 * CAPA: Configuración (Config/)
 *
 * PROPÓSITO:
 * Gestiona la conexión a PostgreSQL (pool de 'pg'), sin ORM.
 *
 * SOPORTA dos modos de configuración:
 * 1. DATABASE_URL (Neon / producción): connection string completo con SSL.
 * 2. Variables individuales DB_HOST, DB_PORT, etc. (Docker local).
 *
 * NOTA SOBRE EL .env:
 * El archivo .env vive en la raíz del proyecto (compartido con Docker
 * Compose). Cuando el backend corre en local se carga ese archivo y, si
 * DB_HOST viene como "db" (nombre del servicio de Docker), se traduce a
 * "localhost" para que también funcione fuera de los contenedores.
 * ============================================================================
 */

import { Pool } from 'pg';
import type { PoolConfig } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// .env de la raíz del proyecto (backend/src/config -> ../../../.env)
const envRaiz = path.resolve(__dirname, '../../../.env');
if (fs.existsSync(envRaiz)) {
  dotenv.config({ path: envRaiz });
}
// Permite además un .env propio del backend si algún día se agrega.
dotenv.config();

const estaEnDocker = fs.existsSync('/.dockerenv');

// ============================================================================
// CONFIGURACIÓN DE CONEXIÓN
// Prioridad: DATABASE_URL (Neon/producción) → variables individuales (Docker)
// ============================================================================
let dbConfig: PoolConfig;

if (process.env.DATABASE_URL) {
  // Neon y otros proveedores en la nube usan un connection string con SSL
  dbConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  };
} else {
  const hostConfigurado = process.env.DB_HOST;
  const host =
    !estaEnDocker && hostConfigurado === 'db' ? 'localhost' : hostConfigurado;

  // 1. Configuración de credenciales del pool de conexiones (solo desde variables de entorno)
  dbConfig = {
    host,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    // Número máximo de clientes simultáneos en el pool
    max: 20,
    // Tiempo máximo (en milisegundos) que un cliente puede estar inactivo
    idleTimeoutMillis: 30000,
    // Tiempo máximo de espera para obtener una conexión del pool
    connectionTimeoutMillis: 5000,
  };
}

// 2. Instanciación del Pool
export const pool = new Pool(dbConfig);

// 3. Evento informativo: cuando un cliente nuevo se conecta al pool
pool.on('connect', () => {
  // Conexión exitosa al pool
});

// 4. Manejo de errores imprevistos en clientes inactivos
pool.on('error', (err: Error) => {
  console.error('🔴 [PostgreSQL] Error inesperado en cliente inactivo del pool:', err);
  process.exit(-1);
});

/**
 * Función auxiliar para verificar la conectividad con la base de datos al iniciar el servidor.
 */
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, current_database() as db_name');
    client.release(); // Siempre liberar el cliente de vuelta al pool
    console.log(`✅ [PostgreSQL] Conexión exitosa a la base de datos '${result.rows[0].db_name}'`);
    return true;
  } catch (error) {
    console.error('⚠️ [PostgreSQL] No se pudo conectar a la base de datos:', (error as Error).message);
    console.info('💡 Asegúrate de tener levantado Docker con: docker compose up -d db');
    return false;
  }
};
