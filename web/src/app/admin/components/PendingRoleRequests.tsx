'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Check, X, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWeb3 } from '@/contexts/Web3Context';
import { useRoleRequests } from '@/hooks/useRoleRequests';
import { RoleRequest } from '@/types/role-request';
import { useSupplyChainService } from '@/hooks/useSupplyChainService';
import { useEffect, useState } from 'react';

export function PendingRoleRequests() {
  const { requests, loading, updateRequestStatus } = useRoleRequests();
  const { toast } = useToast();
  const { address, isConnected } = useWeb3();
  const { grantRole } = useSupplyChainService();
  const [approving, setApproving] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);

  // Filtrar solo solicitudes pendientes
  const pendingRequests = requests.filter(req => req.status === 'pending');

  // Role descriptions for display
  const roleDescriptions: Record<string, string> = {
    'FABRICANTE': 'Puede registrar nuevos dispositivos en la cadena de suministro',
    'AUDITOR_HW': 'Puede realizar auditorías físicas del hardware',
    'TECNICO_SW': 'Puede validar el software instalado en los dispositivos',
    'ESCUELA': 'Puede asignar dispositivos a estudiantes finales'
  };

  const handleApprove = async (requestId: string, role: string, userAddress: string) => {
    setApproving(requestId);
    try {
      console.log(`Approving request ${requestId} for role ${role} and address ${userAddress}`);

      // 1. Grant role in blockchain
      const receipt = await grantRole(role, userAddress as `0x${string}`);
      console.log('Blockchain transaction successful:', receipt);

      // 2. Update status in server
      const success = await updateRequestStatus(requestId, 'approved');

      if (success) {
        toast({
          title: 'Rol asignado correctamente',
          description: `Transacción confirmada: ${receipt.transactionHash.slice(0, 10)}...`,
        });
      }
    } catch (error: any) {
      console.error('Error approving request:', error);
      toast({
        title: 'Error al aprobar solicitud',
        description: error.message || 'La transacción falló o fue rechazada',
        variant: 'destructive',
      });
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setRejecting(requestId);
    try {
      console.log(`Rejecting request ${requestId}`);
      const success = await updateRequestStatus(requestId, 'rejected');

      if (success) {
        toast({
          title: 'Solicitud rechazada',
          description: 'La solicitud ha sido rechazada correctamente',
        });
      }
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      toast({
        title: 'Error',
        description: 'No se pudo rechazar la solicitud en el servidor',
        variant: 'destructive',
      });
    } finally {
      setRejecting(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Cargando solicitudes...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (pendingRequests.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Check className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Sin solicitudes pendientes</h3>
            <p className="text-muted-foreground">
              No hay solicitudes de roles pendientes de aprobación
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Solicitudes Pendientes</h3>
        <div className="space-y-4">
          {pendingRequests.map((request: RoleRequest) => (
            <div
              key={request.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="outline" className="text-xs font-semibold px-2 py-0.5 bg-primary/5 border-primary/20 text-primary">
                    {request.role}
                  </Badge>
                  <span className="text-sm font-mono text-muted-foreground bg-muted/30 px-2 py-0.5 rounded">
                    {request.address.slice(0, 6)}...{request.address.slice(-4)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground/80 leading-relaxed">
                  {roleDescriptions[request.role] || 'Solicitud de acceso al sistema'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handleApprove(request.id, request.role, request.address)}
                  disabled={approving === request.id || rejecting === request.id}
                >
                  {approving === request.id ? 'Aprobando...' : 'Aprobar'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReject(request.id)}
                  disabled={approving === request.id || rejecting === request.id}
                >
                  {rejecting === request.id ? 'Rechazando...' : 'Rechazar'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}