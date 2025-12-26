import { readContract } from '@wagmi/core';
import { config } from '@/lib/wagmi/config';
import SupplyChainTrackerABI from '@/contracts/abi/SupplyChainTracker.json';
import { NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS } from '@/lib/env';

// Get a map of role names to their hashes from the contract
type RoleMap = {
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

    return cachedRoleHashes;
  } catch (error) {
    console.error('Error getting role hashes:', error);
    return {
      FABRICANTE: '',
      AUDITOR_HW: '',
      TECNICO_SW: '',
      ESCUELA: '',
      ADMIN: ''
    };
  }
};