"use strict";
// web/src/lib/utils/cache.ts
// Global cache utilities for the application
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCacheStats = exports.clearAllCache = exports.clearCache = exports.completeRevalidation = exports.startRevalidation = exports.isRevalidating = exports.isCacheStale = exports.setCache = exports.getCache = void 0;
// Global cache storage
const globalCache = new Map();
// Store to control revalidation and prevent multiple calls
const revalidationQueue = new Map();
// Cache configuration
const CACHE_CONFIG = {
    TTL: {
        USER_ROLES: 30 * 1000, // 30 seconds
        STATIC_DATA: 5 * 60 * 1000, // 5 minutes
        ROLE_MEMBERS: 2 * 60 * 1000, // 2 minutes
        NETBOOK_INFO: 15 * 1000 // 15 seconds
    },
    STALE_WHILE_REVALIDATE: {
        USER_ROLES: true,
        STATIC_DATA: true,
        ROLE_MEMBERS: false,
        NETBOOK_INFO: true
    }
};
/**
 * Gets an item from the cache
 * @param key Cache key
 * @returns Cached data or null if not found or expired
 */
const getCache = (key) => {
    const item = globalCache.get(key);
    if (!item)
        return null;
    const now = Date.now();
    // If expired, remove and return null
    if (item.expiresAt <= now) {
        globalCache.delete(key);
        return null;
    }
    return item.data;
};
exports.getCache = getCache;
/**
 * Sets an item in the cache
 * @param key Cache key
 * @param data Data to cache
 * @param ttl Time to live in milliseconds
 * @param staleWhileRevalidate Whether to allow stale data while revalidating
 */
const setCache = (key, data, ttl, staleWhileRevalidate = false) => {
    const now = Date.now();
    const expiresAt = now + ttl;
    const staleAt = staleWhileRevalidate ? now + (ttl / 2) : expiresAt;
    globalCache.set(key, {
        data,
        timestamp: now,
        expiresAt,
        staleAt
    });
};
exports.setCache = setCache;
/**
 * Checks if cache item is stale (needs revalidation)
 * @param key Cache key
 * @returns Boolean indicating if item is stale
 */
const isCacheStale = (key) => {
    const item = globalCache.get(key);
    if (!item)
        return true;
    return Date.now() >= item.staleAt;
};
exports.isCacheStale = isCacheStale;
/**
 * Checks if a revalidation is in progress
 * @param key Cache key
 * @returns Boolean indicating if revalidation is in progress
 */
const isRevalidating = (key) => {
    return revalidationQueue.has(key);
};
exports.isRevalidating = isRevalidating;
/**
 * Marks a revalidation as started
 * @param key Cache key
 */
const startRevalidation = (key) => {
    revalidationQueue.set(key, true);
};
exports.startRevalidation = startRevalidation;
/**
 * Marks a revalidation as completed
 * @param key Cache key
 */
const completeRevalidation = (key) => {
    revalidationQueue.delete(key);
};
exports.completeRevalidation = completeRevalidation;
/**
 * Clears a specific cache item
 * @param key Cache key
 */
const clearCache = (key) => {
    globalCache.delete(key);
    revalidationQueue.delete(key);
};
exports.clearCache = clearCache;
/**
 * Clears all cache
 */
const clearAllCache = () => {
    globalCache.clear();
    revalidationQueue.clear();
};
exports.clearAllCache = clearAllCache;
/**
 * Gets cache stats
 * @returns Object with cache statistics
 */
const getCacheStats = () => {
    const now = Date.now();
    const stats = {
        totalItems: globalCache.size,
        expiredItems: Array.from(globalCache.values()).filter(item => item.expiresAt <= now).length,
        staleItems: Array.from(globalCache.values()).filter(item => item.staleAt <= now).length,
        memoryUsage: JSON.stringify(Array.from(globalCache.values())).length,
        cacheKeys: Array.from(globalCache.keys())
    };
    return stats;
};
exports.getCacheStats = getCacheStats;
// Cleanup expired items periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, item] of globalCache.entries()) {
        if (item.expiresAt <= now) {
            globalCache.delete(key);
        }
    }
}, 60 * 1000); // Every minute
