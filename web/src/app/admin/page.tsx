"use client";

import { useWeb3 } from '@/hooks/useWeb3';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState } from 'react';
import { SupplyChainService } from '@/services/SupplyChainService';
import { ROLES } from '@/lib/constants';
import { useUserRoles } from '@/hooks/useUserRoles';

export default function AdminPage() {
  const { address, isConnected } = useWeb3();
  const { hasRole } = useUserRoles();
  const [selectedRole, setSelectedRole] = useState('');
  const [account, setAccount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isAdmin = hasRole(SupplyChainService.DEFAULT_ADMIN_ROLE);

  const handleGrantRole = async () => {
    if (!isConnected || !address) {
      setError('Por favor, conecta tu wallet');
      return;
    }

    if (!selectedRole || !account) {
      setError('Por favor, completa todos los campos');
      return;
    }

    setError('');
    setSuccess('');

    try {
              const tx = await SupplyChainService.grantRole(selectedRole, account);
        await tx.wait();
      setSuccess('Rol asignado correctamente!');
      setSelectedRole('');
      setAccount('');
    } catch (error: any) {
      console.error('Error asignando rol:', error);
      setError(error.message || 'Error al asignar el rol');
    }
  };

  const handleRevokeRole = async () => {
    if (!isConnected || !address) {
      setError('Por favor, conecta tu wallet');
      return;
    }

    if (!selectedRole || !account) {
      setError('Por favor, completa todos los campos');
      return;
    }

    setError('');
    setSuccess('');

    try {
              const tx = await SupplyChainService.revokeRole(selectedRole, account);
        await tx.wait();
      setSuccess('Rol revocado correctamente!');
      setSelectedRole('');
      setAccount('');
    } catch (error: any) {
      console.error('Error revocando rol:', error);
      setError(error.message || 'Error al revocar el rol');
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg mb-4">Por favor, conecta tu wallet para acceder al panel de administración.</p>
            <Button onClick={() => window.location.reload()}>Conectar Wallet</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Acceso Denegado</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No tienes permisos de administrador para acceder a esta sección.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Administración del Sistema</h1>
        <p className="text-muted-foreground">
          Conectado como: <span className="font-mono">{address}</span>
        </p>
      </div>
      
      <Tabs defaultValue="roles" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="roles">Gestión de Roles</TabsTrigger>
          <TabsTrigger value="tokens">Gestión de Tokens</TabsTrigger>
        </TabsList>
        
        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Roles</CardTitle>
              <CardDescription>Asignar o revocar permisos a direcciones de blockchain</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Rol</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={SupplyChainService.FABRICANTE_ROLE}>Fabricante</SelectItem>
            <SelectItem value={SupplyChainService.AUDITOR_HW_ROLE}>Auditor HW</SelectItem>
            <SelectItem value={SupplyChainService.TECNICO_SW_ROLE}>Técnico SW</SelectItem>
            <SelectItem value={SupplyChainService.ESCUELA_ROLE}>Escuela</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="account">Dirección</Label>
                  <Input
                    id="account"
                    type="text"
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    placeholder="0x..."
                  />
                </div>
                
                <div className="flex items-end space-x-2">
                  <Button onClick={handleGrantRole} className="w-full">
                    Asignar Rol
                  </Button>
                  <Button variant="outline" onClick={handleRevokeRole} className="w-full">
                    Revocar Rol
                  </Button>
                </div>
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert variant="success">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tokens" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Tokens</CardTitle>
              <CardDescription>Crear y gestionar tokens NFT de netbooks</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Funcionalidad de creación de tokens aún en desarrollo.</p>
              <Button className="mt-4" onClick={() => window.location.href = '/tokens/create'}>
                Crear NFTs
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}