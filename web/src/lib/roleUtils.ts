import { readContract } from '@wagmi/core';
import { config } from './wagmi/config';
import { NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS } from './env';
import { getRoleByName } from './contracts/SupplyChainContract';

const contractAddress = NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS as `0x${string}`;

// Import the ABI directly to avoid JSON import issues
import SupplyChainTrackerABI from './contracts/abi/SupplyChainTracker.json';

// Get a map of role names to their hashes from the contract
// Updated RoleMap to include full role names as keys
export type RoleMap = {
  FABRICANTE: `0x${string}`;
  AUDITOR_HW: `0x${string}`;
  TECNICO_SW: `0x${string}`;
  ESCUELA: `0x${string}`;
  ADMIN: `0x${string}`;
};

let cachedRoleHashes: RoleMap | null = null;

export const getRoleHashes = async (): Promise<RoleMap> => {
  if (cachedRoleHashes) return cachedRoleHashes;

      const fallbackHashes: RoleMap = {
  FABRICANTE: '0xbe0c84bfff967b2deb88bd0540d4a796d0ebfdcb72262ced26f1892b419e6457' as `0x${string}`,
  AUDITOR_HW: '0x49c0376dc7caa3eab0c186e9bc20bf968b0724fea74a37706c35f59bc5d8b15b' as `0x${string}`,
  TECNICO_SW: '0xeeb4ddf6a0e2f06cb86713282a0b88ee789709e92a08b9e9b4ce816bbb13fcaf' as `0x${string}`,
  ESCUELA: '0xa8f5858ea94a9ede7bc5dd04119dcc24b3b02a20be15d673993d8b6c2a901ef9' as `0x${string}`,
  ADMIN: '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}` // bytes32(0) for DEFAULT_ADMIN_ROLE
};

      try {
    console.log('[roleUtils] Fetching role hashes from contract...');
    console.log('[roleUtils] Wagmi Config State:', {
      chainId: config.state.chainId,
      connections: Array.from(config.state.connections.keys()),
      currentConnection: config.state.current
    });

    const trackerAddress = String(NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS || '');
    console.log(`[roleUtils] Using contract address: "${trackerAddress}"`);

    if (!trackerAddress || !trackerAddress.startsWith('0x')) {
      console.warn('[roleUtils] Invalid contract address, using fallback hashes');
      return fallbackHashes;
    }

    // Utilizar función existente getRoleByName

    type RoleKey = 'FABRICANTE' | 'AUDITOR_HW' | 'TECNICO_SW' | 'ESCUELA' | 'ADMIN';
    
    // Direct mapping of contract-compatible role names to our internal keys
    const roleMapping: Record<string, { contractName: string; key: RoleKey }> = {
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
    
    const result: RoleMap = {
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
      const hasAdminRole = await readContract(config, {
        address: contractAddress,
        abi: SupplyChainTrackerABI,
        functionName: 'hasRole',
        args: [defaultAdminRole, deployerAddress]
      });
      
      if (hasAdminRole) {
        console.log('[roleUtils] First Anvil account has DEFAULT_ADMIN_ROLE');
        result.ADMIN = defaultAdminRole;
      } else {
        console.log('[roleUtils] First Anvil account does NOT have DEFAULT_ADMIN_ROLE');
      }
    } catch (error) {
      console.error('[roleUtils] Error checking DEFAULT_ADMIN_ROLE:', error);
    }

    // Continue with other roles
    for (const [roleName, mapping] of Object.entries(roleMapping)) {
      // Skip admin-related roles as we've already handled DEFAULT_ADMIN_ROLE
      if (['ADMIN', 'DEFAULT_ADMIN_ROLE', 'DEFAULT_ADMIN', 'MANAGER', 'OWNER'].includes(roleName)) continue;
      
      const contractName = mapping.contractName;
      const roleKey = mapping.key;
      try {
        console.log(`[roleUtils] Attempting to get role hash for ${roleName} with contract name: ${contractName}`);
        const roleHash = await getRoleByName(contractName);
        if (roleHash && roleHash !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
          result[roleKey] = roleHash as `0x${string}`;
          console.log(`[roleUtils] Successfully got role hash for ${roleName}: ${roleHash}`);
        }
      } catch (error) {
        console.error(`[roleUtils] Error getting role hash for ${roleName}:`, error);
      }
    }
    
    console.log('Role hashes retrieved:', result);
    return result;
     } catch (error) {
    console.error('Unexpected error getting role hashes:', error);
    // Reset cached hash to force retry on next attempt
    cachedRoleHashes = null;
    return fallbackHashes;
  }
};