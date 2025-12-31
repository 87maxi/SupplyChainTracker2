"use strict";
'use server';
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
exports.getAllSerialNumbers = getAllSerialNumbers;
exports.getNetbookReport = getNetbookReport;
exports.getNetbookState = getNetbookState;
exports.getNetbooksByState = getNetbooksByState;
exports.getRoleMembers = getRoleMembers;
exports.getRoleMemberCount = getRoleMemberCount;
exports.hasRole = hasRole;
exports.revalidateAll = revalidateAll;
const cache_1 = require("next/cache");
const SupplyChainContract = __importStar(require("@/lib/contracts/SupplyChainContract"));
// Use local storage or cache for server-side data
const cache = new Map();
const CACHE_KEY = 'supply-chain-data';
const ROLE_CACHE_KEY = 'role-members';
/**
 * Server-only RPC functions for interacting with the SupplyChain smart contract.
 * These functions run on the server side and use caching for performance.
 */
/**
 * Get all serial numbers from the contract
 * @returns Array of serial numbers
 */
function getAllSerialNumbers() {
    return __awaiter(this, void 0, void 0, function* () {
        // Use cache for performance
        if (cache.has(CACHE_KEY)) {
            console.log('Cache hit for getAllSerialNumbers');
            return cache.get(CACHE_KEY);
        }
        console.log('Cache miss for getAllSerialNumbers');
        try {
            // Fetch from contract
            const serialNumbers = yield SupplyChainContract.getAllSerialNumbers();
            cache.set(CACHE_KEY, serialNumbers);
            return serialNumbers;
        }
        catch (error) {
            console.error('Error getting serial numbers:', error);
            throw error;
        }
    });
}
/**
 * Get detailed netbook report by serial number
 * @param serial - The netbook serial number
 * @returns Netbook report with all details
 */
function getNetbookReport(serial) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield SupplyChainContract.getNetbookReport(serial);
        }
        catch (error) {
            console.error(`Error getting netbook report for ${serial}:`, error);
            throw error;
        }
    });
}
/**
 * Get the current state of a netbook
 * @param serial - The netbook serial number
 * @returns Current state (0=FABRICADA, 1=HW_APROBADO, 2=SW_VALIDADO, 3=DISTRIBUIDA)
 */
function getNetbookState(serial) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Getting state for serial: ${serial}`);
        try {
            return yield SupplyChainContract.getNetbookState(serial);
        }
        catch (error) {
            console.error(`Error getting state for ${serial}:`, error);
            throw error;
        }
    });
}
/**
 * Get all netbooks in a specific state
 * @param state - State number (0=FABRICADA, 1=HW_APROBADO, 2=SW_VALIDADO, 3=DISTRIBUIDA)
 * @returns Array of serial numbers in that state
 */
function getNetbooksByState(state) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield SupplyChainContract.getNetbooksByState(state);
        }
        catch (error) {
            console.error(`Error getting netbooks for state ${state}:`, error);
            throw error;
        }
    });
}
/**
 * Get all members of a specific role
 * @param roleHash - The keccak256 hash of the role name
 * @returns Array of addresses with that role
 */
function getRoleMembers(roleHash) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield SupplyChainContract.getAllMembers(roleHash);
        }
        catch (error) {
            console.error(`Error getting members for role ${roleHash}:`, error);
            throw error;
        }
    });
}
/**
 * Get the count of members in a specific role
 * @param roleHash - The keccak256 hash of the role name
 * @returns Number of members with that role
 */
function getRoleMemberCount(roleHash) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const count = yield SupplyChainContract.getRoleMemberCount(roleHash);
            return Number(count);
        }
        catch (error) {
            console.error(`Error getting member count for role ${roleHash}:`, error);
            throw error;
        }
    });
}
/**
 * Check if an address has a specific role
 * @param roleHash - The keccak256 hash of the role name
 * @param address - The address to check
 * @returns True if the address has the role, false otherwise
 */
function hasRole(roleHash, address) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Server RPC: hasRole', { roleHash, address });
        try {
            return yield SupplyChainContract.hasRole(roleHash, address);
        }
        catch (error) {
            console.error('Error checking role:', error);
            return false;
        }
    });
}
/**
 * Revalidate all cached data and Next.js cache tags
 * Call this after making changes to the contract state
 *
 * Uses 'max' profile for stale-while-revalidate (SWR) semantics:
 * - Users get stale content immediately
 * - Fresh data is fetched in the background
 * - New data is served on subsequent requests
 */
function revalidateAll() {
    return __awaiter(this, void 0, void 0, function* () {
        cache.clear();
        (0, cache_1.revalidateTag)('dashboard-data', 'max');
        (0, cache_1.revalidateTag)('netbook-state', 'max');
        (0, cache_1.revalidateTag)('serial-numbers', 'max');
        (0, cache_1.revalidateTag)('role-members', 'max');
        console.log('All cache tags revalidated');
    });
}
// serverRpc object export removed to comply with Next.js Server Actions rules
// Use named exports instead
