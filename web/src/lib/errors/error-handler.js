"use strict";
// web/src/lib/errors/error-handler.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = exports.AppError = void 0;
/**
 * Clase para manejar errores de manera consistente en toda la aplicación
 */
class AppError extends Error {
    constructor(message, code, originalError) {
        super(message);
        this.message = message;
        this.code = code;
        this.originalError = originalError;
        this.name = 'AppError';
    }
}
exports.AppError = AppError;
/**
 * Manejador centralizado de errores
 */
class ErrorHandler {
    /**
     * Maneja errores de Web3 y los convierte en AppError consistentes
     * @param error Error recibido de Web3/Wagmi
     * @returns AppError con mensaje y código adecuado
     */
    static handleWeb3Error(error) {
        var _a, _b, _c, _d, _e;
        // Códigos de error comunes de Web3
        if (error.code === 4001) {
            return new AppError('Transacción rechazada por el usuario', 'USER_REJECTED');
        }
        if (error.code === -32603) {
            return new AppError('Error interno de la red', 'INTERNAL_ERROR');
        }
        if (error.code === 4100) {
            return new AppError('Permiso no concedido', 'PERMISSION_DENIED');
        }
        if ((_a = error.message) === null || _a === void 0 ? void 0 : _a.includes('user rejected transaction')) {
            return new AppError('Transacción rechazada por el usuario', 'USER_REJECTED');
        }
        if ((_b = error.message) === null || _b === void 0 ? void 0 : _b.includes('insufficient funds')) {
            return new AppError('Fondos insuficientes para la transacción', 'INSUFFICIENT_FUNDS');
        }
        if ((_c = error.message) === null || _c === void 0 ? void 0 : _c.includes('gas required exceeds allowance')) {
            return new AppError('El gas requerido excede el límite disponible', 'GAS_LIMIT_EXCEEDED');
        }
        // Errores de validación
        if (((_d = error.message) === null || _d === void 0 ? void 0 : _d.includes('reverted with reason string')) ||
            ((_e = error.message) === null || _e === void 0 ? void 0 : _e.includes('VM execution error'))) {
            const reason = this.extractRevertReason(error.message);
            return new AppError(`Transacción revertida: ${reason}`, 'TRANSACTION_REVERTED', error);
        }
        // Error genérico
        return new AppError(error.message || 'Ocurrió un error desconocido', 'UNKNOWN_ERROR', error);
    }
    /**
     * Extrae el motivo de reversión de un error de contrato
     * @param message Mensaje de error completo
     * @returns Motivo de reversión
     */
    static extractRevertReason(message) {
        // Intentar extraer el motivo de diferentes formatos
        const reasonMatch = message.match(/reason string '(.+?)'/);
        if (reasonMatch && reasonMatch[1]) {
            return reasonMatch[1];
        }
        const revertMatch = message.match(/reverted: (.+?)(?:,|$)/);
        if (revertMatch && revertMatch[1]) {
            return revertMatch[1];
        }
        return 'Error desconocido';
    }
    /**
     * Registra un error en la consola y en sistemas de monitoreo
     * @param error Error a registrar
     * @param context Información adicional sobre el contexto
     */
    static logError(error, context) {
        console.error('Error registrado:', { error, context });
        // Aquí se podría integrar con servicios de monitoreo como Sentry, Rollbar, etc.
        // if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
        //   Sentry.captureException(error, { contexts: { additional: context } });
        // }
    }
}
exports.ErrorHandler = ErrorHandler;
