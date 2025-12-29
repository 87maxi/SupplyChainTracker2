// web/src/hooks/useSupplyChainService.ts
import { useCallback } from 'react';
import * as SupplyChainService from '@/services/SupplyChainService';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import { ContractRoles } from '@/types/contract';
import { AllRolesSummary } from '@/types/supply-chain-types';
import { roleMapper } from '@/lib/roleMapping';

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

  // Role hash mapping utility - now uses centralized roleMapper
  // For backward compatibility, this function maintains the same interface
  // but delegates to the centralized roleMapper for consistency
  const getRoleHashForName = useCallback(async (role: string): Promise<`0x${string}`> => {
    // If it's already a hash, just return it
    if (role.startsWith('0x') && role.length === 66) {
      return role as `0x${string}`;
    }
    
    try {
      // Delegate to centralized role mapper
      return await roleMapper.getRoleHash(role);
    } catch (error: any) {
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
            // Convert member addresses to checksummed format
            const checksummedMembers = members.map(address => {
              try {
                return address.toLowerCase().replace('0x', '0x').trim();
              } catch (e) {
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

  const revokeRole = useCallback(async (roleHash: `0x${string}`, userAddress: Address) => {
    try {
      return await SupplyChainService.revokeRole(roleHash, userAddress);
    } catch (error) {
      console.error('Error in revokeRole:', error);
      throw error;
    }
  }, []);

  // Netbook operations
  const auditHardware = useCallback(async (serial: string, passed: boolean, reportHash: string) => {
    try {
      const transactionHash = await SupplyChainService.auditHardware(serial, passed, reportHash);
      return { success: true, hash: transactionHash };
    } catch (error) {
      console.error('Error in auditHardware:', error);
      return { success: false, error: (error as Error).message };
    }
  }, []);

  const registerNetbooks = useCallback(async (serials: string[], batches: string[], specs: string[]) => {
    try {
      const transactionHash = await SupplyChainService.registerNetbooks(serials, batches, specs);
      return { success: true, hash: transactionHash };
    } catch (error) {
      console.error('Error in registerNetbooks:', error);
      return { success: false, error: (error as Error).message };
    }
  }, []);

  // Netbook operations
  const validateSoftware = useCallback(async (serial: string, osVersion: string, passed: boolean) => {
    try {
      const transactionHash = await SupplyChainService.validateSoftware(serial, osVersion, passed);
      return { success: true, hash: transactionHash };
    } catch (error) {
      console.error('Error in validateSoftware:', error);
      return { success: false, error: (error as Error).message };
    }
  }, []);
  
  // Netbook operations
  const assignToStudent = useCallback(async (serial: string, schoolHash: string, studentHash: string) => {
    try {
      const transactionHash = await SupplyChainService.assignToStudent(serial, schoolHash, studentHash);
      return { success: true, hash: transactionHash };
    } catch (error) {
      console.error('Error in assignToStudent:', error);
      return { success: false, error: (error as Error).message };
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
    revokeRole,
    auditHardware,
    registerNetbooks,
    validateSoftware,
    assignToStudent
  };
};