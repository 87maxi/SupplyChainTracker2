"use strict";
// web/src/hooks/use-contracts/use-supply-chain.hook.ts
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
exports.useSupplyChainContract = void 0;
const react_1 = require("react");
const use_toast_1 = require("@/hooks/use-toast");
const activity_logger_1 = require("@/lib/activity-logger");
// Use singleton instance from services
const { supplyChainService } = require('@/services/SupplyChainService');
/**
 * Hook personalizado para interactuar con el contrato SupplyChainTracker
 * Proporciona funciones para todas las operaciones del contrato con manejo de estado
 */
const useSupplyChainContract = () => {
    const { toast } = (0, use_toast_1.useToast)();
    const [loading, setLoading] = (0, react_1.useState)({});
    /**
     * Estado de carga para una operación específica
     * @param operation Nombre de la operación
     * @returns Si la operación está cargando
     */
    const isLoading = (0, react_1.useCallback)((operation) => {
        return loading[operation] || false;
    }, [loading]);
    /**
     * Establece el estado de carga para una operación
     * @param operation Nombre de la operación
     * @param status Estado de carga
     */
    const setLoadingState = (0, react_1.useCallback)((operation, status) => {
        setLoading(prev => (Object.assign(Object.assign({}, prev), { [operation]: status })));
    }, []);
    /**
     * Maneja errores y muestra notificaciones
     * @param error Error a manejar
     * @param operation Operación que causó el error
     */
    const handleError = (0, react_1.useCallback)((error, operation) => {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        toast({
            title: 'Error',
            description: errorMessage,
            variant: 'destructive',
        });
        activity_logger_1.ActivityLogger.error('system', operation, errorMessage);
        return errorMessage;
    }, [toast]);
    /**
     * Registra una acción exitosa
     * @param operation Operación realizada
     * @param hash Hash de la transacción
     */
    const handleSuccess = (0, react_1.useCallback)((operation, hash) => {
        toast({
            title: 'Éxito',
            description: `Operación completada: ${hash ? hash.slice(0, 8) + '...' : ''}`,
        });
        if (hash) {
            activity_logger_1.ActivityLogger.system(operation, `Transacción completada: ${hash}`);
        }
    }, [toast]);
    /**
     * Registra múltiples netbooks
     * @param serials Números de serie
     * @param batches IDs de lote
     * @param specs Especificaciones del modelo
     */
    const registerNetbooks = (0, react_1.useCallback)((serials, batches, specs) => __awaiter(void 0, void 0, void 0, function* () {
        const operation = 'registerNetbooks';
        setLoadingState(operation, true);
        try {
            const result = yield supplyChainService.registerNetbooks(serials, batches, specs);
            if (result.success && result.hash) {
                handleSuccess(operation, result.hash);
                return result;
            }
            else {
                throw new Error(result.error || 'Registro fallido');
            }
        }
        catch (error) {
            return {
                success: false,
                error: handleError(error, operation)
            };
        }
        finally {
            setLoadingState(operation, false);
        }
    }), [handleError, handleSuccess, setLoadingState]);
    /**
     * Realiza auditoría de hardware
     * @param serial Número de serie
     * @param passed Si pasó la auditoría
     * @param reportHash Hash del informe
     * @param userAddress Dirección del usuario
     */
    const auditHardware = (0, react_1.useCallback)((serial, passed, reportHash, userAddress) => __awaiter(void 0, void 0, void 0, function* () {
        const operation = 'auditHardware';
        setLoadingState(operation, true);
        try {
            const result = yield supplyChainService.auditHardware(serial, passed, reportHash, userAddress);
            if (result.success && result.hash) {
                handleSuccess(operation, result.hash);
                return result;
            }
            else {
                throw new Error(result.error || 'Auditoría fallida');
            }
        }
        catch (error) {
            return {
                success: false,
                error: handleError(error, operation)
            };
        }
        finally {
            setLoadingState(operation, false);
        }
    }), [handleError, handleSuccess, setLoadingState]);
    /**
     * Valida software
     * @param serial Número de serie
     * @param osVersion Versión del sistema
     * @param passed Si pasó la validación
     */
    const validateSoftware = (0, react_1.useCallback)((serial, osVersion, passed) => __awaiter(void 0, void 0, void 0, function* () {
        const operation = 'validateSoftware';
        setLoadingState(operation, true);
        try {
            const result = yield supplyChainService.validateSoftware(serial, osVersion, passed);
            if (result.success && result.hash) {
                handleSuccess(operation, result.hash);
                return result;
            }
            else {
                throw new Error(result.error || 'Validación fallida');
            }
        }
        catch (error) {
            return {
                success: false,
                error: handleError(error, operation)
            };
        }
        finally {
            setLoadingState(operation, false);
        }
    }), [handleError, handleSuccess, setLoadingState]);
    /**
     * Asigna netbook a estudiante
     * @param serial Número de serie
     * @param schoolHash Hash de la escuela
     * @param studentHash Hash del estudiante
     */
    const assignToStudent = (0, react_1.useCallback)((serial, schoolHash, studentHash) => __awaiter(void 0, void 0, void 0, function* () {
        const operation = 'assignToStudent';
        setLoadingState(operation, true);
        try {
            const result = yield supplyChainService.assignToStudent(serial, schoolHash, studentHash);
            if (result.success && result.hash) {
                handleSuccess(operation, result.hash);
                return result;
            }
            else {
                throw new Error(result.error || 'Asignación fallida');
            }
        }
        catch (error) {
            return {
                success: false,
                error: handleError(error, operation)
            };
        }
        finally {
            setLoadingState(operation, false);
        }
    }), [handleError, handleSuccess, setLoadingState]);
    /**
     * Obtiene el estado de una netbook
     * @param serial Número de serie
     */
    const getNetbookState = (0, react_1.useCallback)((serial) => __awaiter(void 0, void 0, void 0, function* () {
        const operation = 'getNetbookState';
        setLoadingState(operation, true);
        try {
            const state = yield supplyChainService.getNetbookState(serial);
            activity_logger_1.ActivityLogger.system(operation, `Estado obtenido para ${serial}: ${state}`);
            return state;
        }
        catch (error) {
            handleError(error, operation);
            return null;
        }
        finally {
            setLoadingState(operation, false);
        }
    }), [handleError, setLoadingState]);
    /**
     * Obtiene el reporte completo de una netbook
     * @param serial Número de serie
     */
    const getNetbookReport = (0, react_1.useCallback)((serial) => __awaiter(void 0, void 0, void 0, function* () {
        const operation = 'getNetbookReport';
        setLoadingState(operation, true);
        try {
            const report = yield supplyChainService.getNetbookReport(serial);
            activity_logger_1.ActivityLogger.system(operation, `Reporte obtenido para ${serial}`);
            return report;
        }
        catch (error) {
            handleError(error, operation);
            return null;
        }
        finally {
            setLoadingState(operation, false);
        }
    }), [handleError, setLoadingState]);
    /**
     * Obtiene todos los números de serie
     */
    const getAllSerialNumbers = (0, react_1.useCallback)(() => __awaiter(void 0, void 0, void 0, function* () {
        const operation = 'getAllSerialNumbers';
        setLoadingState(operation, true);
        try {
            const serials = yield supplyChainService.getAllSerialNumbers();
            activity_logger_1.ActivityLogger.system(operation, `Se obtuvieron ${serials.length} números de serie`);
            return serials;
        }
        catch (error) {
            handleError(error, operation);
            return [];
        }
        finally {
            setLoadingState(operation, false);
        }
    }), [handleError, setLoadingState]);
    return {
        // Operaciones de netbooks
        registerNetbooks,
        auditHardware,
        validateSoftware,
        assignToStudent,
        // Consultas de netbooks
        getNetbookState,
        getNetbookReport,
        getAllSerialNumbers,
        // Estado
        isLoading
    };
};
exports.useSupplyChainContract = useSupplyChainContract;
