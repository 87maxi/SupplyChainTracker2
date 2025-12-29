'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { hasRole } from '@/services/SupplyChainService';
import { readContract } from '@wagmi/core';
import { config } from '@/lib/wagmi/config';
import SupplyChainTrackerABI from '@/contracts/abi/SupplyChainTracker.json';
import { ContractRoles } from '@/types/contract';
import { NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS } from '@/lib/env';
import { getRoleHashes } from '@/lib/roleUtils';

interface UseUserRoles {
  isAdmin: boolean;
  isManufacturer: boolean;
  isHardwareAuditor: boolean;
  isSoftwareTechnician: boolean;
  isSchool: boolean;
  isLoading: boolean;
  hasRole: (roleName: ContractRoles) => boolean;
  activeRoleNames: ContractRoles[];
  refreshRoles: () => void;
}

import { getCache, setCache, isCacheStale, isRevalidating, startRevalidation, completeRevalidation } from '@/lib/utils/cache';

export const useUserRoles = (): UseUserRoles => {
  const { address, isConnected } = useWeb3();
  const cacheKey = `user_roles_${address || 'unknown'}`;
  const [userRoles, setUserRoles] = useState<UseUserRoles>({    isAdmin: false,
    isManufacturer: false,
    isHardwareAuditor: false,
    isSoftwareTechnician: false,
    isSchool: false,
    isLoading: true,
    hasRole: () => false,
    activeRoleNames: [],
    refreshRoles: () => {}
  });

  const checkRoles = useCallback(async () => {
    // Early return if not connected or missing required data
    if (!isConnected || !address || !NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS) {
      if (isConnected && address && !NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS) {
        console.error('Contract address is not configured. Please check your .env file.');
      }
      setUserRoles(prev => ({ ...prev, isLoading: false }));
      return;
    }

    // Check cache first
    const cachedRoles = getCache<UseUserRoles>(cacheKey);
    if (cachedRoles && !isCacheStale(cacheKey)) {
      setUserRoles(cachedRoles);
      return;
    }

    // If we have stale data, serve it while revalidating
    if (cachedRoles && !isRevalidating(cacheKey)) {
      setUserRoles(cachedRoles);
      startRevalidation(cacheKey);
    } else if (!cachedRoles) {
      setUserRoles(prev => ({ ...prev, isLoading: true }));
    }

    console.log('[useUserRoles] Starting role check for address:', address);

    try {
      const contractAddress = NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS as `0x${string}`;

      // Get role hashes from the contract (using cached utility)
      const hashes = await getRoleHashes();

      const fabricanteRoleStr = hashes.FABRICANTE;
      const auditorHwRoleStr = hashes.AUDITOR_HW;
      const tecnicoSwRoleStr = hashes.TECNICO_SW;
      const escuelaRoleStr = hashes.ESCUELA;
      const defaultAdminRoleStr = hashes.ADMIN;

      // Check roles
      const [isAdmin, isManufacturer, isHardwareAuditor, isSoftwareTechnician, isSchool] = await Promise.all([
        hasRole('DEFAULT_ADMIN_ROLE', address as `0x${string}`),
        hasRole('FABRICANTE_ROLE', address as `0x${string}`),
        hasRole('AUDITOR_HW_ROLE', address as `0x${string}`),
        hasRole('TECNICO_SW_ROLE', address as `0x${string}`),
        hasRole('ESCUELA_ROLE', address as `0x${string}`)
      ]);

      console.log('Role check results:', {
        isAdmin,
        isManufacturer,
        isHardwareAuditor,
        isSoftwareTechnician,
        isSchool,
        address
      });

      // Build active role names array
      const activeRoleNames: ContractRoles[] = [];
      if (isAdmin) activeRoleNames.push('DEFAULT_ADMIN_ROLE');
      if (isManufacturer) activeRoleNames.push('FABRICANTE_ROLE');
      if (isHardwareAuditor) activeRoleNames.push('AUDITOR_HW_ROLE');
      if (isSoftwareTechnician) activeRoleNames.push('TECNICO_SW_ROLE');
      if (isSchool) activeRoleNames.push('ESCUELA_ROLE');

      const newRoles: UseUserRoles = {
        isAdmin,
        isManufacturer,
        isHardwareAuditor,
        isSoftwareTechnician,
        isSchool,
        isLoading: false,
        activeRoleNames,
        hasRole: (roleName: ContractRoles) => {
          switch (roleName) {
            case 'DEFAULT_ADMIN_ROLE': return isAdmin;
            case 'FABRICANTE_ROLE': return isManufacturer;
            case 'AUDITOR_HW_ROLE': return isHardwareAuditor;
            case 'TECNICO_SW_ROLE': return isSoftwareTechnician;
            case 'ESCUELA_ROLE': return isSchool;
            default: return false;
          }
        },
        refreshRoles: checkRoles
      };

      // Cache the result with 30 second TTL and stale-while-revalidate
      setCache(cacheKey, newRoles, 30000, true);
      
      // Always update state
      setUserRoles(newRoles);
      
      // Mark revalidation as complete
      completeRevalidation(cacheKey);
      
    } catch (error: any) {
      console.error('Error fetching user roles:', error);

      // Check for specific WalletConnect/Reown allowlist error
      if (error.message?.includes('Allowlist') || error.details?.includes('Allowlist')) {
        console.error('CRITICAL: Origin http://localhost:3000 not found on Allowlist. Please update your configuration on cloud.reown.com');
      }

      // Mark revalidation as complete on error
      completeRevalidation(cacheKey);
      
      // If we have stale data and we're revalidating, keep showing it
      if (userRoles.isLoading && getCache(cacheKey)) {
        setUserRoles(prev => ({ ...prev, isLoading: false }));
      } else {
        setUserRoles(prev => ({ ...prev, isLoading: false }));
      }
    }
  }, [address, isConnected, cacheKey]);

  useEffect(() => {
    checkRoles();
  }, [checkRoles]);

  // Listen for role updates to refresh roles
  useEffect(() => {
    const { eventBus, EVENTS } = require('@/lib/events');
    const unsubscribe = eventBus.on(EVENTS.ROLE_UPDATED, () => {
      console.log('[useUserRoles] Role update detected, refreshing roles...');
      checkRoles();
    });
    return () => unsubscribe();
  }, [checkRoles]);

  // Force role refresh when address changes
  useEffect(() => {
    if (isConnected && address) {
      console.log('Address changed, refreshing roles for:', address);
      checkRoles();
    }
  }, [address, isConnected, checkRoles]);

  // Return the roles and add a method to force refresh
  // Effect to update refreshRoles
  useEffect(() => {
    setUserRoles(prev => {
      // Only update refreshRoles if it's different
      if (prev.refreshRoles !== checkRoles) {
        return { ...prev, refreshRoles: checkRoles };
      }
      return prev;
    });
  }, [checkRoles]);

  return {
    ...userRoles,
    refreshRoles: checkRoles
  };
};