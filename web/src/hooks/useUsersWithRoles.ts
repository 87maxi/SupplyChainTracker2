import { useState, useEffect } from 'react';
import { useWeb3 } from '@/hooks/useWeb3';
import { getRoleMembers } from '@/lib/api/clientRpc';
import { ROLES } from '@/lib/constants';

export interface UserWithRoles {
  address: string;
  roles: string[];
  joined: Date;
  isCurrentUser: boolean;
}

export function useUsersWithRoles() {
  const { isConnected, address: currentUserAddress } = useWeb3();
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    if (!isConnected) {
      setUsers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get role hashes from constants
      const { FABRICANTE, AUDITOR_HW, TECNICO_SW, ESCUELA, ADMIN } = ROLES;

      // Fetch members for each role concurrently
      const [adminMembers, fabricanteMembers, auditorHwMembers, tecnicoSwMembers, escuelaMembers] =
        await Promise.all([
          getRoleMembers(ADMIN.hash),
          getRoleMembers(FABRICANTE.hash),
          getRoleMembers(AUDITOR_HW.hash),
          getRoleMembers(TECNICO_SW.hash),
          getRoleMembers(ESCUELA.hash)
        ]);

      // Create a map to aggregate roles by address
      const userRolesMap = new Map<string, string[]>();

      // Helper function to add roles to the map
      const addRolesToMap = (addresses: string[], role: string) => {
        addresses.forEach(address => {
          const normalizedAddress = address.toLowerCase();
          const existingRoles = userRolesMap.get(normalizedAddress) || [];
          userRolesMap.set(normalizedAddress, [...existingRoles, role]);
        });
      };

      // Add roles from each category
      addRolesToMap(adminMembers, 'admin');
      addRolesToMap(fabricanteMembers, 'fabricante');
      addRolesToMap(auditorHwMembers, 'auditor_hw');
      addRolesToMap(tecnicoSwMembers, 'tecnico_sw');
      addRolesToMap(escuelaMembers, 'escuela');

      // Convert map to array of users
      const usersArray: UserWithRoles[] = [];
      userRolesMap.forEach((roles, address) => {
        usersArray.push({
          address,
          roles,
          joined: new Date(), // We don't have join dates from the contract, using current date
          isCurrentUser: address === currentUserAddress?.toLowerCase()
        });
      });

      setUsers(usersArray);
    } catch (err) {
      console.error('Error fetching users with roles:', err);
      setError('No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [isConnected, currentUserAddress]);

  return {
    users,
    loading,
    error,
    refetch: fetchUsers
  };
}
