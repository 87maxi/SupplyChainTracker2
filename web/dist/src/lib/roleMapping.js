"use strict";
// web/src/lib/roleMapping.ts
// Central role mapping utility for consistent role name to hash conversion
// Maps role keys (FABRICANTE, AUDITOR_HW, etc.) to their full role names
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
exports.roleMapper = void 0;
const roleUtils_1 = require("./roleUtils");
// Verifica si un string es un hash de 32 bytes (66 caracteres)
function isHash(value) {
    return /^0x[0-9a-fA-F]{64}$/.test(value);
}
// Mapping from short keys to full role names as defined in the contract
class RoleMapper {
    constructor() {
        this.keyToName = {
            FABRICANTE: 'FABRICANTE_ROLE',
            AUDITOR_HW: 'AUDITOR_HW_ROLE',
            TECNICO_SW: 'TECNICO_SW_ROLE',
            ESCUELA: 'ESCUELA_ROLE',
            ADMIN: 'DEFAULT_ADMIN_ROLE'
        };
        this.nameToKey = {
            'FABRICANTE_ROLE': 'FABRICANTE',
            'AUDITOR_HW_ROLE': 'AUDITOR_HW',
            'TECNICO_SW_ROLE': 'TECNICO_SW',
            'ESCUELA_ROLE': 'ESCUELA',
            'DEFAULT_ADMIN_ROLE': 'ADMIN'
        };
    }
    // Convert short key to full role name
    toFullName(key) {
        return this.keyToName[key];
    }
    // Convert full role name to short key
    toKey(name) {
        const key = this.nameToKey[name];
        if (!key) {
            console.warn(`[roleMapping] No key found for role name: ${name}`);
            return 'ADMIN'; // fallback
        }
        return key;
    }
    // Convert any role name (with or without _ROLE suffix) to full role name
    normalizeRoleName(name) {
        const originalName = name;
        if (!name) {
            console.warn('[roleMapping] Empty role name provided, defaulting to ADMIN');
            return 'DEFAULT_ADMIN_ROLE';
        }
        // Prevent processing of role hashes
        if (isHash(name)) {
            console.warn(`[roleMapping] Attempted to normalize a role hash as a name: ${name}`);
            console.warn(`[roleMapping] This is invalid. Role hashes should not be passed to normalizeRoleName.`);
            console.warn(`[roleMapping] Using DEFAULT_ADMIN_ROLE as fallback`);
            return 'DEFAULT_ADMIN_ROLE';
        }
        const upperName = name.toUpperCase().trim();
        console.log(`[roleMapping] Normalizing role: "${originalName}" (upper: "${upperName}")`);
        // 1. Normalize known variants to standard form
        const normalizedMap = {
            'ADMIN': 'DEFAULT_ADMIN_ROLE',
            'DEFAULT_ADMIN': 'DEFAULT_ADMIN_ROLE',
            'DEFAULT_ADMIN_ROLE': 'DEFAULT_ADMIN_ROLE',
            'MANAGER': 'DEFAULT_ADMIN_ROLE',
            'OWNER': 'DEFAULT_ADMIN_ROLE'
        };
        if (upperName in normalizedMap) {
            console.log(`[roleMapping] Normalized ${name} -> ${normalizedMap[upperName]}`);
            return normalizedMap[upperName];
        }
        // 2. Direct match with full names in our mapping
        if (upperName in this.nameToKey) {
            console.log(`[roleMapping] Direct match with full name: ${originalName} -> ${upperName}`);
            return upperName;
        }
        // 3. Match short keys
        if (upperName in this.keyToName) {
            const result = this.keyToName[upperName];
            console.log(`[roleMapping] Matched short key ${upperName} -> ${result}`);
            return result;
        }
        // 4. Try removing _ROLE suffix
        if (upperName.endsWith('_ROLE')) {
            const key = upperName.slice(0, -5);
            if (key in this.keyToName) {
                const result = this.keyToName[key];
                console.log(`[roleMapping] Removed _ROLE suffix: ${upperName} -> ${result}`);
                return result;
            }
        }
        // 5. Try adding _ROLE suffix
        const withRole = `${upperName}_ROLE`;
        if (withRole in this.nameToKey) {
            console.log(`[roleMapping] Added _ROLE suffix: ${name} -> ${withRole}`);
            return withRole;
        }
        console.error(`[roleMapping] Failed to normalize role: "${name}" (upper: "${upperName}")`);
        console.warn(`[roleMapping] Using DEFAULT_ADMIN_ROLE as fallback for: ${name}`);
        return 'DEFAULT_ADMIN_ROLE';
    }
    // Get role hash for any role name format
    getRoleHash(name) {
        return __awaiter(this, void 0, void 0, function* () {
            // If name is already a hash, return it directly
            if (isHash(name)) {
                console.log(`[roleMapper] Name is already a hash, returning directly: ${name}`);
                return name;
            }
            const upperName = name.toUpperCase().trim();
            // Handle special case for admin roles
            if (['ADMIN', 'DEFAULT_ADMIN', 'MANAGER', 'OWNER', 'DEFAULT_ADMIN_ROLE'].includes(upperName)) {
                console.log('[roleMapper] Using bytes32(0) for admin role:', upperName);
                return '0x0000000000000000000000000000000000000000000000000000000000000000';
            }
            console.log(`[roleMapper] Attempting to get hash for role: "${name}"`);
            const fullRoleName = this.normalizeRoleName(name);
            // Fallback to roleHashes if contract call fails or is unnecessary
            const roleHashes = yield (0, roleUtils_1.getRoleHashes)();
            const key = this.nameToKey[fullRoleName];
            if (key) {
                const hash = roleHashes[key];
                if (hash && hash !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
                    console.log(`[roleMapper] Using hash from roleHashes cache: ${hash}`);
                    return hash;
                }
            }
            console.error(`[roleMapper] Failed to get hash for role: ${name} (full: ${fullRoleName})`);
            return '0x0000000000000000000000000000000000000000000000000000000000000000';
        });
    }
}
// Singleton instance
exports.roleMapper = new RoleMapper();
