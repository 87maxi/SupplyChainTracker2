"use strict";
// web/src/hooks/useTransaction.ts
'use client';
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
exports.useRoleTransaction = exports.useTransaction = void 0;
const react_1 = require("react");
const use_notifications_1 = require("./use-notifications");
const initialState = {
    isProcessing: false,
    isSuccess: false,
    isError: false,
    error: null,
    txHash: null
};
const useTransaction = () => {
    const [state, setState] = (0, react_1.useState)(initialState);
    const { transaction: notify } = (0, use_notifications_1.useTransactionNotifications)();
    const execute = (0, react_1.useCallback)((transactionFn_1, ...args_1) => __awaiter(void 0, [transactionFn_1, ...args_1], void 0, function* (transactionFn, options = {}) {
        const { successMessage = 'Transacción completada exitosamente', errorMessage = 'Error en la transacción', pendingMessage = 'Procesando transacción...' } = options;
        setState({
            isProcessing: true,
            isSuccess: false,
            isError: false,
            error: null,
            txHash: null
        });
        let notificationId;
        try {
            const result = yield transactionFn();
            // Extraer hash de transacción si está disponible
            let txHash = null;
            if (result && typeof result === 'object' && 'transactionHash' in result) {
                txHash = result.transactionHash;
            }
            setState({
                isProcessing: false,
                isSuccess: true,
                isError: false,
                error: null,
                txHash
            });
            if (txHash) {
                notify.success(txHash, successMessage);
            }
            else {
                notify.success('', successMessage);
            }
            return result;
        }
        catch (error) {
            console.error('Transaction error:', error);
            const errorMessageText = error.message || error.toString();
            setState({
                isProcessing: false,
                isSuccess: false,
                isError: true,
                error: errorMessageText,
                txHash: null
            });
            // Manejar diferentes tipos de errores
            if (errorMessageText.includes('user rejected') || errorMessageText.includes('User rejected')) {
                notify.rejected('El usuario rechazó la transacción');
            }
            else if (errorMessageText.includes('reverted')) {
                notify.error(error, 'La transacción fue revertida en la blockchain');
            }
            else {
                notify.error(error, errorMessage);
            }
            return null;
        }
    }), [notify]);
    const reset = (0, react_1.useCallback)(() => {
        setState(initialState);
    }, []);
    return {
        state,
        execute,
        reset
    };
};
exports.useTransaction = useTransaction;
// Hook especializado para operaciones de roles
const useRoleTransaction = () => {
    const transaction = (0, exports.useTransaction)();
    const grantRole = (0, react_1.useCallback)((grantRoleFn, role, userAddress, roleName) => __awaiter(void 0, void 0, void 0, function* () {
        return transaction.execute(() => grantRoleFn(role, userAddress), {
            successMessage: `Rol ${roleName} otorgado exitosamente`,
            errorMessage: `Error al otorgar el rol ${roleName}`,
            pendingMessage: `Otorgando rol ${roleName}...`
        });
    }), [transaction]);
    const revokeRole = (0, react_1.useCallback)((revokeRoleFn, role, userAddress, roleName) => __awaiter(void 0, void 0, void 0, function* () {
        return transaction.execute(() => revokeRoleFn(role, userAddress), {
            successMessage: `Rol ${roleName} revocado exitosamente`,
            errorMessage: `Error al revocar el rol ${roleName}`,
            pendingMessage: `Revocando rol ${roleName}...`
        });
    }), [transaction]);
    return Object.assign(Object.assign({}, transaction), { grantRole,
        revokeRole });
};
exports.useRoleTransaction = useRoleTransaction;
