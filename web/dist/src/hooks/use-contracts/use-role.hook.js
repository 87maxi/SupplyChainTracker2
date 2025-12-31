"use strict";
// web/src/hooks/use-contracts/use-role.hook.ts
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
exports.useRoleContract = void 0;
const react_1 = require("react");
const role_service_1 = require("@/services/contracts/role.service");
const use_toast_1 = require("@/hooks/use-toast");
const activity_logger_1 = require("@/lib/activity-logger");
// Instancia única del servicio (singleton)
const roleService = new role_service_1.RoleService();
/**
 * Hook personalizado para gestionar roles en el contrato inteligente
 * Proporciona funciones para todas las operaciones de roles con manejo de estado
 */
const useRoleContract = () => {
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
     * Verifica si una dirección tiene un rol específico
     * @param roleName Nombre del rol
     * @param userAddress Dirección del usuario
     * @returns True si tiene el rol, false en caso contrario
     */
    const hasRole = (0, react_1.useCallback)((roleName, userAddress) => __awaiter(void 0, void 0, void 0, function* () {
        const operation = `hasRole:${roleName}`;
        setLoadingState(operation, true);
        try {
            const result = yield roleService.hasRole(roleName, userAddress);
            activity_logger_1.ActivityLogger.system(operation, `Verificación de rol para ${userAddress}: ${result}`);
            return result;
        }
        catch (error) {
            handleError(error, operation);
            return false;
        }
        finally {
            setLoadingState(operation, false);
        }
    }), [handleError, setLoadingState]);
    /**
     * Otorga un rol a una dirección
     * @param roleName Nombre del rol
     * @param userAddress Dirección del usuario
     */
    const grantRole = (0, react_1.useCallback)((roleName, userAddress) => __awaiter(void 0, void 0, void 0, function* () {
        const operation = `grantRole:${roleName}`;
        setLoadingState(operation, true);
        try {
            const result = yield roleService.grantRole(roleName, userAddress);
            if (result.success && result.hash) {
                handleSuccess(operation, result.hash);
                activity_logger_1.ActivityLogger.roleChange(userAddress, 'grant', roleName, 'success');
                return result;
            }
            else {
                throw new Error(result.error || 'No se pudo otorgar el rol');
            }
        }
        catch (error) {
            activity_logger_1.ActivityLogger.roleChange(userAddress, 'grant', roleName, 'failed');
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
     * Revoca un rol de una dirección
     * @param roleName Nombre del rol
     * @param userAddress Dirección del usuario
     */
    const revokeRole = (0, react_1.useCallback)((roleName, userAddress) => __awaiter(void 0, void 0, void 0, function* () {
        const operation = `revokeRole:${roleName}`;
        setLoadingState(operation, true);
        try {
            const result = yield roleService.revokeRole(roleName, userAddress);
            if (result.success && result.hash) {
                handleSuccess(operation, result.hash);
                activity_logger_1.ActivityLogger.roleChange(userAddress, 'revoke', roleName, 'success');
                return result;
            }
            else {
                throw new Error(result.error || 'No se pudo revocar el rol');
            }
        }
        catch (error) {
            activity_logger_1.ActivityLogger.roleChange(userAddress, 'revoke', roleName, 'failed');
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
     * Obtiene todos los miembros de un rol
     * @param roleName Nombre del rol
     * @returns Miembros del rol
     */
    const getRoleMembers = (0, react_1.useCallback)((roleName) => __awaiter(void 0, void 0, void 0, function* () {
        const operation = `getRoleMembers:${roleName}`;
        setLoadingState(operation, true);
        try {
            const result = yield roleService.getRoleMembers(roleName);
            activity_logger_1.ActivityLogger.system(operation, `Se obtuvieron ${result.count} miembros para ${roleName}`);
            return result;
        }
        catch (error) {
            handleError(error, operation);
            return {
                role: roleName,
                members: [],
                count: 0
            };
        }
        finally {
            setLoadingState(operation, false);
        }
    }), [handleError, setLoadingState]);
    /**
     * Obtiene todos los miembros de todos los roles
     * @returns Mapa de roles con sus miembros
     */
    const getAllRolesSummary = (0, react_1.useCallback)(() => __awaiter(void 0, void 0, void 0, function* () {
        const operation = 'getAllRolesSummary';
        setLoadingState(operation, true);
        try {
            const summary = yield roleService.getAllRolesSummary();
            // Registrar estadísticas
            const totalUsers = Object.values(summary).reduce((acc, role) => acc + role.count, 0);
            activity_logger_1.ActivityLogger.system(operation, `Se obtuvo resumen de roles: ${totalUsers} usuarios totales`);
            return summary;
        }
        catch (error) {
            handleError(error, operation);
            return {};
        }
        finally {
            setLoadingState(operation, false);
        }
    }), [handleError, setLoadingState]);
    return {
        hasRole,
        grantRole,
        revokeRole,
        getRoleMembers,
        getAllRolesSummary,
        isLoading,
        handleSuccess,
        handleError
    };
};
exports.useRoleContract = useRoleContract;
