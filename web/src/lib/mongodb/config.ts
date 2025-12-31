// web/src/lib/mongodb/config.ts
// Configuración de conexión a MongoDB

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'supplychain-tracker';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

if (!MONGODB_DB) {
  throw new Error('Please define the MONGODB_DB environment variable');
}

/**
 * Global es usado aquí para mantener una conexión caché entre recargas en desarrollo.
 * Esto previene que las conexiones crezcan exponencialmente durante el uso de API Routes.
 */
let cached = (global as any).mongodb;

if (!cached) {
  cached = (global as any).mongodb = { conn: null, promise: null };
}

export interface MongoDBConfig {
  uri: string;
  db: string;
}

export const mongodbConfig: MongoDBConfig = {
  uri: MONGODB_URI,
  db: MONGODB_DB
};

export default mongodbConfig;