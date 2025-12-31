"use strict";
// web/src/services/contracts/base-contract.service.ts
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
exports.BaseContractService = void 0;
const client_1 = require("@/lib/blockchain/client");
const cache_service_1 = require("@/lib/cache/cache-service");
const error_handler_1 = require("@/lib/errors/error-handler");
/**
 * Clase base para servicios de contratos inteligentes
 * Proporciona funcionalidad común para todos los servicios de contratos
 */
class BaseContractService {
    constructor(contractAddress, abi, cachePrefix) {
        this.contractAddress = contractAddress;
        this.abi = abi;
        this.cachePrefix = cachePrefix;
        this.transactionTimeouts = new Map();
        // walletClient se obtiene de forma lazy cuando se necesita
    }
    /**
     * Realiza una llamada de lectura al contrato
     * @param functionName Nombre de la función del contrato
     * @param args Argumentos para la función
     * @param useCache Si se debe usar caché (por defecto: true)
     * @returns Resultado de la llamada
     */
    read(functionName_1) {
        return __awaiter(this, arguments, void 0, function* (functionName, args = [], useCache = true) {
            const cacheKey = `${this.cachePrefix}:${functionName}:${JSON.stringify(args)}`;
            // Intentar obtener de caché si está habilitado
            if (useCache) {
                const cached = cache_service_1.CacheService.get(cacheKey);
                if (cached !== null) {
                    return cached;
                }
            }
            try {
                // Usar el cliente público unificado
                const result = yield client_1.publicClient.readContract({
                    address: this.contractAddress,
                    abi: this.abi,
                    functionName,
                    args
                });
                // Almacenar en caché si está habilitado
                if (useCache) {
                    cache_service_1.CacheService.set(cacheKey, result);
                }
                return result;
            }
            catch (error) {
                throw error_handler_1.ErrorHandler.handleWeb3Error(error);
            }
        });
    }
    /**
     * Realiza una llamada de escritura al contrato
     * @param functionName Nombre de la función del contrato
     * @param args Argumentos para la función
     * @returns Hash de la transacción
     */
    write(functionName_1) {
        return __awaiter(this, arguments, void 0, function* (functionName, args = [], metadata) {
            // Obtener walletClient usando nuestro cliente unificado
            try {
                const walletClient = yield (0, client_1.getWalletClient)();
                // Para desarrollo, usar una cuenta por defecto de Anvil
                const account = walletClient.account || {
                    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
                };
                const hash = yield walletClient.writeContract({
                    address: this.contractAddress,
                    abi: this.abi,
                    functionName,
                    args,
                    account: account.address,
                    chain: null // Chain es opcional en este contexto
                });
                // Log transaction via API (async, no await for performance)
                this.logTransactionToAPI(Object.assign({ transactionHash: hash, functionName,
                    args, from: account.address, to: this.contractAddress }, metadata)).catch(error => {
                    console.error('Error logging transaction via API:', error);
                });
                return { hash };
            }
            catch (error) {
                throw error_handler_1.ErrorHandler.handleWeb3Error(error);
            }
        });
    }
    /**
     * Espera a que una transacción sea confirmada
     * @param hash Hash de la transacción
     * @param timeout Tiempo máximo de espera en segundos (por defecto: 60 para desarrollo, 120 para producción)
     * @param maxRetries Número máximo de reintentos (por defecto: 2)
     * @returns Recibo de la transacción
     */
    waitForTransaction(hash_1) {
        return __awaiter(this, arguments, void 0, function* (hash, timeout = process.env.NODE_ENV === 'development' ? 60 : 120, maxRetries = 2) {
            let retries = 0;
            const attemptWait = () => __awaiter(this, void 0, void 0, function* () {
                try {
                    // Usar el cliente público unificado con timeout extendido para desarrollo
                    const receipt = yield client_1.publicClient.waitForTransactionReceipt({
                        hash,
                        timeout: process.env.NODE_ENV === 'development' ? 120000 : timeout * 1000, // 120 segundos para desarrollo
                        pollingInterval: 1000 // Poll cada 1 segundo
                    });
                    // Update transaction status via API
                    this.updateTransactionInAPI({
                        transactionHash: hash,
                        status: 'success',
                        blockNumber: Number(receipt.blockNumber),
                        gasUsed: Number(receipt.gasUsed)
                    }).catch(error => {
                        console.error('Error updating transaction via API:', error);
                    });
                    return receipt;
                }
                catch (error) {
                    // Update transaction status to failed
                    this.updateTransactionInAPI({
                        transactionHash: hash,
                        status: 'failed'
                    }).catch(error => {
                        console.error('Error updating transaction status to failed:', error);
                    });
                    // Si es un error de timeout y tenemos reintentos disponibles, reintentar
                    if ((error instanceof Error && error.name === 'AbortError') ||
                        (error instanceof Error && error.message.includes('timeout'))) {
                        if (retries < maxRetries) {
                            retries++;
                            console.warn(`Reintentando transacción ${hash} (intento ${retries}/${maxRetries})`);
                            // Backoff exponencial: 1s, 2s, 4s, etc.
                            const backoffDelay = Math.pow(2, retries) * 1000;
                            yield new Promise(resolve => setTimeout(resolve, backoffDelay));
                            return attemptWait();
                        }
                    }
                    throw error_handler_1.ErrorHandler.handleWeb3Error(error);
                }
            });
            return attemptWait();
        });
    }
    /**
     * Invalida la caché para una clave específica
     * @param keyPart Parte de la clave a invalidar
     */
    invalidateCache(keyPart) {
        if (typeof window !== 'undefined') {
            try {
                Object.keys(localStorage)
                    .filter(key => key.includes(this.cachePrefix) && key.includes(keyPart))
                    .forEach(key => cache_service_1.CacheService.remove(key));
            }
            catch (error) {
                console.warn('Error al invalidar caché:', error);
            }
        }
    }
    /**
     * Invalida toda la caché relacionada con este servicio
     */
    invalidateAllCache() {
        if (typeof window !== 'undefined') {
            try {
                Object.keys(localStorage)
                    .filter(key => key.includes(this.cachePrefix))
                    .forEach(key => cache_service_1.CacheService.remove(key));
            }
            catch (error) {
                console.warn('Error al invalidar caché completa:', error);
            }
        }
    }
    /**
     * Cancela todas las transacciones pendientes
     */
    cancelAllPendingTransactions() {
        this.transactionTimeouts.forEach((timeoutId, hash) => {
            clearTimeout(timeoutId);
            this.transactionTimeouts.delete(hash);
        });
    }
    /**
     * Verifica el estado de la conexión con la blockchain
     */
    checkConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, client_1.checkBlockchainConnection)();
        });
    }
    /**
     * Log transaction via API route
     */
    logTransactionToAPI(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get current block number and gas price for logging
                const [blockNumber, gasPrice] = yield Promise.all([
                    client_1.publicClient.getBlockNumber(),
                    client_1.publicClient.getGasPrice()
                ]);
                const transactionData = {
                    transactionHash: data.transactionHash,
                    blockNumber: Number(blockNumber),
                    from: data.from,
                    to: data.to,
                    gasUsed: 0, // Will be updated when transaction is confirmed
                    gasPrice: gasPrice.toString(),
                    timestamp: new Date().toISOString(),
                    status: 'pending',
                    functionName: data.functionName,
                    args: data.args,
                    role: data.role,
                    userAddress: data.userAddress || data.from,
                    relatedSerial: data.relatedSerial
                };
                // Log transaction via API route
                yield fetch('/api/mongodb/transactions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(transactionData)
                });
            }
            catch (error) {
                console.error('Error logging transaction via API:', error);
                // Don't throw, this is a background operation
            }
        });
    }
    /**
     * Update transaction status via API route
     */
    updateTransactionInAPI(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // En una implementación real, aquí harías PATCH a la API
                // Por ahora solo log para desarrollo
                console.log('Transaction status update:', data);
            }
            catch (error) {
                console.error('Error updating transaction status:', error);
                // Don't throw, this is a background operation
            }
        });
    }
}
exports.BaseContractService = BaseContractService;
