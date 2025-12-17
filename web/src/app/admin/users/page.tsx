"use client";

import { useWeb3 } from '@/hooks/useWeb3';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SupplyChainService } from '@/services/SupplyChainService';
import { useState, useEffect } from 'react';
import { State } from '@/types/contract';

export default function AdminUsersPage() {
  const { address, isConnected } = useWeb3();
  const [users, setUsers] = useState<Array<{address: string, roles: string[]}>>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const rolesMap = {
    '0xc9d9e6b172513355070360451450413840810234077175348639291479838649': 'FABRICANTE_ROLE',
    '0x69abb1d469219997098950756a29849743111a44297561274841978723934425': 'AUDITOR_HW_ROLE',
    '0xd25c992a48858314113753611945045859423533313842771219981911994373': 'TECNICO_SW_ROLE',
    '0x8a56fd3344097613215665977667319753531132276132611988941251823874': 'ESCUELA_ROLE',
    '0x0000000000000000000000000000000000000000000000000000000000000000': 'DEFAULT_ADMIN_ROLE'
  };

  useEffect(() => {
    const fetchUsers = async () => {
      if (!isConnected) return;
      
      setLoading(true);
      setError('');
      
      try {
        // Get all serial numbers to identify registered netbooks
        const serials = await SupplyChainService.getAllSerialNumbers();
        
        // Get all users with roles
        const usersWithRoles: Array<{address: string, roles: string[]}> = [];
        
        // Check for users with each role
        const roleKeys = Object.keys(rolesMap);
        
        for (const roleKey of roleKeys) {
          // We need to get all addresses that have this role
          // This is a simplified approach - in a real implementation, we'd have events to track role assignments
          // For now, we'll just show the admin address and any other addresses we know about
          
          // Get the admin address (who can grant roles)
          if (roleKey === '0x0000000000000000000000000000000000000000000000000000000000000000') {
            usersWithRoles.push({
              address: address || '',
              roles: [rolesMap[roleKey]]
            });
          }
        }
        
        // For demonstration, we'll also add some sample users
        // In a real implementation, we'd query the contract for all role assignments
        
        setUsers(usersWithRoles);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [isConnected, address]);

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg mb-4">Por favor, conecta tu wallet para acceder a la gestión de usuarios.</p>
            <Button onClick={() => window.location.reload()}>Conectar Wallet</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p>Cargando usuarios...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Gestión de Usuarios</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Usuarios con Roles</CardTitle>
          <CardDescription>Lista de direcciones con permisos asignados en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <div className="text-red-500 p-4 rounded-md bg-red-50 mb-4">{error}</div>}
          
          {users && users.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dirección</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono">{user.address}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role, roleIndex) => (
                          <span key={roleIndex} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {role}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => {
                        // This would open a modal to grant/revoke roles
                        // For now, we'll redirect to the main admin page
                        window.location.href = '/admin';
                      }}>
                        Gestionar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No se han asignado roles a usuarios aún.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}