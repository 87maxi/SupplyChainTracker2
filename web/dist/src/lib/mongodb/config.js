"use strict";
// web/src/lib/mongodb/config.ts
// Configuración de conexión a MongoDB
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongodbConfig = void 0;
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
let cached = global.mongodb;
if (!cached) {
    cached = global.mongodb = { conn: null, promise: null };
}
exports.mongodbConfig = {
    uri: MONGODB_URI,
    db: MONGODB_DB
};
exports.default = exports.mongodbConfig;
