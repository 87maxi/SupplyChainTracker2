"use strict";
/*
 * Servicio IPFS para el sistema de trazabilidad
 * Maneja la conexión con IPFS y el almacenamiento/recuperación de datos
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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isIPFSAvailable = exports.getFromIPFS = exports.uploadToIPFS = void 0;
const ipfs_http_client_1 = require("ipfs-http-client");
// Configuración del nodo IPFS
const projectId = process.env.NEXT_PUBLIC_INFURA_PROJECT_ID || '2jSkRipsZnsF06t3ecVNlA2ts5X';
const projectSecret = process.env.NEXT_PUBLIC_INFURA_PROJECT_SECRET || '1bbc68836348b72dba92c5c7ca8c3cd0';
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');
// Cliente IPFS configurado para Infura
const ipfsClient = (0, ipfs_http_client_1.create)({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
        authorization: auth,
    },
});
// Función para cargar datos a IPFS
const uploadToIPFS = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Convertir los datos a JSON si no lo están
        const jsonData = typeof data === 'string' ? data : JSON.stringify(data);
        // Subir a IPFS
        const result = yield ipfsClient.add(jsonData);
        // Construir URL pública
        const url = `https://ipfs.io/ipfs/${result.path}`;
        return {
            path: result.path,
            url,
            hash: result.path // El hash es el path en IPFS
        };
    }
    catch (error) {
        console.error('Error uploading to IPFS:', error);
        throw new Error('Failed to upload data to IPFS');
    }
});
exports.uploadToIPFS = uploadToIPFS;
// Función para recuperar datos de IPFS
const getFromIPFS = (hash) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_1, _b, _c;
    try {
        // Obtener el contenido de IPFS
        const chunks = [];
        try {
            for (var _d = true, _e = __asyncValues(ipfsClient.cat(hash)), _f; _f = yield _e.next(), _a = _f.done, !_a; _d = true) {
                _c = _f.value;
                _d = false;
                const chunk = _c;
                chunks.push(chunk);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
            }
            finally { if (e_1) throw e_1.error; }
        }
        // Combinar los chunks y parsear JSON
        const data = Buffer.concat(chunks).toString('utf8');
        return JSON.parse(data);
    }
    catch (error) {
        console.error('Error getting from IPFS:', error);
        throw new Error('Failed to retrieve data from IPFS');
    }
});
exports.getFromIPFS = getFromIPFS;
// Función para verificar si IPFS está disponible
const isIPFSAvailable = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const version = yield ipfsClient.version();
        console.log('IPFS version:', version);
        return true;
    }
    catch (error) {
        console.error('IPFS not available:', error);
        return false;
    }
});
exports.isIPFSAvailable = isIPFSAvailable;
