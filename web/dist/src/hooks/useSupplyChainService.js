"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.useSupplyChainService = void 0;
// web/src/hooks/useSupplyChainService.ts
const react_1 = require("react");
const wagmi_1 = require("wagmi");
const roleMapping_1 = require("@/lib/roleMapping");
const supply_chain_service_1 = require("@/services/contracts/supply-chain.service");
// Crear una instancia única del servicio
const supplyChainService = new supply_chain_service_1.SupplyChainService();
const useSupplyChainService = () => {
    const { address } = (0, wagmi_1.useAccount)();
    // Get all serial numbers
    const getAllSerialNumbers = (0, react_1.useCallback)(() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            return yield supplyChainService.getAllSerialNumbers();
        }
        catch (error) {
            console.error('Error in getAllSerialNumbers:', error);
            return [];
        }
    }), []);
    // Role hash mapping utility - now uses centralized roleMapper
    // For backward compatibility, this function maintains the same interface
    // but delegates to the centralized roleMapper for consistency
    const getRoleHashForName = (0, react_1.useCallback)((role) => __awaiter(void 0, void 0, void 0, function* () {
        // Si es un ContractRoles completo (FABRICANTE_ROLE), extraer la parte base
        if (role.endsWith('_ROLE')) {
            const roleBase = role.replace('_ROLE', '');
            return yield roleMapping_1.roleMapper.getRoleHash(roleBase);
        }
        // Si es un nombre de rol básico (FABRICANTE)
        return yield roleMapping_1.roleMapper.getRoleHash(role);
    }), []);
    // Read operations
    const hasRole = (0, react_1.useCallback)((role, userAddress) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const roleHash = yield getRoleHashForName(role);
            return yield supplyChainService.hasRole(roleHash, userAddress);
        }
        catch (error) {
            console.error('Error in hasRole:', error);
            return false;
        }
    }), [getRoleHashForName]);
    // New: Direct role check by hash
    const hasRoleByHash = (0, react_1.useCallback)((roleHash, userAddress) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            return yield supplyChainService.hasRole(roleHash, userAddress);
        }
        catch (error) {
            console.error('Error in hasRoleByHash:', error);
            return false;
        }
    }), []);
    const getRoleCounts = (0, react_1.useCallback)(() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            return yield supplyChainService.getRoleCounts();
        }
        catch (error) {
            console.error('Error in getRoleCounts:', error);
            return {};
        }
    }), []);
    const getRoleMembers = (0, react_1.useCallback)((role) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const roleHash = yield getRoleHashForName(role);
            const members = yield supplyChainService.getRoleMembers(roleHash);
            const roleName = typeof role === 'string' && role.endsWith('_ROLE') ? role : `${role}_ROLE`;
            return {
                role: roleName,
                members,
                count: members.length
            };
        }
        catch (error) {
            console.error('Error in getRoleMembers:', error);
            return { role: 'DEFAULT_ADMIN_ROLE', members: [], count: 0 };
        }
    }), [getRoleHashForName]);
    const getAllRolesSummary = (0, react_1.useCallback)((...args_1) => __awaiter(void 0, [...args_1], void 0, function* (forceRefresh = false) {
        try {
            const CACHE_KEY = 'supply_chain_roles_summary';
            const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
            // 1. Try to load from localStorage first
            if (typeof window !== 'undefined' && !forceRefresh) {
                const cached = localStorage.getItem(CACHE_KEY);
                if (cached) {
                    try {
                        const { data, timestamp } = JSON.parse(cached);
                        if (Date.now() - timestamp < CACHE_DURATION) {
                            return data;
                        }
                    }
                    catch (e) {
                        // Ignore parse errors
                    }
                }
            }
            // 2. Fetch fresh data
            const roleHashes = yield Promise.resolve().then(() => __importStar(require('@/lib/roleUtils'))).then(({ getRoleHashes }) => getRoleHashes());
            // Map roleUtils keys (FABRICANTE) to ContractRoles (FABRICANTE_ROLE)
            const roleMapping = {
                FABRICANTE: 'FABRICANTE_ROLE',
                AUDITOR_HW: 'AUDITOR_HW_ROLE',
                TECNICO_SW: 'TECNICO_SW_ROLE',
                ESCUELA: 'ESCUELA_ROLE',
                ADMIN: 'DEFAULT_ADMIN_ROLE'
            };
            const roleEntries = Object.entries(roleHashes);
            // Fetch all role members concurrently
            const roleResults = yield Promise.all(roleEntries.map((_a) => __awaiter(void 0, [_a], void 0, function* ([key, hash]) {
                try {
                    const members = yield supplyChainService.getRoleMembers(hash);
                    // Convert member addresses to checksummed format
                    const checksummedMembers = members.map(address => {
                        try {
                            return address.toLowerCase().replace('0x', '0x').trim();
                        }
                        catch (e) {
                            console.warn('Invalid address format:', address);
                            return address;
                        }
                    });
                    const contractRoleName = roleMapping[key];
                    return [
                        contractRoleName,
                        {
                            count: checksummedMembers.length,
                            members: checksummedMembers
                        }
                    ];
                }
                catch (error) {
                    console.error(`Error fetching members for role ${key}:`, error);
                    const contractRoleName = roleMapping[key];
                    return [
                        contractRoleName,
                        {
                            count: 0,
                            members: []
                        }
                    ];
                }
            })));
            // Convert to object format
            const summary = Object.fromEntries(roleResults);
            // Cache the result
            if (typeof window !== 'undefined') {
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    data: summary,
                    timestamp: Date.now()
                }));
            }
            return summary;
        }
        catch (error) {
            console.error('Error in getAllRolesSummary:', error);
            return null;
        }
    }), [getRoleHashForName]);
    // Netbook operations
    const getNetbookState = (0, react_1.useCallback)((serial) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            return yield supplyChainService.getNetbookState(serial);
        }
        catch (error) {
            console.error('Error in getNetbookState:', error);
            return 'FABRICADA';
        }
    }), []);
    const getNetbookReport = (0, react_1.useCallback)((serial) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            return yield supplyChainService.getNetbookReport(serial);
        }
        catch (error) {
            console.error('Error in getNetbookReport:', error);
            return null;
        }
    }), []);
    // Write operations - these require wallet connection and return promise with transaction hash
    const grantRole = (0, react_1.useCallback)((roleName, userAddress) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const roleHash = yield getRoleHashForName(roleName);
            return yield supplyChainService.grantRole(roleHash, userAddress);
        }
        catch (error) {
            console.error('Error in grantRole:', error);
            throw error;
        }
    }), [getRoleHashForName]);
    // Grant role by hash directly
    const grantRoleByHash = (0, react_1.useCallback)((roleHash, userAddress) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            return yield supplyChainService.grantRole(roleHash, userAddress);
        }
        catch (error) {
            console.error('Error in grantRoleByHash:', error);
            throw error;
        }
    }), []);
    const revokeRole = (0, react_1.useCallback)((roleHash, userAddress) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            return yield supplyChainService.revokeRole(roleHash, userAddress);
        }
        catch (error) {
            console.error('Error in revokeRole:', error);
            throw error;
        }
    }), []);
    // Netbook operations
    const auditHardware = (0, react_1.useCallback)((serial, passed, reportHash, userAddress) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield supplyChainService.auditHardware(serial, passed, reportHash, userAddress);
            return result;
        }
        catch (error) {
            console.error('Error in auditHardware:', error);
            return { success: false, error: error.message };
        }
    }), []);
    const registerNetbooks = (0, react_1.useCallback)((serials, batches, specs, userAddress) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield supplyChainService.registerNetbooks(serials, batches, specs, userAddress);
            return result;
        }
        catch (error) {
            console.error('Error in registerNetbooks:', error);
            return { success: false, error: error.message };
        }
    }), []);
    // Netbook operations
    const validateSoftware = (0, react_1.useCallback)((serial, osVersion, passed, userAddress) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield supplyChainService.validateSoftware(serial, osVersion, passed, userAddress);
            return result;
        }
        catch (error) {
            console.error('Error in validateSoftware:', error);
            return { success: false, error: error.message };
        }
    }), []);
    // Netbook operations
    const assignToStudent = (0, react_1.useCallback)((serial, schoolHash, studentHash, userAddress) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield supplyChainService.assignToStudent(serial, schoolHash, studentHash, userAddress);
            return result;
        }
        catch (error) {
            console.error('Error in assignToStudent:', error);
            return { success: false, error: error.message };
        }
    }), []);
    // Balance operations
    const getAccountBalance = (0, react_1.useCallback)((userAddress) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            return yield supplyChainService.getAccountBalance(userAddress);
        }
        catch (error) {
            console.error('Error in getAccountBalance:', error);
            return '0';
        }
    }), []);
    // Connection check
    const checkConnection = (0, react_1.useCallback)(() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            return yield supplyChainService.checkConnection();
        }
        catch (error) {
            console.error('Error checking connection:', error);
            return false;
        }
    }), []);
    // Export all functions
    return {
        getRoleHashForName,
        hasRole,
        hasRoleByHash,
        getRoleCounts,
        getAccountBalance,
        getRoleMembers,
        getAllRolesSummary,
        getAllSerialNumbers,
        getNetbookState,
        getNetbookReport,
        grantRole,
        grantRoleByHash,
        revokeRole,
        auditHardware,
        registerNetbooks,
        validateSoftware,
        assignToStudent,
        checkConnection
    };
};
exports.useSupplyChainService = useSupplyChainService;
