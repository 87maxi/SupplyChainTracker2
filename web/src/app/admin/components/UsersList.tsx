"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Shield, RefreshCw } from 'lucide-react';
import { ROLES } from '@/lib/constants';
import { useWeb3 } from '@/hooks/useWeb3';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getRoleMembers } from '@/lib/api/clientRpc';
import { truncateAddress } from '@/lib/utils';

interface UserRoleData {
  role: string;
  address: string;
  since: string;
  status: 'active' | 'inactive';
  id?: string;
}

const roleColors = {
  admin: 'bg-red-100 text-red-800 border-red-200',
  fabricante: 'bg-blue-100 text-blue-800 border-blue-200',
  auditor_hw: 'bg-green-100 text-green-800 border-green-200',
  tecnico_sw: 'bg-purple-100 text-purple-800 border-purple-200',
  escuela: 'bg-orange-100 text-orange-800 border-orange-200',
};

const roleLabels = {
  admin: 'Administrador',
  fabricante: 'Fabricante',
  auditor_hw: 'Auditor HW',
  tecnico_sw: 'Técnico SW',
  escuela: 'Escuela'
};

export function UsersList() {
  const { isConnected, address: currentUserAddress } = useWeb3();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserRoleData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch users when component mounts or connection changes
  useEffect(() => {
    if (isConnected) {
      fetchUsers();
    } else {
      setUsers([]);
      setIsLoading(false);
    }
  }, [isConnected]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setUsers([]);

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

      // Transform to UserRoleData format
      const allUsers: UserRoleData[] = [];

      // Add admin members
      adminMembers.forEach((address: string, index: number) => {
        allUsers.push({
          id: `admin-${index}-${address}`,
          address,
          role: 'admin',
          since: new Date().toISOString().split('T')[0],
          status: 'active'
        });
      });

      // Add fabricante members
      fabricanteMembers.forEach((address: string, index: number) => {
        allUsers.push({
          id: `fabricante-${index}-${address}`,
          address,
          role: 'fabricante',
          since: new Date().toISOString().split('T')[0],
          status: 'active'
        });
      });

      // Add auditor_hw members
      auditorHwMembers.forEach((address: string, index: number) => {
        allUsers.push({
          id: `auditor_hw-${index}-${address}`,
          address,
          role: 'auditor_hw',
          since: new Date().toISOString().split('T')[0],
          status: 'active'
        });
      });

      // Add tecnico_sw members
      tecnicoSwMembers.forEach((address: string, index: number) => {
        allUsers.push({
          id: `tecnico_sw-${index}-${address}`,
          address,
          role: 'tecnico_sw',
          since: new Date().toISOString().split('T')[0],
          status: 'active'
        });
      });

      // Add escuela members
      escuelaMembers.forEach((address: string, index: number) => {
        allUsers.push({
          id: `escuela-${index}-${address}`,
          address,
          role: 'escuela',
          since: new Date().toISOString().split('T')[0],
          status: 'active'
        });
      });

      setUsers(allUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    roleLabels[user.role as keyof typeof roleLabels].toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Usuarios</CardTitle>
          <CardDescription>
            Administrar roles y permisos para todas las direcciones registradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2">Cargando usuarios...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <CardTitle>Gestión de Usuarios</CardTitle>
            <CardDescription>
              Administrar roles y permisos para todas las direcciones registradas
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuarios..."
                className="pl-8 w-full md:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" onClick={fetchUsers}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Shield className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No se encontraron usuarios con roles asignados.</p>
            <p className="text-sm mt-2">Los roles se asignan automáticamente cuando se aprueban las solicitudes.</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-12 px-4 text-left text-sm font-medium">Dirección</th>
                  <th className="h-12 px-4 text-left text-sm font-medium">Rol</th>
                  <th className="h-12 px-4 text-left text-sm font-medium">Estado</th>
                  <th className="h-12 px-4 text-left text-sm font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="h-16 px-4 py-2 font-mono text-sm">
                      {truncateAddress(user.address)}
                      {user.address === currentUserAddress && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          Tú
                        </Badge>
                      )}
                    </td>
                    <td className="h-16 px-4 py-2">
                      <Badge variant="outline" className={roleColors[user.role as keyof typeof roleColors]}>
                        <Shield className="mr-1 h-3 w-3" />
                        {roleLabels[user.role as keyof typeof roleLabels]}
                      </Badge>
                    </td>
                    <td className="h-16 px-4 py-2">
                      <Badge variant={user.status === 'active' ? "default" : "secondary"}>
                        {user.status === 'active' ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="h-16 px-4 py-2 text-right">
                      <Button variant="outline" size="sm" className="mr-2">
                        Editar
                      </Button>
                      <Button variant="outline" size="sm">
                        Revocar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron usuarios que coincidan con la búsqueda.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
