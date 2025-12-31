"use strict";
// web/src/hooks/useRoleData.ts
// Specialized hook for role data with proper address context
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
exports.useRoleData = void 0;
const react_1 = require("react");
const useWeb3_1 = require("@/hooks/useWeb3");
const use_cached_data_1 = require("@/hooks/use-cached-data");
const DEFAULT_ROLE_DATA = {
    isAdmin: false,
    isManufacturer: false,
    isHardwareAuditor: false,
    isSoftwareTechnician: false,
    isSchool: false,
};
const useRoleData = () => {
    const { address } = (0, useWeb3_1.useWeb3)();
    const cacheKey = `user_roles_${address || 'unknown'}`;
    const fetchRoles = (0, react_1.useCallback)(() => __awaiter(void 0, void 0, void 0, function* () {
        if (!address)
            return DEFAULT_ROLE_DATA;
        // This would call the actual role checking logic from SupplyChainService
        // For now, returning default data
        return DEFAULT_ROLE_DATA;
    }), [address]);
    const { data, isLoading, error, refresh, invalidate } = (0, use_cached_data_1.useCachedData)(cacheKey, fetchRoles, {
        ttl: 30 * 1000, // 30 seconds
        staleWhileRevalidate: true,
    });
    return {
        roles: data || DEFAULT_ROLE_DATA,
        isLoading,
        error,
        refresh,
        invalidate,
    };
};
exports.useRoleData = useRoleData;
