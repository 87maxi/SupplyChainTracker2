"use strict";
// web/src/hooks/use-cached-data.ts
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
exports.getCacheStats = exports.clearAllCache = exports.useLiveData = exports.useStaticData = exports.useCachedData = void 0;
const react_1 = require("react");
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos
const DEFAULT_MAX_SIZE = 100;
// Cache en memoria global (compartido entre componentes)
const globalCache = new Map();
// Cola para controlar revalidaciones y evitar múltiples llamadas simultáneas
const revalidationQueue = new Map();
// Limpiar cache expirado periódicamente
setInterval(() => {
    const now = Date.now();
    for (const [key, item] of globalCache.entries()) {
        if (item.expiresAt <= now) {
            globalCache.delete(key);
        }
    }
}, 60 * 1000); // Cada minuto
const useCachedData = (key, fetcher, options = {}) => {
    // Create a stable reference for fetcher
    const stableFetcher = (0, react_1.useCallback)(fetcher, []);
    // In a real implementation, we would get address from Web3Context
    // For now, we'll use a placeholder
    const address = '';
    const { ttl = DEFAULT_TTL, staleWhileRevalidate = true, maxSize = DEFAULT_MAX_SIZE } = options;
    const [data, setData] = (0, react_1.useState)(null);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [lastUpdated, setLastUpdated] = (0, react_1.useState)(0);
    // Limitar tamaño del cache
    const enforceCacheSize = (0, react_1.useCallback)(() => {
        if (globalCache.size > maxSize) {
            // Eliminar los items más antiguos
            const entries = Array.from(globalCache.entries());
            entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
            const toRemove = entries.slice(0, globalCache.size - maxSize);
            toRemove.forEach(([key]) => globalCache.delete(key));
        }
    }, [maxSize]);
    const fetchData = (0, react_1.useCallback)(() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            setIsLoading(true);
            setError(null);
            const result = yield stableFetcher();
            const now = Date.now();
            // Actualizar cache
            const cacheItem = {
                data: result,
                timestamp: now,
                expiresAt: now + ttl
            };
            globalCache.set(key, cacheItem);
            enforceCacheSize();
            setData(result);
            setLastUpdated(now);
            return result;
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error('Error desconocido');
            setError(error);
            throw error;
        }
        finally {
            setIsLoading(false);
        }
    }), [key, fetcher, ttl, enforceCacheSize]);
    const getCachedData = (0, react_1.useCallback)(() => {
        const cacheKey = `${key}_${address || ''}`;
        const cached = globalCache.get(cacheKey);
        const now = Date.now();
        if (!cached) {
            return null;
        }
        // Datos expirados
        if (cached.expiresAt <= now) {
            if (staleWhileRevalidate) {
                // Usar cola de revalidación para evitar múltiples llamadas simultáneas
                const cacheKey = `${key}_${address || ''}`;
                if (!revalidationQueue.has(cacheKey)) {
                    revalidationQueue.set(cacheKey, true);
                    fetchData().catch(console.error).finally(() => {
                        revalidationQueue.delete(cacheKey);
                    });
                }
                return cached.data;
            }
            return null;
        }
        return cached.data;
    }, [key, address, staleWhileRevalidate, fetchData]);
    const invalidate = (0, react_1.useCallback)(() => {
        const cacheKey = `${key}_${address || ''}`;
        globalCache.delete(cacheKey);
        setData(null);
        setLastUpdated(0);
    }, [key, address]);
    const refresh = (0, react_1.useCallback)(() => {
        invalidate();
        return fetchData();
    }, [invalidate, fetchData]);
    // Cargar datos iniciales
    (0, react_1.useEffect)(() => {
        const cachedData = getCachedData();
        const cacheKey = `${key}_${address || ''}`;
        if (cachedData) {
            setData(cachedData);
            setIsLoading(false);
            // Revalidar datos stale en background
            if (staleWhileRevalidate) {
                const cached = globalCache.get(cacheKey);
                if (cached && cached.expiresAt <= Date.now()) {
                    if (!revalidationQueue.has(cacheKey)) {
                        revalidationQueue.set(cacheKey, true);
                        fetchData().catch(console.error).finally(() => {
                            revalidationQueue.delete(cacheKey);
                        });
                    }
                }
            }
        }
        else {
            fetchData();
        }
    }, [key, address, getCachedData, fetchData, staleWhileRevalidate]);
    return {
        data,
        isLoading,
        error,
        lastUpdated,
        refresh,
        invalidate,
        isStale: () => {
            const cacheKey = `${key}_${address || ''}`;
            const cached = globalCache.get(cacheKey);
            return cached ? cached.expiresAt <= Date.now() : false;
        }
    };
};
exports.useCachedData = useCachedData;
// Hook para datos que no cambian frecuentemente
const useStaticData = (key, fetcher) => {
    return (0, exports.useCachedData)(key, fetcher, {
        ttl: 24 * 60 * 60 * 1000, // 24 horas
        staleWhileRevalidate: true
    });
};
exports.useStaticData = useStaticData;
// Hook para datos que cambian frecuentemente
const useLiveData = (key, fetcher) => {
    return (0, exports.useCachedData)(key, fetcher, {
        ttl: 30 * 1000, // 30 segundos
        staleWhileRevalidate: false
    });
};
exports.useLiveData = useLiveData;
// Utilidad para limpiar cache completo
const clearAllCache = () => {
    globalCache.clear();
};
exports.clearAllCache = clearAllCache;
// Utilidad para obtener stats del cache
const getCacheStats = () => {
    const now = Date.now();
    const stats = {
        totalItems: globalCache.size,
        expiredItems: Array.from(globalCache.values()).filter(item => item.expiresAt <= now).length,
        memoryUsage: JSON.stringify(Array.from(globalCache.values())).length
    };
    return stats;
};
exports.getCacheStats = getCacheStats;
