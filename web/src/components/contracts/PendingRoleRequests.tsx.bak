'use client';

import { useState, useEffect } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { SupplyChainContract } from '@/lib/contracts/SupplyChainContract';
import { getRoleHashes } from '@/lib/roleUtils';

interface PendingRequest {
  requestId: string;
  requester: string;
  role: string;
  timestamp: number;
}

export function PendingRoleRequests() {
  const { address } = useWeb3();
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);
  const [roleHashes, setRoleHashes] = useState<Record<string, string> | null>(null);
  const { toast } = useToast();

  // Load role hashes on component mount
  useEffect(() => {
    const loadRoleHashes = async () => {
      try {
        const hashes = await getRoleHashes();
        setRoleHashes(hashes);
        // After getting role hashes, load pending requests
        loadPendingRequests(hashes);
      } catch (error) {
        console.error('Error loading role hashes:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los roles del sistema',
          variant: 'destructive',
        });
        setLoading(false);
      }
    };

    loadRoleHashes();
  }, []);

  const loadPendingRequests = (hashes: Record<string, string>) => {
    try {
      // In a real implementation, this would fetch from the contract
      // For now, we'll simulate some data
      const mockRequests: PendingRequest[] = [
        {
          requestId: '1',
          requester: '0x742d35Cc6634C0532925a3b8D4C76aA7Aa58a848',
          role: hashes.FABRICANTE,
          timestamp: Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
        },
        {
          requestId: '2',
          requester: '0x853d955aCEf822Db058eb8505911ED77F175b99e',
          role: hashes.AUDITOR_HW,
          timestamp: Math.floor(Date.now() / 1000) - 7200 // 2 hours ago
        }
      ];
      
      setRequests(mockRequests);
    } catch (error) {
      console.error('Error loading pending requests:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las solicitudes pendientes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async (requestId: string, role: string, requester: string) => {
    try {
      setApproving(requestId);
      
      // Verify if current user is admin
      const adminRole = await SupplyChainContract.getDefaultAdminRole();
      const isAdmin = await SupplyChainContract.hasRole(adminRole, address || '');
      
      if (!isAdmin) {
        throw new Error('No tienes permisos de administrador para aprobar solicitudes');
      }
      
      // Grant the role
      const result = await SupplyChainContract.grantRole(role, requester);
      
      if ('hash' in result) {
        const { config } = await import('@/lib/wagmi/config');
        const { waitForTransactionReceipt } = await import('@wagmi/core');
        const receipt = await waitForTransactionReceipt(config, { hash: result.hash });
        
        if (receipt.status !== 'success') {
          throw new Error(`Transacción fallida: ${receipt.transactionHash}`);
        }
      }
      
      // Remove the approved request from the list
      setRequests(prev => prev.filter(req => req.requestId !== requestId));
      
      toast({
        title: 'Éxito',
        description: 'Rol asignado correctamente',
      });
    } catch (error: any) {
      console.error('Error approving request:', error);
      let errorMessage = error.message || 'No se pudo aprobar la solicitud';
      if (error.message?.includes('AccessControl')) {
        errorMessage = 'No tienes permisos de administrador para realizar esta acción.';
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setApproving(null);
    }
  };

  const denyRequest = async (requestId: string) => {
    try {
      // In a real implementation, this might update a status in the contract
      // For now, just remove from the UI
      setRequests(prev => prev.filter(req => req.requestId !== requestId));
      
      toast({
        title: 'Solicitud denegada',
        description: 'La solicitud ha sido denegada',
      });
    } catch (error) {
      console.error('Error denying request:', error);
      toast({
        title: 'Error',
        description: 'No se pudo denegar la solicitud',
        variant: 'destructive',
      });
    }
  };

  const getRoleLabel = (roleHash: string) => {
    if (!roleHashes) return 'Cargando...';
    
    // Map role hashes to labels
    const roleLabels: Record<string, string> = {
      [roleHashes.FABRICANTE]: 'Fabricante',
      [roleHashes.AUDITOR_HW]: 'Auditor HW',
      [roleHashes.TECNICO_SW]: 'Técnico SW',
      [roleHashes.ESCUELA]: 'Escuela',
      [roleHashes.ADMIN]: 'Administrador'
    };
    return roleLabels[roleHash] || 'Rol Desconocido';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes de Rol Pendientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <p>Cargando solicitudes...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes de Rol Pendientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <p>No hay solicitudes pendientes</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solicitudes de Rol Pendientes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.requestId}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg space-y-2 sm:space-y-0"
            >
              <div className="space-y-1">
                <p className="font-medium">{request.requester}</p>
                <p className="text-sm text-muted-foreground">
                  Solicita rol: {getRoleLabel(request.role)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(request.timestamp * 1000).toLocaleString()}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => denyRequest(request.requestId)}
                  disabled={approving === request.requestId}
                >
                  Denegar
