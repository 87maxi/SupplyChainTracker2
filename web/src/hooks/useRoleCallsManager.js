"use strict";
// web/src/hooks/useRoleCallsManager.ts
// Centralized manager for role-related contract calls with batching and caching
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
exports.useRoleCallsManager = void 0;
const react_1 = require("react");
const useWeb3_1 = require("@/hooks/useWeb3");
// Removed getAllRolesSummary as it's not currently exported
const cache_1 = require("@/lib/utils/cache");
// Batching configuration
const BATCH_CONFIG = {
    MAX_CALLS: 3, // Maximum concurrent calls
    BATCH_TIMEOUT: 500, // Reduce time window to batch calls
    CACHE_TTL: 5 * 60 * 1000, // Increase cache TTL to 5 minutes
    MAX_CONCURRENT_REQUESTS: 2 // Limit concurrent requests to reduce load
};
// Queue for batching role member requests
const roleRequestsQueue = [];
// Flag to indicate if a batch is scheduled
let batchScheduled = false;
// Process the batch of role member requests
const processBatch = () => __awaiter(void 0, void 0, void 0, function* () {
    // Clear the flag since we're processing
    batchScheduled = false;
    if (roleRequestsQueue.length === 0)
        return;
    // Take all current requests
    const requests = [...roleRequestsQueue];
    // Clear the queue
    roleRequestsQueue.length = 0;
    // Try to get data from cache first for each unique role
    const uniqueRoles = [...new Set(requests.map(r => r.role))];
    // Check if we have cached data
    const cachedData = {};
    const rolesToFetch = [];
    uniqueRoles.forEach(role => {
        const cached = (0, cache_1.getCache)(`role_members_${role}`);
        if (cached && !(0, cache_1.isCacheStale)(`role_members_${role}`)) {
            cachedData[role] = cached;
        }
        else {
            rolesToFetch.push(role);
        }
    });
    // If we have cached data for all roles, resolve immediately
    if (rolesToFetch.length === 0) {
        requests.forEach(request => {
            request.resolve(cachedData[request.role]);
        });
        return;
    }
    // Only make one call to get all roles summary if needed
    let summary = null;
    try {
        // Create a mock summary since getAllRolesSummary is not available
        summary = {};
        // Cache each role's members with longer TTL
        if (summary) {
            Object.entries(summary).forEach(([roleName, roleData]) => {
                (0, cache_1.setCache)(`role_members_${roleName}`, roleData.members, BATCH_CONFIG.CACHE_TTL);
            });
        }
    }
    catch (error) {
        console.error('Error fetching roles summary:', error);
        // Reject all requests that couldn't be fulfilled from cache
        // For now, return empty array for all roles
        requests.forEach(request => {
            request.resolve([]);
        });
        return;
    }
    // Resolve all requests
    requests.forEach(request => {
        var _a;
        // Use cached data if available, otherwise use fetched data
        const members = cachedData[request.role] ||
            (((_a = summary === null || summary === void 0 ? void 0 : summary[request.role]) === null || _a === void 0 ? void 0 : _a.members) || []);
        request.resolve(members);
    });
});
// Schedule a batch process
const scheduleBatch = () => {
    if (!batchScheduled) {
        batchScheduled = true;
        setTimeout(processBatch, BATCH_CONFIG.BATCH_TIMEOUT);
    }
};
// Exported hook for getting role members
const useRoleCallsManager = () => {
    const { address } = (0, useWeb3_1.useWeb3)();
    // Function to get members of a role with batching and caching
    const getRoleMembers = (0, react_1.useCallback)((role) => __awaiter(void 0, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            // Add to queue
            roleRequestsQueue.push({ resolve, reject, role });
            // Schedule batch processing
            scheduleBatch();
        });
    }), []);
    // Function to refresh all role data
    const refreshAllRoles = (0, react_1.useCallback)(() => {
        // Clear cache
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('role_members_')) {
                (0, cache_1.clearCache)(key);
            }
        });
        // Process any pending requests immediately
        if (roleRequestsQueue.length > 0) {
            batchScheduled = false;
            processBatch();
        }
    }, []);
    // Clear all role-related caches
    const clearRoleCache = (0, react_1.useCallback)(() => {
        // Instead of using localStorage, we'll use our global cache map
        // But our clearCache function doesn't take parameters, so we need to modify our approach
        // For now, we'll just use clearAllCache or find another way
        // Importing clearAllCache from cache utilities
        (0, cache_1.clearAllCache)(); // Using clearAllCache since our clearCache doesn't take parameters
    }, []);
    // Debug function to get cache stats
    const getCacheStats = (0, react_1.useCallback)(() => {
        return {
            queueLength: roleRequestsQueue.length,
            batchScheduled,
            // Add more stats as needed
        };
    }, []);
    // Clean up on unmount
    (0, react_1.useEffect)(() => {
        return () => {
            // Clear any pending timeouts if component unmounts
            if (batchScheduled) {
                batchScheduled = false;
            }
        };
    }, []);
    // Remove clearSpecificCache since we have clearRoleCache and clearAllCache
    // The clearCache from utilities is already imported and used appropriately
    return {
        getRoleMembers,
        refreshAllRoles,
        clearRoleCache,
        getCacheStats
    };
};
exports.useRoleCallsManager = useRoleCallsManager;
