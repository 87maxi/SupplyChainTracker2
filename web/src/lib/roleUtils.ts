import { readContract } from '@wagmi/core';
import { config } from '@/lib/wagmi/config';
import SupplyChainTrackerABI from '@/contracts/abi/SupplyChainTracker.json';
import { NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS } from '@/lib/env';

// Get a map of role names to their hashes from the contract
export type RoleMap = {
  FABRICANTE: string;
  AUDITOR_HW: string;
  TECNICO_SW: string;
  ESCUELA: string;
  ADMIN: string;
};

let cachedRoleHashes: RoleMap | null = null;

export const getRoleHashes = async (): Promise<RoleMap> => {
  if (cachedRoleHashes) return cachedRoleHashes;

  try {
    console.log('Fetching role hashes from contract...');

    // Get role hashes from the contract
    const [fabricanteRole, auditorHwRole, tecnicoSwRole, escuelaRole, defaultAdminRole] = await Promise.all([
      readContract(config, {
        address: NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS as `0x${string}`,
        abi: SupplyChainTrackerABI,
        functionName: 'FABRICANTE_ROLE'
      }),
      readContract(config, {
        address: NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS as `0x${string}`,
        abi: SupplyChainTrackerABI,
        functionName: 'AUDITOR_HW_ROLE'
      }),
      readContract(config, {
        address: NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS as `0x${string}`,
        abi: SupplyChainTrackerABI,
        functionName: 'TECNICO_SW_ROLE'
      }),
      readContract(config, {
        address: NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS as `0x${string}`,
        abi: SupplyChainTrackerABI,
        functionName: 'ESCUELA_ROLE'
      }),
      readContract(config, {
        address: NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS as `0x${string}`,
        abi: SupplyChainTrackerABI,
        functionName: 'DEFAULT_ADMIN_ROLE'
      })
    ]);

    cachedRoleHashes = {
      FABRICANTE: fabricanteRole as string,
      AUDITOR_HW: auditorHwRole as string,
      TECNICO_SW: tecnicoSwRole as string,
      ESCUELA: escuelaRole as string,
      ADMIN: defaultAdminRole as string
    };

    console.log('Role hashes retrieved:', cachedRoleHashes);
    return cachedRoleHashes;
  } catch (error) {
    console.error('Error getting role hashes:', error);

    // Fallback to precalculated role hashes (keccak256 of role names)
    const fallbackHashes = {
      FABRICANTE: '0xbe0c84bfff967b2deb88bd0540d4a796d0ebfdcb72262ced26f1892b419e6457',
      AUDITOR_HW: '0x49c0376dc7caa3eab0c186e9bc20bf968b0724fea74a37706c35f59bc5d8b15b',
      TECNICO_SW: '0xeeb4ddf6a0e2f06cb86713282a0b88ee789709e92a08b9e9b4ce816bbb13fcaf',
      ESCUELA: '0xa8f5858ea94a9ede7bc5dd04119dcc24b3b02a20be15d673993d8b6c2a901ef9',
      ADMIN: '0x0000000000000000000000000000000000000000000000000000000000000000'
    };

    console.warn('Using fallback role hashes due to error:', fallbackHashes);

    // Cache the fallback hashes to avoid repeated warnings
    cachedRoleHashes = fallbackHashes;
    return fallbackHashes;
  }
};