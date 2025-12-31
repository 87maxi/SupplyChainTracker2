"use strict";
// web/src/lib/activity-logger.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupOldLogs = exports.getLogStats = exports.filterLogs = exports.ActivityLogger = exports.logActivity = exports.getActivityLogs = void 0;
const ACTIVITY_LOG_KEY = 'supply-chain-activity-logs';
const MAX_LOGS = 1000; // Máximo número de logs a mantener
// Obtener logs del localStorage
const getActivityLogs = () => {
    if (typeof window === 'undefined')
        return [];
    try {
        const stored = localStorage.getItem(ACTIVITY_LOG_KEY);
        if (!stored)
            return [];
        const logs = JSON.parse(stored);
        return logs.map((log) => (Object.assign(Object.assign({}, log), { timestamp: new Date(log.timestamp) })));
    }
    catch (error) {
        console.error('Error reading activity logs:', error);
        return [];
    }
};
exports.getActivityLogs = getActivityLogs;
// Guardar nuevo log
const logActivity = (log) => {
    if (typeof window === 'undefined')
        return;
    try {
        const logs = (0, exports.getActivityLogs)();
        const newLog = Object.assign(Object.assign({}, log), { id: Math.random().toString(36).substr(2, 9), timestamp: new Date() });
        // Mantener solo los logs más recientes
        const updatedLogs = [newLog, ...logs].slice(0, MAX_LOGS);
        localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(updatedLogs));
    }
    catch (error) {
        console.error('Error saving activity log:', error);
    }
};
exports.logActivity = logActivity;
// Helper functions para tipos específicos de logs
exports.ActivityLogger = {
    roleChange: (address, action, role, status) => {
        (0, exports.logActivity)({
            type: 'role_change',
            action,
            description: `${action} rol ${role}`,
            address,
            status,
            metadata: { role }
        });
    },
    tokenCreated: (address, tokenId, status) => {
        (0, exports.logActivity)({
            type: 'token_created',
            action: 'create_token',
            description: `Token creado: ${tokenId}`,
            address,
            status,
            metadata: { tokenId }
        });
    },
    transfer: (address, from, to, tokenId, status) => {
        (0, exports.logActivity)({
            type: 'transfer',
            action: 'transfer_token',
            description: `Transferencia de ${from} a ${to}`,
            address,
            status,
            metadata: { from, to, tokenId }
        });
    },
    approval: (address, action, requestId, status) => {
        (0, exports.logActivity)({
            type: 'approval',
            action,
            description: `${action} solicitud ${requestId}`,
            address,
            status,
            metadata: { requestId }
        });
    },
    system: (action, description, metadata) => {
        (0, exports.logActivity)({
            type: 'system',
            action,
            description,
            address: 'system',
            status: 'success',
            metadata
        });
    },
    error: (address, action, error, metadata) => {
        (0, exports.logActivity)({
            type: 'error',
            action,
            description: `Error: ${error}`,
            address,
            status: 'failed',
            metadata: Object.assign({ error }, metadata)
        });
    }
};
// Filtrar logs
const filterLogs = (logs, filters) => {
    return logs.filter(log => {
        if (filters.type && log.type !== filters.type)
            return false;
        if (filters.address && log.address !== filters.address)
            return false;
        if (filters.status && log.status !== filters.status)
            return false;
        if (filters.startDate && log.timestamp < filters.startDate)
            return false;
        if (filters.endDate && log.timestamp > filters.endDate)
            return false;
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            const matches = log.action.toLowerCase().includes(searchTerm) ||
                log.description.toLowerCase().includes(searchTerm) ||
                log.address.toLowerCase().includes(searchTerm);
            if (!matches)
                return false;
        }
        return true;
    });
};
exports.filterLogs = filterLogs;
// Obtener estadísticas de logs
const getLogStats = (logs) => {
    const stats = {
        total: logs.length,
        byType: {},
        byStatus: {},
        byAddress: {},
        recent24h: logs.filter(log => Date.now() - log.timestamp.getTime() < 24 * 60 * 60 * 1000).length
    };
    logs.forEach(log => {
        stats.byType[log.type] = (stats.byType[log.type] || 0) + 1;
        stats.byStatus[log.status] = (stats.byStatus[log.status] || 0) + 1;
        stats.byAddress[log.address] = (stats.byAddress[log.address] || 0) + 1;
    });
    return stats;
};
exports.getLogStats = getLogStats;
// Limpiar logs antiguos (más de 30 días)
const cleanupOldLogs = () => {
    const logs = (0, exports.getActivityLogs)();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const filteredLogs = logs.filter(log => log.timestamp > thirtyDaysAgo);
    if (filteredLogs.length !== logs.length) {
        localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(filteredLogs));
        return logs.length - filteredLogs.length;
    }
    return 0;
};
exports.cleanupOldLogs = cleanupOldLogs;
