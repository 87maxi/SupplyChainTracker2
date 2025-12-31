"use strict";
// web/src/lib/blockchain/client.ts
// Cliente unificado para conexiones blockchain usando Viem
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
exports.http = exports.getBalance = exports.checkBlockchainConnection = exports.getWalletClient = exports.publicClient = void 0;
const viem_1 = require("viem");
Object.defineProperty(exports, "http", { enumerable: true, get: function () { return viem_1.http; } });
const chains_1 = require("viem/chains");
// Configuración para desarrollo local con Anvil
const ANVIL_RPC_URL = 'http://localhost:8545';
/**
 * Cliente público para operaciones de lectura
 * No requiere conexión de wallet
 */
exports.publicClient = (0, viem_1.createPublicClient)({
    chain: chains_1.localhost,
    transport: (0, viem_1.http)(ANVIL_RPC_URL, {
        timeout: 30000, // 30 segundos timeout para desarrollo
        retryCount: 3, // Reintentos automáticos
    }),
    batch: {
        multicall: true, // Habilitar multicall para optimización
    }
});
/**
 * Cliente de wallet para operaciones de escritura
 * Requiere conexión de wallet
 */
const getWalletClient = () => __awaiter(void 0, void 0, void 0, function* () {
    // En desarrollo, usamos el cliente básico
    // En producción, Wagmi se encargará de la conexión real
    return (0, viem_1.createWalletClient)({
        chain: chains_1.localhost,
        transport: (0, viem_1.http)(ANVIL_RPC_URL)
    });
});
exports.getWalletClient = getWalletClient;
/**
 * Verifica la conexión con la blockchain
 * @returns True si la conexión es exitosa
 */
const checkBlockchainConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield exports.publicClient.getBlockNumber();
        return true;
    }
    catch (error) {
        console.error('Error de conexión con la blockchain:', error);
        return false;
    }
});
exports.checkBlockchainConnection = checkBlockchainConnection;
/**
 * Obtiene el balance de una cuenta
 * @param address Dirección de la cuenta
 * @returns Balance en wei como string
 */
const getBalance = (address) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const balance = yield exports.publicClient.getBalance({ address });
        return balance.toString();
    }
    catch (error) {
        console.error('Error obteniendo balance:', error);
        return '0';
    }
});
exports.getBalance = getBalance;
