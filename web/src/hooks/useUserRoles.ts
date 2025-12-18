import { useState, useEffect } from 'react';
import { useWeb3 } from '@/hooks/useWeb3';
import { ROLES, ROLE_LABELS } from '@/lib/constants';
import * as SupplyChainService from '@/services/SupplyChainService';

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

        const isAdmin = await SupplyChainService.hasRole('0x0000000000000000000000000000000000000000000000000000000000000000', address);
        const isManufacturer = await SupplyChainService.hasRole(ROLES.FABRICANTE.hash, address);
        const isHardwareAuditor = await SupplyChainService.hasRole(ROLES.AUDITOR_HW.hash, address);
        const isSoftwareTechnician = await SupplyChainService.hasRole(ROLES.TECNICO_SW.hash, address);
        const isSchool = await SupplyChainService.hasRole(ROLES.ESCUELA.hash, address);

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
  const getActiveRoles = () => {
    const activeRoles: string[] = [];
    if (roles.isAdmin) activeRoles.push(ROLES.ADMIN.hash);
    if (roles.isManufacturer) activeRoles.push(ROLES.FABRICANTE.hash);
    if (roles.isHardwareAuditor) activeRoles.push(ROLES.AUDITOR_HW.hash);
    if (roles.isSoftwareTechnician) activeRoles.push(ROLES.TECNICO_SW.hash);
    if (roles.isSchool) activeRoles.push(ROLES.ESCUELA.hash);
    return activeRoles;
  };

  return {
    ...roles,
    hasRole: checkRole,
    roles: getActiveRoles(),
  };
};