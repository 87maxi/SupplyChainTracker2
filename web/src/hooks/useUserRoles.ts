import { useState, useEffect } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import * as SupplyChainService from '@/services/SupplyChainService';
import { readContract } from '@wagmi/core';
import { config } from '@/lib/wagmi/config';
import SupplyChainTrackerABI from '@/contracts/abi/SupplyChainTracker.json';
import { ContractRoles } from '@/types/supply-chain-types';
import { NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS } from '@/lib/env';

interface UseUserRoles {
  isAdmin: boolean;
  isManufacturer: boolean;
  isHardwareAuditor: boolean;
  isSoftwareTechnician: boolean;
  isSchool: boolean;
  isLoading: boolean;
  hasRole: (roleName: ContractRoles) => boolean;
  activeRoleNames: ContractRoles[];
}

export const useUserRoles = (): UseUserRoles => {
  const { address, isConnected } = useWeb3();
  const [userRoles, setUserRoles] = useState<UseUserRoles>({
    isAdmin: false,
    isManufacturer: false,
    isHardwareAuditor: false,
    isSoftwareTechnician: false,
    isSchool: false,
    isLoading: true,
    hasRole: () => false,
    activeRoleNames: []
  });

  useEffect(() => {
    const fetchRoles = async () => {
      if (!isConnected || !address) {
        setUserRoles(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        setUserRoles(prev => ({ ...prev, isLoading: true }));

        // Get role hashes from the contract
        const [fabricanteRole, auditorHwRole, tecnicoSwRole, escuelaRole] = await Promise.all([
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
          })
        ]);
        
        // Convert BytesLike to string
        const fabricanteRoleStr = fabricanteRole as string;
        const auditorHwRoleStr = auditorHwRole as string;
        const tecnicoSwRoleStr = tecnicoSwRole as string;
        const escuelaRoleStr = escuelaRole as string;
        
        // Check roles
        const isAdmin = await SupplyChainService.hasRole('0x0000000000000000000000000000000000000000000000000000000000000000', address);
        const isManufacturer = await SupplyChainService.hasRole(fabricanteRoleStr, address);
        const isHardwareAuditor = await SupplyChainService.hasRole(auditorHwRoleStr, address);
        const isSoftwareTechnician = await SupplyChainService.hasRole(tecnicoSwRoleStr, address);
        const isSchool = await SupplyChainService.hasRole(escuelaRoleStr, address);

        // Build active role names array
        const activeRoleNames: ContractRoles[] = [];
        if (isAdmin) activeRoleNames.push('DEFAULT_ADMIN_ROLE');
        if (isManufacturer) activeRoleNames.push('FABRICANTE_ROLE');
        if (isHardwareAuditor) activeRoleNames.push('AUDITOR_HW_ROLE');
        if (isSoftwareTechnician) activeRoleNames.push('TECNICO_SW_ROLE');
        if (isSchool) activeRoleNames.push('ESCUELA_ROLE');

        setUserRoles({
          isAdmin,
          isManufacturer,
          isHardwareAuditor,
          isSoftwareTechnician,
          isSchool,
          isLoading: false,
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
          activeRoleNames
        });
      } catch (error: any) {
        console.error('Error fetching user roles:', error);
        setUserRoles(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchRoles();
  }, [address, isConnected]);

  return userRoles;
};