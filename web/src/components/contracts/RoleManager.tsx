import { useState, useEffect } from 'react';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { useToast } from '@hooks/use-toast';
import { useRoleCallsManager } from '@/hooks/useRoleCallsManager';
import { useRoleData } from '@/hooks/useRoleData';

interface Role {
  name: string;
  description: string;
  color: string;
}

// Definición de roles disponibles
const roles: Role[] = [
  {
    name: 'fabricante',
    description: 'Puede registrar nuevas netbooks en el sistema',
    color: 'bg-blue-100'
  },
  {
    name: 'auditor_hw',
    description: 'Puede realizar auditorías de hardware',
    color: 'bg-green-100'
  },
  {
    name: 'tecnico_sw',
    description: 'Puede validar el software instalado',
    color: 'bg-yellow-100'
  },
  {
    name: 'escuela',
    description: 'Puede asignar netbooks a estudiantes',
    color: 'bg-purple-100'
  }
];

export function RoleManager() {
  const [selectedRole, setSelectedRole] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { grantRole } = useRoleCallsManager();
  const { data: accountInfo, refetch: refetchAccountInfo } = useRoleData();

  // Verificar si el usuario puede conceder roles
  const canGrantRoles = accountInfo?.roles?.includes('admin') || false;

  const handleGrantRole = async () => {
    if (!selectedRole || !address) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos",
        variant: "destructive",
      });
      return;
    }

    // Validar dirección Ethereum
    if (!/^(0x)?[0-9a-fA-F]{40}$/.test(address)) {
      toast({
        title: "Error",
        description: "Dirección Ethereum inválida",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Convertir nombre del rol a hash según el contrato
      const roleHash = getRoleHash(selectedRole);
      
      const result = await grantRole(roleHash, address);
      
      if (result.success) {
        toast({
          title: "Éxito",
          description: `Rol ${selectedRole} concedido a ${address}`,
        });
        
        // Limpiar formulario
        setSelectedRole('');
        setAddress('');
        
        // Refrescar información de la cuenta
        refetchAccountInfo();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('Error granting role:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo conceder el rol",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener el hash del rol según el contrato
  const getRoleHash = (roleName: string): string => {
    const roleHashes: { [key: string]: string } = {
      fabricante: '0x69c9d0bc9936ff6c338514a41e3d5a3756816c733d2870f51f9b137bb0564731',
      auditor_hw: '0x9eeccda90686352275253677a7776d52e3cf85c28aa4ed8caa295b9db24ebca1',
      tecnico_sw: '0x0b00940495168a7f52e9e4ca224ed388143fdb5ee0015bc394ac5e269374ddf1',
      escuela: '0xd08ea8e84b5076e430882068b0966c64e3d2876063d1f53a9b071247cbe5e785',
      admin: '0x0000000000000000000000000000000000000000000000000000000000000000'
    };
    
    return roleHashes[roleName as keyof typeof roleHashes] || '';
  };

  if (!canGrantRoles) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Roles</CardTitle>
          <CardDescription>
            Necesitas permisos de administrador para gestionar roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Solo los administradores pueden conceder roles a otros usuarios.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Roles</CardTitle>
        <CardDescription>
          Conceder roles a usuarios para permitirles realizar acciones específicas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Rol a Conceder</Label>
              <Select onValueChange={setSelectedRole} value={selectedRole}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.name} value={role.name}>
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${role.color} mr-2`}></div>
                        {role.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Dirección del Usuario</Label>
              <Input
                id="address"
                placeholder="0x..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="font-mono"
              />
            </div>
          </div>
          
          {selectedRole && (
            <div className="p-4 border rounded-md bg-muted">
              <h4 className="text-sm font-medium mb-2">Detalles del Rol</h4>
              <p className="text-sm text-muted-foreground">
                {roles.find(r => r.name === selectedRole)?.description}
              </p>
            </div>
          )}
          
          <Button 
            onClick={handleGrantRole} 
            disabled={loading || !selectedRole || !address}
            className="w-full md:w-auto"
          >
            {loading ? 'Concediendo...' : 'Conceder Rol'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}