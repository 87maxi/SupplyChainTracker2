"use strict";
// web/src/hooks/use-notifications.ts
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTransactionNotifications = exports.useNotifications = void 0;
const react_1 = require("react");
// Global state for notifications
let memoryNotifications = [];
const listeners = new Set();
const timeoutRefs = {};
const emit = () => {
    listeners.forEach((listener) => listener([...memoryNotifications]));
};
// Duración por defecto para cada tipo de notificación
const DEFAULT_DURATIONS = {
    success: 5000,
    error: 7000,
    warning: 6000,
    info: 4000
};
const useNotifications = () => {
    const [notifications, setNotifications] = (0, react_1.useState)(memoryNotifications);
    (0, react_1.useEffect)(() => {
        listeners.add(setNotifications);
        return () => {
            listeners.delete(setNotifications);
        };
    }, []);
    const removeNotification = (0, react_1.useCallback)((id) => {
        memoryNotifications = memoryNotifications.filter(notif => notif.id !== id);
        // Limpiar timeout si existe
        if (timeoutRefs[id]) {
            clearTimeout(timeoutRefs[id]);
            delete timeoutRefs[id];
        }
        emit();
    }, []);
    const addNotification = (0, react_1.useCallback)((notification) => {
        const id = Math.random().toString(36).substr(2, 9);
        const timestamp = new Date();
        const duration = notification.duration || DEFAULT_DURATIONS[notification.type];
        const newNotification = Object.assign(Object.assign({}, notification), { id,
            timestamp });
        memoryNotifications = [...memoryNotifications, newNotification];
        emit();
        // Auto-remover notificación después de la duración
        if (duration > 0) {
            timeoutRefs[id] = setTimeout(() => {
                removeNotification(id);
            }, duration);
        }
        return id;
    }, [removeNotification]);
    const clearNotifications = (0, react_1.useCallback)(() => {
        memoryNotifications = [];
        // Limpiar todos los timeouts
        Object.values(timeoutRefs).forEach(clearTimeout);
        Object.keys(timeoutRefs).forEach(key => delete timeoutRefs[key]);
        emit();
    }, []);
    // Helper functions para tipos específicos
    const notify = {
        success: (title, message, duration) => addNotification({ type: 'success', title, message, duration }),
        error: (title, message, duration) => addNotification({ type: 'error', title, message, duration }),
        warning: (title, message, duration) => addNotification({ type: 'warning', title, message, duration }),
        info: (title, message, duration) => addNotification({ type: 'info', title, message, duration })
    };
    return {
        notifications,
        addNotification,
        removeNotification,
        clearNotifications,
        notify
    };
};
exports.useNotifications = useNotifications;
// Hook para notificaciones de transacciones
const useTransactionNotifications = () => {
    const { notify } = (0, exports.useNotifications)();
    const transaction = {
        started: (txHash, message = 'Transacción enviada') => {
            return notify.info('Transacción en progreso', `${message}. Hash: ${txHash.substr(0, 10)}...`, 0 // No auto-close
            );
        },
        success: (txHash, message = 'Transacción exitosa') => {
            return notify.success('¡Éxito!', `${message}. Hash: ${txHash.substr(0, 10)}...`);
        },
        error: (error, message = 'Error en transacción') => {
            const errorMessage = error.message || error.toString();
            return notify.error('Error', `${message}: ${errorMessage}`);
        },
        rejected: (message = 'Transacción rechazada') => {
            return notify.warning('Transacción cancelada', message);
        }
    };
    return { transaction };
};
exports.useTransactionNotifications = useTransactionNotifications;
