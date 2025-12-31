"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoleHashes = void 0;
const core_1 = require("@wagmi/core");
const config_1 = require("./wagmi/config");
const env_1 = require("./env");
const SupplyChainContract_1 = require("./contracts/SupplyChainContract");
const contractAddress = env_1.NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS;
// Import the ABI directly to avoid JSON import issues
const SupplyChainTracker_json_1 = __importDefault(require("./contracts/abi/SupplyChainTracker.json"));
let cachedRoleHashes = null;
const getRoleHashes = () => __awaiter(void 0, void 0, void 0, function* () {
    if (cachedRoleHashes)
        return cachedRoleHashes;
    const fallbackHashes = {
        FABRICANTE: '0xbe0c84bfff967b2deb88bd0540d4a796d0ebfdcb72262ced26f1892b419e6457',
        AUDITOR_HW: '0x49c0376dc7caa3eab0c186e9bc20bf968b0724fea74a37706c35f59bc5d8b15b',
        TECNICO_SW: '0xeeb4ddf6a0e2f06cb86713282a0b88ee789709e92a08b9e9b4ce816bbb13fcaf',
        ESCUELA: '0xa8f5858ea94a9ede7bc5dd04119dcc24b3b02a20be15d673993d8b6c2a901ef9',
        ADMIN: '0x0000000000000000000000000000000000000000000000000000000000000000' // bytes32(0) for DEFAULT_ADMIN_ROLE
    };
    try {
        console.log('[roleUtils] Fetching role hashes from contract...');
        console.log('[roleUtils] Wagmi Config State:', {
            chainId: config_1.config.state.chainId,
            connections: Array.from(config_1.config.state.connections.keys()),
            currentConnection: config_1.config.state.current
        });
        const trackerAddress = String(env_1.NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS || '');
        console.log(`[roleUtils] Using contract address: "${trackerAddress}"`);
        if (!trackerAddress || !trackerAddress.startsWith('0x')) {
            console.warn('[roleUtils] Invalid contract address, using fallback hashes');
            return fallbackHashes;
        }
        // Skip string-based hasRole and use bytes32-based hasRole with DEFAULT_ADMIN_ROLE = 0x00..00
        try {
            console.log('[roleUtils] Checking DEFAULT_ADMIN_ROLE using AccessControl.hasRole with bytes32(0)');
            const defaultAdminRole = '0x0000000000000000000000000000000000000000000000000000000000000000';
            const deployerAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
            const hasAdminRole = yield (0, core_1.readContract)(config_1.config, {
                address: contractAddress,
                abi: SupplyChainTracker_json_1.default,
                functionName: 'hasRole',
                args: [defaultAdminRole, deployerAddress]
            });
            if (hasAdminRole) {
                console.log('[roleUtils] First Anvil account has DEFAULT_ADMIN_ROLE');
            }
            else {
                console.log('[roleUtils] First Anvil account does NOT have DEFAULT_ADMIN_ROLE');
            }
        }
        catch (error) {
            console.error('[roleUtils] Error checking DEFAULT_ADMIN_ROLE:', error);
        }
        // Continue with other roles...
        const result = {
            FABRICANTE: fallbackHashes.FABRICANTE,
            AUDITOR_HW: fallbackHashes.AUDITOR_HW,
            TECNICO_SW: fallbackHashes.TECNICO_SW,
            ESCUELA: fallbackHashes.ESCUELA,
            ADMIN: fallbackHashes.ADMIN,
        };
        // Try to get role hashes from contract using getRoleByName
        // First, try to get the DEFAULT_ADMIN_ROLE directly using the contract's built-in function
        try {
            console.log('[roleUtils] Checking DEFAULT_ADMIN_ROLE using AccessControl.hasRole');
            // In AccessControl, DEFAULT_ADMIN_ROLE is bytes32(0)
            const defaultAdminRole = '0x0000000000000000000000000000000000000000000000000000000000000000';
            const deployerAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
            // Check if the deployer has DEFAULT_ADMIN_ROLE
            const hasAdminRole = yield (0, core_1.readContract)(config_1.config, {
                address: contractAddress,
                abi: SupplyChainTracker_json_1.default,
                functionName: 'hasRole',
                args: [defaultAdminRole, deployerAddress]
            });
            if (hasAdminRole) {
                console.log('[roleUtils] First Anvil account has DEFAULT_ADMIN_ROLE');
                result.ADMIN = defaultAdminRole;
            }
            else {
                console.log('[roleUtils] First Anvil account does NOT have DEFAULT_ADMIN_ROLE');
            }
        }
        catch (error) {
            console.error('[roleUtils] Error checking DEFAULT_ADMIN_ROLE:', error);
        }
        // Continue with other roles
        const roleMapping = {
            FABRICANTE: { contractName: 'FABRICANTE', key: 'FABRICANTE' },
            AUDITOR_HW: { contractName: 'AUDITOR_HW', key: 'AUDITOR_HW' },
            TECNICO_SW: { contractName: 'TECNICO_SW', key: 'TECNICO_SW' },
            ESCUELA: { contractName: 'ESCUELA', key: 'ESCUELA' },
            ADMIN: { contractName: 'ADMIN', key: 'ADMIN' },
            DEFAULT_ADMIN_ROLE: { contractName: 'ADMIN', key: 'ADMIN' },
            DEFAULT_ADMIN: { contractName: 'ADMIN', key: 'ADMIN' },
            MANAGER: { contractName: 'ADMIN', key: 'ADMIN' },
            OWNER: { contractName: 'ADMIN', key: 'ADMIN' }
        };
        for (const [roleName, mapping] of Object.entries(roleMapping)) {
            // Skip admin-related roles as we've already handled DEFAULT_ADMIN_ROLE
            if (['ADMIN', 'DEFAULT_ADMIN_ROLE', 'DEFAULT_ADMIN', 'MANAGER', 'OWNER'].includes(roleName))
                continue;
            const contractName = mapping.contractName;
            const roleKey = mapping.key;
            try {
                console.log(`[roleUtils] Attempting to get role hash for ${roleName} with contract name: ${contractName}`);
                const roleHash = yield (0, SupplyChainContract_1.getRoleByName)(contractName);
                if (roleHash && roleHash !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
                    result[roleKey] = roleHash;
                    console.log(`[roleUtils] Successfully got role hash for ${roleName}: ${roleHash}`);
                }
            }
            catch (error) {
                console.error(`[roleUtils] Error getting role hash for ${roleName}:`, error);
            }
        }
        console.log('Role hashes retrieved:', result);
        return result;
    }
    catch (error) {
        console.error('Unexpected error getting role hashes:', error);
        // Reset cached hash to force retry on next attempt
        cachedRoleHashes = null;
        return fallbackHashes;
    }
});
exports.getRoleHashes = getRoleHashes;
