// web/src/hooks/useSupplyChainService.ts
import { useCallback } from 'react';
import * as SupplyChainService from '@/services/SupplyChainService';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import { ContractRoles, AllRolesSummary } from '@/types/contract';

export const useSupplyChainService = () => {
  const { address } = useAccount();

  // Get all serial numbers
  const getAllSerialNumbers = useCallback(async () => {
    try {
      return await SupplyChainService.getAllSerialNumbers();
    } catch (error) {
      console.error('Error in getAllSerialNumbers:', error);
      return [];
    }
  }, []);

  // Role hash mapping utility
  const getRoleHashForName = useCallback(async (role: string): Promise<string> => {
    // If it's already a hash, just return it
    if (role.startsWith('0x') && role.length === 66) {
      return role;
    }

    try {
      // Import RoleMap type for type safety
      type RoleMap = import('@/lib/roleUtils').RoleMap;
      const roleHashes: RoleMap = await import('@/lib/roleUtils').then(({ getRoleHashes }) => getRoleHashes());

      // Normalize input: remove _ROLE suffix and uppercase
      const normalizedInput = role.toUpperCase().replace('_ROLE', '');

      // Find matching key in roleHashes (which are like FABRICANTE, ADMIN, etc.)
      const matchedKey = Object.keys(roleHashes).find(key => {
        const normalizedKey = key.toUpperCase().replace('_ROLE', '');
        return normalizedKey === normalizedInput;
      }) as keyof RoleMap | undefined;

      // Special case for English aliases if needed, or handle them via a small map if strictly required.
      // For now, dynamic matching covers FABRICANTE -> FABRICANTE, FABRICANTE_ROLE -> FABRICANTE.

      if (!matchedKey) {
        // Fallback for English aliases if they are being used in the UI
        const aliases: Record<string, string> = {
          'MANUFACTURER': 'FABRICANTE',
          'HARDWARE_AUDITOR': 'AUDITOR_HW',
          'SOFTWARE_TECHNICIAN': 'TECNICO_SW',
          'SCHOOL': 'ESCUELA',
          'DEFAULT_ADMIN': 'ADMIN',
          'SUPER_ADMIN': 'ADMIN'
        };
        const aliasKey = aliases[normalizedInput];
        if (aliasKey && (aliasKey in roleHashes)) {
          const roleHash = roleHashes[aliasKey as keyof RoleMap];
          return roleHash;
        }

        console.error('❌ Role mapping failed for:', role);
        throw new Error(`Role "${role}" not found in role hashes.`);
      }

      const roleHash = roleHashes[matchedKey];
      if (!roleHash) {
        throw new Error(`Role hash is empty for key: ${matchedKey}`);
      }

      return roleHash;
    } catch (error) {
      console.error('💥 Error getting role hash:', error);
      throw error;
    }
  }, []);

  // Read operations
  const hasRole = useCallback(async (role: string, userAddress: Address): Promise<boolean> => {
    try {
      const roleHash = await getRoleHashForName(role);
      return await SupplyChainService.hasRole(roleHash, userAddress);
    } catch (error) {
      console.error('Error in hasRole:', error);
      return false;
    }
  }, [getRoleHashForName]);

  const getRoleCounts = useCallback(async () => {
    try {
      return await SupplyChainService.getRoleCounts();
    } catch (error) {
      console.error('Error in getRoleCounts:', error);
      return {};
    }
  }, []);

  const getAccountBalance = useCallback(async (userAddress: string) => {
    try {
      return await SupplyChainService.getAccountBalance(userAddress);
    } catch (error) {
      console.error('Error in getAccountBalance:', error);
      return '0';
    }
  }, []);

  const getRoleMembers = useCallback(async (role: string) => {
    try {
      const roleHash = await getRoleHashForName(role);
      const members = await SupplyChainService.getAllMembers(roleHash);
      return { role, members, count: members.length };
    } catch (error) {
      console.error('Error in getRoleMembers:', error);
      return { role, members: [], count: 0 };
    }
  }, [getRoleHashForName]);

  const getAllRolesSummary = useCallback(async (forceRefresh = false): Promise<AllRolesSummary | null> => {
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
              return data as AllRolesSummary;
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }

      // 2. Fetch fresh data
      const roleHashes = await import('@/lib/roleUtils').then(({ getRoleHashes }) => getRoleHashes());

      // Map roleUtils keys (FABRICANTE) to ContractRoles (FABRICANTE_ROLE)
      const roleMapping: Record<keyof typeof roleHashes, ContractRoles> = {
        FABRICANTE: 'FABRICANTE_ROLE',
        AUDITOR_HW: 'AUDITOR_HW_ROLE',
        TECNICO_SW: 'TECNICO_SW_ROLE',
        ESCUELA: 'ESCUELA_ROLE',
        ADMIN: 'DEFAULT_ADMIN_ROLE'
      };

      const roleEntries = Object.entries(roleHashes) as [keyof typeof roleHashes, string][];

      // Fetch all role members concurrently
      const roleResults = await Promise.all(
        roleEntries.map(async ([key, hash]) => {
          try {
            const members = await SupplyChainService.getAllMembers(hash, forceRefresh);
            const contractRoleName = roleMapping[key];

            return [
              contractRoleName,
              {
                count: members.length,
                members
              }
            ] as const;
          } catch (error) {
            console.error(`Error fetching members for role ${key}:`, error);
            const contractRoleName = roleMapping[key];
            return [
              contractRoleName,
              {
                count: 0,
                members: []
              }
            ] as const;
          }
        })
      );

      // Convert to object format
      const summary = Object.fromEntries(roleResults) as AllRolesSummary;

      // Cache the result
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            data: summary,
            timestamp: Date.now()
          })
        );
      }

      return summary;
    } catch (error) {
      console.error('Error in getAllRolesSummary:', error);
      return null;
    }
  }, [getRoleHashForName]);

  // Netbook operations
  const getNetbookState = useCallback(async (serial: string) => {
    try {
      return await SupplyChainService.getNetbookState(serial);
    } catch (error) {
      console.error('Error in getNetbookState:', error);
      return 'FABRICADA';
    }
  }, []);

  const getNetbookReport = useCallback(async (serial: string) => {
    try {
      return await SupplyChainService.getNetbookReport(serial);
    } catch (error) {
      console.error('Error in getNetbookReport:', error);
      return null;
    }
  }, []);

  // Write operations - these require wallet connection and return promise with transaction hash
  const grantRole = useCallback(async (roleName: string, userAddress: Address) => {
    try {
      return await SupplyChainService.grantRole(roleName, userAddress);
    } catch (error) {
      console.error('Error in grantRole:', error);
      throw error;
    }
  }, []);

  const revokeRole = useCallback(async (roleHash: string, userAddress: Address) => {
    try {
      return await SupplyChainService.revokeRole(roleHash, userAddress);
    } catch (error) {
      console.error('Error in revokeRole:', error);
      throw error;
    }
  }, []);

  // Export all functions
  return {
    getRoleHashForName,
    hasRole,
    getRoleCounts,
    getAccountBalance,
    getRoleMembers,
    getAllRolesSummary,
    getAllSerialNumbers,
    getNetbookState,
    getNetbookReport,
    grantRole,
    revokeRole
  };
}