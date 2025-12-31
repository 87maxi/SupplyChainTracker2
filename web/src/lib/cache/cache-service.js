"use strict";
// web/src/lib/cache/cache-service.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
/**
 * Servicio de Caché para almacenamiento en memoria y localStorage
 * Implementa un mecanismo TTL (Time To Live) para invalidación automática
 */
class CacheService {
    /**
     * Almacena un valor en caché con un tiempo de vida específico
     * @param key Clave única para el valor
     * @param data Datos a almacenar
     * @param ttl Tiempo de vida en milisegundos (opcional)
     */
    static set(key, data, ttl) {
        if (typeof window === 'undefined')
            return; // SSR safety
        try {
            const item = {
                data,
                expiry: Date.now() + (ttl || this.DEFAULT_TTL)
            };
            localStorage.setItem(this.PREFIX + key, JSON.stringify(item));
        }
        catch (error) {
            console.warn('Cache set failed:', error);
        }
    }
    /**
     * Recupera un valor de la caché si aún es válido
     * @param key Clave del valor a recuperar
     * @returns El valor almacenado o null si no existe o ha expirado
     */
    static get(key) {
        if (typeof window === 'undefined')
            return null;
        try {
            const itemStr = localStorage.getItem(this.PREFIX + key);
            if (!itemStr)
                return null;
            const item = JSON.parse(itemStr);
            if (Date.now() > item.expiry) {
                localStorage.removeItem(this.PREFIX + key);
                return null;
            }
            return item.data;
        }
        catch (error) {
            console.warn('Cache get failed:', error);
            return null;
        }
    }
    /**
     * Elimina un valor específico de la caché
     * @param key Clave del valor a eliminar
     */
    static remove(key) {
        if (typeof window === 'undefined')
            return;
        try {
            localStorage.removeItem(this.PREFIX + key);
        }
        catch (error) {
            console.warn('Cache remove failed:', error);
        }
    }
    /**
     * Limpia todos los datos de la caché
     */
    static clear() {
        if (typeof window === 'undefined')
            return;
        try {
            Object.keys(localStorage)
                .filter(key => key.startsWith(this.PREFIX))
                .forEach(key => localStorage.removeItem(key));
        }
        catch (error) {
            console.warn('Cache clear failed:', error);
        }
    }
}
exports.CacheService = CacheService;
CacheService.DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos
CacheService.PREFIX = 'supplychain-cache:';
