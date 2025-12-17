"use client";

import { useWeb3 } from '@/lib/web3';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { SupplyChainService } from '@/services/SupplyChainService';
import { RoleRequestService, RoleRequest } from '@/services/RoleRequestService';
import { State } from '@/types/contract';

export default function AdminPage() {
  const { address, isConnected } = useWeb3();
  const [role, setRole] = useState('');
  const [account, setAccount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);



  // Check if user is admin on mount/address change
  useEffect(() => {
    const checkAdmin = async () => {
      if (isConnected && address) {
        try {
          const adminStatus = await SupplyChainService.isAdmin(address);
          setIsAdmin(adminStatus);
        } catch (err) {
          console.error("Failed to check admin status", err);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setCheckingAdmin(false);
    };
    checkAdmin();
  }, [isConnected, address]);

  const roles = [
    { value: '0xc9d9e6b172513355070360451450413840810234077175348639291479838649', label: 'FABRICANTE_ROLE' },
    { value: '0x69abb1d469219997098950756a29849743111a44297561274841978723934425', label: 'AUDITOR_HW_ROLE' },
    { value: '0xd25c992a48858314113753611945045859423533313842771219981911994373', label: 'TECNICO_SW_ROLE' },
    { value: '0x8a56fd3344097613215665977667319753531132276132611988941251823874', label: 'ESCUELA_ROLE' }
  ];

  const validateAddress = (addr: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(addr);
  };

  const handleGrantRole = async () => {
    if (!isConnected || !address) {
      setError('Please connect your wallet');
      return;
    }

    if (!role || !account) {
      setError('Please fill in all fields');
      return;
    }

    if (!validateAddress(account)) {
      setError('Invalid Ethereum address format');
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

    if (!validateAddress(account)) {
      setError('Invalid Ethereum address format');
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

  const [pendingRequests, setPendingRequests] = useState<RoleRequest[]>([]);

  useEffect(() => {
    // Load pending requests
    const loadRequests = () => {
      const allRequests = RoleRequestService.getRequests();
      setPendingRequests(allRequests.filter(r => r.status === 'pending'));
    };

    loadRequests();
    // Poll for updates every 5 seconds
    const interval = setInterval(loadRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleApproveRequest = async (req: RoleRequest) => {
    try {
      await SupplyChainService.grantRole(req.role, req.address);
      RoleRequestService.updateRequestStatus(req.address, 'approved');
      setSuccess(`Role ${req.roleName} granted to ${req.address}`);
      // Refresh list
      const allRequests = RoleRequestService.getRequests();
      setPendingRequests(allRequests.filter(r => r.status === 'pending'));
    } catch (error: any) {
      console.error('Error approving request:', error);
      setError(error.message || 'Failed to approve request');
    }
  };

  const handleRejectRequest = (address: string) => {
    RoleRequestService.updateRequestStatus(address, 'rejected');
    // Refresh list
    const allRequests = RoleRequestService.getRequests();
    setPendingRequests(allRequests.filter(r => r.status === 'pending'));
  };

  const handleCancelRequest = (address: string) => {
    RoleRequestService.removeRequest(address);
    // Refresh list
    const allRequests = RoleRequestService.getRequests();
    setPendingRequests(allRequests.filter(r => r.status === 'pending'));
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Administración del Sistema</h1>

      {isConnected ? (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground">Conectado como: <span className="font-mono">{address}</span></p>
            {isAdmin && <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-xs font-medium border border-green-500/20">Admin Access</span>}
          </div>

          <Tabs defaultValue="roles" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="roles">Gestión de Roles</TabsTrigger>
              <TabsTrigger value="tokens">Gestión de Tokens</TabsTrigger>
            </TabsList>

            <TabsContent value="roles" className="space-y-6">
              {isAdmin ? (
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
                          className="w-full p-2 border rounded-md bg-background"
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
                          className="font-mono"
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

                    {error && <div className="text-red-500 p-4 rounded-md bg-red-500/10 border border-red-500/20">{error}</div>}
                    {success && <div className="text-green-500 p-4 rounded-md bg-green-500/10 border border-green-500/20">{success}</div>}

                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-4">Solicitudes Pendientes</h3>
                      {pendingRequests.length > 0 ? (
                        <div className="border rounded-md overflow-hidden">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50">
                              <tr>
                                <th className="p-4 font-medium">Usuario</th>
                                <th className="p-4 font-medium">Rol Solicitado</th>
                                <th className="p-4 font-medium">Estado</th>
                                <th className="p-4 font-medium text-right">Acciones</th>
                              </tr>
                            </thead>
                            <tbody>
                              {pendingRequests.map((req, i) => (
                                <tr key={i} className="border-t">
                                  <td className="p-4 font-mono">{req.address}</td>
                                  <td className="p-4">{req.roleName}</td>
                                  <td className="p-4">
                                    <span className="bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-full text-xs border border-yellow-500/20">
                                      Pendiente
                                    </span>
                                  </td>
                                  <td className="p-4 text-right space-x-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleApproveRequest(req)}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      Aceptar
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleRejectRequest(req.address)}
                                      className="text-orange-500 hover:text-orange-600 hover:bg-orange-50 border-orange-200"
                                    >
                                      Rechazar
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleCancelRequest(req.address)}
                                      className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                                    >
                                      Cancelar
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-8 border rounded-md border-dashed">
                          No hay solicitudes pendientes
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Acceso Restringido</h3>
                    <p className="text-muted-foreground max-w-md">
                      Solo el administrador del sistema puede gestionar roles. Tu cuenta actual no tiene los permisos necesarios.
                    </p>
                  </CardContent>
                </Card>
              )}
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