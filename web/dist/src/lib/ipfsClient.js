"use strict";
/*
 * Cliente IPFS simplificado para el proyecto
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFromIPFS = exports.uploadToIPFS = void 0;
// Usaremos un gateway público para desarrollo
const IPFS_GATEWAY = 'https://ipfs.io/ipfs';
// Función para subir datos a IPFS
const uploadToIPFS = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Convertir a JSON si es necesario
        const jsonData = typeof data === 'string' ? data : JSON.stringify(data);
        // Para desarrollo, vamos a "simular" la subida a IPFS
        // En un entorno real, esto se haría con un cliente IPFS real
        // Simulamos un hash IPFS (en realidad sería el resultado de la subida)
        const hash = `Qm${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
        return {
            hash,
            url: `${IPFS_GATEWAY}/${hash}`
        };
    }
    catch (error) {
        console.error('Error uploading to IPFS:', error);
        throw error;
    }
});
exports.uploadToIPFS = uploadToIPFS;
// Función para obtener datos de IPFS
const getFromIPFS = (hash) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // En un entorno real, esto haría una solicitud al gateway IPFS
        // Por ahora, devolvemos un objeto simulado
        console.log('Intentando obtener datos de IPFS:', hash);
        // Simulamos una respuesta exitosa
        return {
            success: true,
            message: `Datos recuperados del hash ${hash}`
        };
    }
    catch (error) {
        console.error('Error getting from IPFS:', error);
        throw error;
    }
});
exports.getFromIPFS = getFromIPFS;
