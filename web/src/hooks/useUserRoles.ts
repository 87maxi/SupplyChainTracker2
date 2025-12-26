import { useState, useEffect } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import * as SupplyChainService from '@/services/SupplyChainService';
import { readContract } from '@wagmi/core';
import { config } from '@/lib/wagmi/config';
import SupplyChainTrackerABI from '@/contracts/abi/SupplyChainTracker.json';
import { NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS } from '@/lib/env';

interface UserRoles {
  isAdmin: boolean;
  isManufacturer: boolean;
  isHardwareAuditor: boolean;
  isSoftwareTechnician: boolean;
  isSchool: boolean;
  isLoading: boolean;
  hasRole: (roleName: string) => boolean;
  roles: string[]; // Array of role hashes
  activeRoleNames: string[]; // Array of human-readable role names
  getActiveRoles: () => Promise<string[]>; // Async function to get role hashes
}

export const useUserRoles = () => {
  const { address, isConnected } = useWeb3();
  const [roles, setRoles] = useState<UserRoles>({ activeRoleNames: [],
    isAdmin: false,
    isManufacturer: false,
    isHardwareAuditor: false,
    isSoftwareTechnician: false,
    isSchool: false,
    isLoading: true,
    hasRole: () => false,
    roles: []
  });

  useEffect(() => {
    const fetchRoles = async () => {
      if (!isConnected || !address) {
        setRoles(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        setRoles(prev => ({ ...prev, isLoading: true }));

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
        
        const isAdmin = await SupplyChainService.hasRole('0x0000000000000000000000000000000000000000000000000000000000000000', address);
        const isManufacturer = await SupplyChainService.hasRole(fabricanteRole as string, address);
        const isHardwareAuditor = await SupplyChainService.hasRole(auditorHwRole as string, address);
        const isSoftwareTechnician = await SupplyChainService.hasRole(tecnicoSwRole as string, address);
        const isSchool = await SupplyChainService.hasRole(escuelaRole as string, address);

        setRoles({
          isAdmin,
          isManufacturer,
          isHardwareAuditor,
          isSoftwareTechnician,
          isSchool,
          isLoading: false,
          hasRole: () => false,
          roles: [], // This will be overridden by the returned object
          activeRoleNames: [] // This will be overridden by the returned object
        });
      } catch (error) {
        console.error('Error fetching user roles:', error);
        setRoles(prev => ({ ...prev, isLoading: false, hasRole: () => false, roles: [] }));
      }
    };

    fetchRoles();
  }, [address, isConnected]);

  // Función para verificar roles por nombre
  const checkRole = (roleName: string) => {
    switch (roleName) {
      case 'DEFAULT_ADMIN_ROLE':
        return roles.isAdmin;
      case 'FABRICANTE_ROLE':
        return roles.isManufacturer;
      case 'AUDITOR_HW_ROLE':
        return roles.isHardwareAuditor;
      case 'TECNICO_SW_ROLE':
        return roles.isSoftwareTechnician;
      case 'ESCUELA_ROLE':
        return roles.isSchool;
      default:
        return false;
    }
  };

  // Función para obtener roles activos como array de hashes
  const getActiveRoles = async () => {
    const activeRoles: string[] = [];
    
    // Get role hashes from the contract
    try {
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
      
      if (roles.isAdmin) activeRoles.push('0x0000000000000000000000000000000000000000000000000000000000000000');
      if (roles.isManufacturer) activeRoles.push(fabricanteRole as string);
      if (roles.isHardwareAuditor) activeRoles.push(auditorHwRole as string);
      if (roles.isSoftwareTechnician) activeRoles.push(tecnicoSwRole as string);
      if (roles.isSchool) activeRoles.push(escuelaRole as string);
    } catch (error) {
      console.error('Error fetching role hashes:', error);
    }
    
    return activeRoles;
  };

      // Función para obtener nombres de roles activos
    const getActiveRoleNames = () => {
      const activeRoleNames: string[] = [];
      if (roles.isAdmin) activeRoleNames.push('Administrador');
      if (roles.isManufacturer) activeRoleNames.push('Fabricante');
      if (roles.isHardwareAuditor) activeRoleNames.push('Auditor HW');
      if (roles.isSoftwareTechnician) activeRoleNames.push('Técnico SW');
      if (roles.isSchool) activeRoleNames.push('Escuela');
      return activeRoleNames;
    };
    
    return {
      ...roles,
      hasRole: checkRole,
      roles: [], // Roles will be populated by the component using getActiveRoles()
      activeRoleNames: getActiveRoleNames(),
      getActiveRoles: getActiveRoles
    };

};