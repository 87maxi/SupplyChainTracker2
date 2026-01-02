import { readContract } from '@wagmi/core';
import { config } from './wagmi/config';
import { NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS } from './env';
import { getRoleByName } from './contracts/SupplyChainContract';

const contractAddress = NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS as `0x${string}`;

// Import the ABI directly to avoid JSON import issues
import SupplyChainTrackerABI from '@/lib/contracts/abi/SupplyChainTracker.json';

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

    // Skip string-based hasRole and use bytes32-based hasRole with DEFAULT_ADMIN_ROLE = 0x00..00
    try {
      console.log('[roleUtils] Checking DEFAULT_ADMIN_ROLE using AccessControl.hasRole with bytes32(0)');
      const defaultAdminRole = '0x0000000000000000000000000000000000000000000000000000000000000000';
      const deployerAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
      
      const hasAdminRole = await readContract(config, {
        address: contractAddress,
        abi: SupplyChainTrackerABI,
        functionName: 'hasRole',
        args: [defaultAdminRole as `0x${string}`, deployerAddress]
      });
      
      if (hasAdminRole) {
        console.log('[roleUtils] First Anvil account has DEFAULT_ADMIN_ROLE');
      } else {
        console.log('[roleUtils] First Anvil account does NOT have DEFAULT_ADMIN_ROLE');
      }
    } catch (error) {
      console.error('[roleUtils] Error checking DEFAULT_ADMIN_ROLE:', error);
    }

    // Continue with other roles...
    
    const result: RoleMap = {
      FABRICANTE: fallbackHashes.FABRICANTE,
      AUDITOR_HW: fallbackHashes.AUDITOR_HW,
      TECNICO_SW: fallbackHashes.TECNICO_SW,
      ESCUELA: fallbackHashes.ESCUELA,
      ADMIN: fallbackHashes.ADMIN,
    };
    
    // Get role hashes from contract using getRoleByName
    const roleMapping: Record<string, { contractName: string; key: 'FABRICANTE' | 'AUDITOR_HW' | 'TECNICO_SW' | 'ESCUELA' | 'ADMIN' }> = {
      FABRICANTE: { contractName: 'FABRICANTE', key: 'FABRICANTE' },
      AUDITOR_HW: { contractName: 'AUDITOR_HW', key: 'AUDITOR_HW' },
      TECNICO_SW: { contractName: 'TECNICO_SW', key: 'TECNICO_SW' },
      ESCUELA: { contractName: 'ESCUELA', key: 'ESCUELA' },
      ADMIN: { contractName: 'ADMIN', key: 'ADMIN' }
    };
    
    for (const [roleName, mapping] of Object.entries(roleMapping)) {
      const contractName = mapping.contractName;
      const roleKey = mapping.key;
      try {
        console.log(`[roleUtils] Attempting to get role hash for ${roleName} with contract name: ${contractName}`);
        const roleHash = await getRoleByName(contractName);
        if (roleHash) {
          result[roleKey] = roleHash as `0x${string}`;
          console.log(`[roleUtils] Successfully got role hash for ${roleName}: ${roleHash}`);
        }
      } catch (error) {
        console.error(`[roleUtils] Error getting role hash for ${roleName}:`, error);
        throw new Error(`Failed to get role hash for ${roleName} from contract: ${error}`);
      }
    }
    
    console.log('Role hashes retrieved:', result);
    cachedRoleHashes = result;
    return result;
  } catch (error) {
    console.error('Unexpected error getting role hashes:', error);
    // Reset cached hash to force retry on next attempt
    cachedRoleHashes = null;
    throw new Error(`Failed to get role hashes from contract: ${error}`);
  }
};