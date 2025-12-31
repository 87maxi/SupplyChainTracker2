"use strict";
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
exports.useUserRoles = void 0;
const react_1 = require("react");
const useWeb3_1 = require("@/hooks/useWeb3");
const SupplyChainService_1 = require("@/services/SupplyChainService");
const env_1 = require("@/lib/env");
const roleUtils_1 = require("@/lib/roleUtils");
const cache_1 = require("@/lib/utils/cache");
const useUserRoles = () => {
    const { address, isConnected } = (0, useWeb3_1.useWeb3)();
    const cacheKey = `user_roles_${address || 'unknown'}`;
    const [userRoles, setUserRoles] = (0, react_1.useState)({ isAdmin: false,
        isManufacturer: false,
        isHardwareAuditor: false,
        isSoftwareTechnician: false,
        isSchool: false,
        isLoading: true,
        hasRole: () => false,
        activeRoleNames: [],
        refreshRoles: () => { }
    });
    const checkRoles = (0, react_1.useCallback)(() => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        // Early return if not connected or missing required data
        if (!isConnected || !address || !env_1.NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS) {
            if (isConnected && address && !env_1.NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS) {
                console.error('Contract address is not configured. Please check your .env file.');
            }
            setUserRoles(prev => (Object.assign(Object.assign({}, prev), { isLoading: false })));
            return;
        }
        // Check cache first
        const cachedRoles = (0, cache_1.getCache)(cacheKey);
        if (cachedRoles && !(0, cache_1.isCacheStale)(cacheKey)) {
            setUserRoles(cachedRoles);
            return;
        }
        // If we have stale data, serve it while revalidating
        if (cachedRoles && !(0, cache_1.isRevalidating)(cacheKey)) {
            setUserRoles(cachedRoles);
            (0, cache_1.startRevalidation)(cacheKey);
        }
        else if (!cachedRoles) {
            setUserRoles(prev => (Object.assign(Object.assign({}, prev), { isLoading: true })));
        }
        console.log('[useUserRoles] Starting role check for address:', address);
        try {
            const contractAddress = env_1.NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS;
            // Get role hashes from the contract (using cached utility)
            const hashes = yield (0, roleUtils_1.getRoleHashes)();
            const fabricanteRoleStr = hashes.FABRICANTE;
            const auditorHwRoleStr = hashes.AUDITOR_HW;
            const tecnicoSwRoleStr = hashes.TECNICO_SW;
            const escuelaRoleStr = hashes.ESCUELA;
            const defaultAdminRoleStr = hashes.ADMIN;
            // Check roles using ContractRoles
            const [isAdmin, isManufacturer, isHardwareAuditor, isSoftwareTechnician, isSchool] = yield Promise.all([
                (0, SupplyChainService_1.hasRole)('DEFAULT_ADMIN_ROLE', address),
                (0, SupplyChainService_1.hasRole)('FABRICANTE_ROLE', address),
                (0, SupplyChainService_1.hasRole)('AUDITOR_HW_ROLE', address),
                (0, SupplyChainService_1.hasRole)('TECNICO_SW_ROLE', address),
                (0, SupplyChainService_1.hasRole)('ESCUELA_ROLE', address)
            ]);
            console.log('Role check results:', {
                isAdmin,
                isManufacturer,
                isHardwareAuditor,
                isSoftwareTechnician,
                isSchool,
                address
            });
            // Build active role names array
            const activeRoleNames = [];
            if (isAdmin)
                activeRoleNames.push('DEFAULT_ADMIN_ROLE');
            if (isManufacturer)
                activeRoleNames.push('FABRICANTE_ROLE');
            if (isHardwareAuditor)
                activeRoleNames.push('AUDITOR_HW_ROLE');
            if (isSoftwareTechnician)
                activeRoleNames.push('TECNICO_SW_ROLE');
            if (isSchool)
                activeRoleNames.push('ESCUELA_ROLE');
            const newRoles = {
                isAdmin,
                isManufacturer,
                isHardwareAuditor,
                isSoftwareTechnician,
                isSchool,
                isLoading: false,
                activeRoleNames,
                hasRole: (roleName) => {
                    switch (roleName) {
                        case 'DEFAULT_ADMIN_ROLE': return isAdmin;
                        case 'FABRICANTE_ROLE': return isManufacturer;
                        case 'AUDITOR_HW_ROLE': return isHardwareAuditor;
                        case 'TECNICO_SW_ROLE': return isSoftwareTechnician;
                        case 'ESCUELA_ROLE': return isSchool;
                        default: return false;
                    }
                },
                refreshRoles: checkRoles
            };
            // Cache the result with 30 second TTL and stale-while-revalidate
            (0, cache_1.setCache)(cacheKey, newRoles, 30000, true);
            // Always update state
            setUserRoles(newRoles);
            // Mark revalidation as complete
            (0, cache_1.completeRevalidation)(cacheKey);
        }
        catch (error) {
            console.error('Error fetching user roles:', error);
            // Check for specific WalletConnect/Reown allowlist error
            if (((_a = error.message) === null || _a === void 0 ? void 0 : _a.includes('Allowlist')) || ((_b = error.details) === null || _b === void 0 ? void 0 : _b.includes('Allowlist'))) {
                console.error('CRITICAL: Origin http://localhost:3000 not found on Allowlist. Please update your configuration on cloud.reown.com');
            }
            // Mark revalidation as complete on error
            (0, cache_1.completeRevalidation)(cacheKey);
            // If we have stale data and we're revalidating, keep showing it
            if (userRoles.isLoading && (0, cache_1.getCache)(cacheKey)) {
                setUserRoles(prev => (Object.assign(Object.assign({}, prev), { isLoading: false })));
            }
            else {
                setUserRoles(prev => (Object.assign(Object.assign({}, prev), { isLoading: false })));
            }
        }
    }), [address, isConnected, cacheKey]);
    (0, react_1.useEffect)(() => {
        checkRoles();
    }, [checkRoles]);
    // Listen for role updates to refresh roles
    (0, react_1.useEffect)(() => {
        const { eventBus, EVENTS } = require('@/lib/events');
        const unsubscribe = eventBus.on(EVENTS.ROLE_UPDATED, () => {
            console.log('[useUserRoles] Role update detected, refreshing roles...');
            checkRoles();
        });
        return () => unsubscribe();
    }, [checkRoles]);
    // Force role refresh when address changes
    (0, react_1.useEffect)(() => {
        if (isConnected && address) {
            console.log('Address changed, refreshing roles for:', address);
            checkRoles();
        }
    }, [address, isConnected, checkRoles]);
    // Effect to update refreshRoles
    (0, react_1.useEffect)(() => {
        setUserRoles(prev => {
            // Only update refreshRoles if it's different
            if (prev.refreshRoles !== checkRoles) {
                return Object.assign(Object.assign({}, prev), { refreshRoles: checkRoles });
            }
            return prev;
        });
    }, [checkRoles]);
    return Object.assign(Object.assign({}, userRoles), { refreshRoles: checkRoles });
};
exports.useUserRoles = useUserRoles;
