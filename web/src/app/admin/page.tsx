"use client";

import { useWeb3 } from '@/contexts/Web3Context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { SupplyChainService } from '@/services/SupplyChainService';
import { State } from '@/types/contract';

export default function AdminPage() {
  const { address, isConnected } = useWeb3();
  const [role, setRole] = useState('');
  const [account, setAccount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const roles = [
    { value: '0xc9d9e6b172513355070360451450413840810234077175348639291479838649', label: 'FABRICANTE_ROLE' },
    { value: '0x69abb1d469219997098950756a29849743111a44297561274841978723934425', label: 'AUDITOR_HW_ROLE' },
    { value: '0xd25c992a48858314113753611945045859423533313842771219981911994373', label: 'TECNICO_SW_ROLE' },
    { value: '0x8a56fd3344097613215665977667319753531132276132611988941251823874', label: 'ESCUELA_ROLE' }
  ];

  const handleGrantRole = async () => {
    if (!isConnected || !address) {
      setError('Please connect your wallet');
      return;
    }

    if (!role || !account) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setSuccess('');

    try {
      await SupplyChainService.grantRole(role, account);
      setSuccess('Role granted successfully!');
      setRole('');
      setAccount('');
    } catch (error: any) {
      console.error('Error granting role:', error);
      setError(error.message || 'Failed to grant role');
    }
  };

  const handleRevokeRole = async () => {
    if (!isConnected || !address) {
      setError('Please connect your wallet');
      return;
    }

    if (!role || !account) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setSuccess('');

    try {
      await SupplyChainService.revokeRole(role, account);
      setSuccess('Role revoked successfully!');
      setRole('');
      setAccount('');
    } catch (error: any) {
      console.error('Error revoking role:', error);
      setError(error.message || 'Failed to revoke role');
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Administración del Sistema</h1>
      
      {isConnected ? (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground">Conectado como: <span className="font-mono">{address}</span></p>
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
                      <select
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">Seleccionar rol</option>
                        {roles.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
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
                  
                  {error && <div className="text-red-500 p-4 rounded-md bg-red-50">{error}</div>}
                  {success && <div className="text-green-500 p-4 rounded-md bg-green-50">{success}</div>}
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
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg mb-4">Por favor, conecta tu wallet para acceder al panel de administración.</p>
            <Button onClick={() => window.location.reload()}>Conectar Wallet</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}