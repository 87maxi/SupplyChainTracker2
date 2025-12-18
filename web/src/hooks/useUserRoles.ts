import { useState, useEffect } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { serverRpc } from '@/lib/serverRpc';
import { SupplyChainService } from '@/services/SupplyChainService';

interface UserRoles {
  isAdmin: boolean;
  isManufacturer: boolean;
  isHardwareAuditor: boolean;
  isSoftwareTechnician: boolean;
  isSchool: boolean;
  isLoading: boolean;
  hasRole: (roleName: string) => boolean;
  roles: string[];
}

export const useUserRoles = () => {
  const { address, isConnected } = useWeb3();
  const [roles, setRoles] = useState<UserRoles>({
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
        
        const isAdmin = await serverRpc.hasRole(SupplyChainService.DEFAULT_ADMIN_ROLE, address);
        const isManufacturer = await serverRpc.hasRole(SupplyChainService.FABRICANTE_ROLE, address);
        const isHardwareAuditor = await serverRpc.hasRole(SupplyChainService.AUDITOR_HW_ROLE, address);
        const isSoftwareTechnician = await serverRpc.hasRole(SupplyChainService.TECNICO_SW_ROLE, address);
        const isSchool = await serverRpc.hasRole(SupplyChainService.ESCUELA_ROLE, address);
        
        setRoles({
          isAdmin,
          isManufacturer,
          isHardwareAuditor,
          isSoftwareTechnician,
          isSchool,
          isLoading: false,
          hasRole: () => false, // This will be overridden by the returned object
          roles: [] // This will be overridden by the returned object
        });
      } catch (error) {
        console.error('Error fetching user roles:', error);
        setRoles(prev => ({ ...prev, isLoading: false, hasRole: () => false, roles: [] }));
      }
    };

    fetchRoles();
  }, [address, isConnected]);

  // Función para verificar roles por nombre
  const hasRole = (roleName: string) => {
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
  const getActiveRoles = () => {
    const activeRoles: string[] = [];
    if (roles.isAdmin) activeRoles.push(SupplyChainService.DEFAULT_ADMIN_ROLE);
    if (roles.isManufacturer) activeRoles.push(SupplyChainService.FABRICANTE_ROLE);
    if (roles.isHardwareAuditor) activeRoles.push(SupplyChainService.AUDITOR_HW_ROLE);
    if (roles.isSoftwareTechnician) activeRoles.push(SupplyChainService.TECNICO_SW_ROLE);
    if (roles.isSchool) activeRoles.push(SupplyChainService.ESCUELA_ROLE);
    return activeRoles;
  };

  return {
    ...roles,
    hasRole,
    roles: getActiveRoles(),
  };
};