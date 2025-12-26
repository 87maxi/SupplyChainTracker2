// web/src/app/admin/components/RoleManagementSection.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useWeb3 } from '@/contexts/Web3Context';
import { useRoleContract } from '@/hooks/use-contracts/use-role.hook';
import { useState, useEffect } from 'react';
import { truncateAddress } from '@/lib/utils';
import { Copy } from 'lucide-react';

// Definición de los roles disponibles
const availableRoles = [
  { value: 'FABRICANTE_ROLE', label: 'Fabricante' },
  { value: 'AUDITOR_HW_ROLE', label: 'Auditor de Hardware' },
  { value: 'TECNICO_SW_ROLE', label: 'Técnico de Software' },
  { value: 'ESCUELA_ROLE', label: 'Escuela' }
] as const;

type RoleValue = typeof availableRoles[number]['value'];

export const RoleManagementSection = () => {
  const { address } = useWeb3();
  const { 
    getAllRolesSummary, 
    getRoleMembers, 
    grantRole, 
    revokeRole,
    isLoading 
  } = useRoleContract();
  const { toast } = useToast();

  const [selectedRole, setSelectedRole] = useState<RoleValue>('FABRICANTE_ROLE');
  const [newMemberAddress, setNewMemberAddress] = useState('');
  const [roleMembers, setRoleMembers] = useState<Record<RoleValue, string[]>>({
    FABRICANTE_ROLE: [],
    AUDITOR_HW_ROLE: [],
    TECNICO_SW_ROLE: [],
    ESCUELA_ROLE: []
  });

  // Cargar resumen de roles al conectar
  useEffect(() => {
    const loadRolesSummary = async () => {
      if (address) {
        const summary = await getAllRolesSummary();
        // Actualizar los miembros por rol
        const newRoleMembers = {} as Record<RoleValue, string[]>;
        availableRoles.forEach(({ value }) => {
          const roleSummary = summary[value as keyof typeof summary];
          newRoleMembers[value as RoleValue] = (roleSummary as { members: string[] })?.members || [];
        });
        setRoleMembers(newRoleMembers);
      }
    };

    loadRolesSummary();
  }, [address, getAllRolesSummary]);

  // Cargar miembros de un rol específico
  const handleRoleChange = async (role: RoleValue) => {
    setSelectedRole(role);
    if (address) {
      const result = await getRoleMembers(role);
      setRoleMembers(prev => ({
        ...prev,
        [role]: result.members
      }));
    }
  };

  // Añadir nuevo miembro
  const handleAddMember = async () => {
    if (!newMemberAddress) {
      toast({
        title: "Error",
        description: "Por favor, ingresa una dirección",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await grantRole(selectedRole, newMemberAddress as `0x${string}`);
      if (result.success && result.hash) {
        // Actualizar la lista de miembros
        const updatedMembers = [...roleMembers[selectedRole], newMemberAddress];
        setRoleMembers(prev => ({
          ...prev,
          [selectedRole]: updatedMembers
        }));
        setNewMemberAddress('');
        
        toast({
          title: "Éxito",
          description: `Rol otorgado correctamente. Transacción: ${result.hash.slice(0, 8)}...`
        });
      }
    } catch (error) {
      console.error('Error al otorgar rol:', error);
    }
  };

  // Eliminar miembro
  const handleRemoveMember = async (role: RoleValue, memberAddress: string) => {
    try {
      const result = await revokeRole(role, memberAddress as `0x${string}`);
      if (result.success && result.hash) {
        // Actualizar la lista de miembros
        const updatedMembers = roleMembers[role].filter(addr => addr !== memberAddress);
        setRoleMembers(prev => ({
          ...prev,
          [role]: updatedMembers
        }));
        
        toast({
          title: "Éxito",
          description: `Rol revocado correctamente. Transacción: ${result.hash.slice(0, 8)}...`
        });
      }
    } catch (error) {
      console.error('Error al revocar rol:', error);
    }
  };

  // Copiar dirección al portapapeles
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "Dirección copiada al portapapeles"
    });
  };

  // Obtener nombre del rol para mostrar
  const getRoleLabel = (role: RoleValue) => {
    return availableRoles.find(r => r.value === role)?.label || role;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Roles</CardTitle>
        <CardDescription>Administra los roles y miembros del sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Label htmlFor="role-select">Seleccionar Rol</Label>
            <Select value={selectedRole} onValueChange={(value) => handleRoleChange(value as RoleValue)}>
              <SelectTrigger id="role-select">
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1">
            <Label htmlFor="new-member">Nueva Dirección</Label>
            <div className="flex gap-2">
              <Input
                id="new-member"
                placeholder="0x..."
                value={newMemberAddress}
                onChange={(e) => setNewMemberAddress(e.target.value)}
              />
              <Button onClick={handleAddMember} disabled={isLoading(`grantRole:${selectedRole}`)}>
                {isLoading(`grantRole:${selectedRole}`) ? 'Añadiendo...' : 'Añadir'}
              </Button>
            </div>
          </div>
        </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Dirección</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roleMembers[selectedRole].length > 0 ? (
                  roleMembers[selectedRole].map((memberAddress) => (
                    <TableRow key={memberAddress}>
                      <TableCell className="font-mono text-sm">
                        {truncateAddress(memberAddress)}
                        <Copy 
                          className="inline-block ml-2 h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground" 
                          onClick={() => copyToClipboard(memberAddress)} 
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getRoleLabel(selectedRole)}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                                              <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleRemoveMember(selectedRole, memberAddress)}
                          disabled={isLoading(`revokeRole:${selectedRole}`)}
                        >
                          {isLoading(`revokeRole:${selectedRole}`) ? 'Revocando...' : 'Revocar'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      No hay miembros en este rol.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
    </Card>
  )
};
