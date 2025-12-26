// web/src/hooks/useSupplyChainService.ts
import { useCallback } from 'react';
import * as SupplyChainService from '@/services/SupplyChainService';
import { useWeb3 } from '@/contexts/Web3Context';
import { Address } from 'viem';
import { ContractRoles, AllRolesSummary } from '@/types/supply-chain-types';

export const useSupplyChainService = () => {
  const { address } = useWeb3();

  const hasRole = useCallback(async (role: string, userAddress: Address): Promise<boolean> => {
    try {
      return await SupplyChainService.hasRole(role, userAddress);
    } catch (error) {
      console.error('Error in hasRole:', error);
      return false;
    }
  }, []);

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

  // Implementation of role management functions
  const getAllRolesSummary = useCallback(async () => {
    try {
      const roleHashes = await import('@/lib/roleUtils').then(({ getRoleHashes }) => getRoleHashes());
      
      const roleEntries = Object.entries(roleHashes);
      
      // Fetch members for each role concurrently
      const roleResults = await Promise.all(
        roleEntries.map(async ([roleName, roleHash]) => {
          try {
            // Use the service function instead of direct contract calls
            const members = await SupplyChainService.getAllMembers(roleHash);
            
            return [
              roleName as ContractRoles,
              {
                name: roleName,
                count: members.length,
                members
              }
            ];
          } catch (error) {
            console.error(`Error fetching members for role ${roleName}:`, error);
            return [roleName as ContractRoles, { name: roleName, count: 0, members: [] }];
          }
        })
      );
      
      return Object.fromEntries(roleResults) as AllRolesSummary;
    } catch (error) {
      console.error('Error in getAllRolesSummary:', error);
      return {};
    }
  }, []);

  const grantRole = useCallback(async (role: string, userAddress: Address) => {
    try {
      const roleHashes = await import('@/lib/roleUtils').then(({ getRoleHashes }) => getRoleHashes());
      const roleKey = role as keyof typeof roleHashes;
      
      if (!roleHashes[roleKey]) {
        throw new Error(`Role ${role} not found`);
      }
      
      const hash = roleHashes[roleKey];
      
      // Use the service function instead of direct contract calls
      return await SupplyChainService.grantRole(hash, userAddress);
    } catch (error) {
      console.error('Error in grantRole:', error);
      throw error;
    }
  }, []);

    const revokeRole = useCallback(async (role: string, userAddress: Address) => {
    try {
      const roleHashes = await import('@/lib/roleUtils').then(({ getRoleHashes }) => getRoleHashes());
      const roleKey = role as keyof typeof roleHashes;
      
      if (!roleHashes[roleKey]) {
        throw new Error(`Role ${role} not found`);
      }
      
      const hash = roleHashes[roleKey];
      
      // Use the service function instead of direct contract calls
      return await SupplyChainService.revokeRole(hash, userAddress);
    } catch (error) {
      console.error('Error in revokeRole:', error);
      throw error;
    }
  }, [])

  const getNetbookBySerial = useCallback(async (serial: string) => {
    console.warn('getNetbookBySerial is not yet implemented');
    return {};
  }, []);

  const auditHardware = useCallback(async (serial: string, passed: boolean, reportHash: string) => {
    console.warn('auditHardware is not yet implemented');
    return {};
  }, []);

  const validateSoftware = useCallback(async (serial: string, osVersion: string, passed: boolean) => {
    console.warn('validateSoftware is not yet implemented');
    return {};
  }, []);

  const assignToStudent = useCallback(async (serial: string, schoolHash: string, studentHash: string) => {
    console.warn('assignToStudent is not yet implemented');
    return {};
  }, []);

  const getAllSerialNumbers = useCallback(async () => {
    console.warn('getAllSerialNumbers is not yet implemented');
    return [];
  }, []);

  const registerNetbooks = useCallback(async (serials: string[], batches: string[], specs: string[]) => {
    try {
      return await SupplyChainService.registerNetbooks(serials, batches, specs);
    } catch (error) {
      console.error('Error in registerNetbooks:', error);
      throw error;
    }
  }, []);

  return {
    hasRole,
    getRoleCounts,
    getAllRolesSummary,
    grantRole,
    revokeRole,
    getNetbookBySerial,
    auditHardware,
    validateSoftware,
    assignToStudent,
    getAllSerialNumbers,
    getAccountBalance,
    registerNetbooks
  };
};