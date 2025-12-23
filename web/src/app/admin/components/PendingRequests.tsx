"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2, Check, X, User, Shield, Calendar } from 'lucide-react';
import { useRoleRequests } from '@/hooks/useRoleRequests';
import { truncateAddress } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ROLES } from '@/lib/constants';
import { useWeb3 } from '@/hooks/useWeb3';
import { updateRoleRequestStatus } from '@/services/RoleRequestService';
import { RoleApprovalService } from '@/services/RoleApprovalService';

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  fabricante: 'Fabricante',
  auditor_hw: 'Auditor HW',
  tecnico_sw: 'Técnico SW',
  escuela: 'Escuela'
};

const roleColors: Record<string, string> = {
  admin: 'bg-red-100 text-red-800 border-red-200',
  fabricante: 'bg-blue-100 text-blue-800 border-blue-200',
  auditor_hw: 'bg-green-100 text-green-800 border-green-200',
  tecnico_sw: 'bg-purple-100 text-purple-800 border-purple-200',
  escuela: 'bg-orange-100 text-orange-800 border-orange-200'
};

export function PendingRequests() {
  const { getPendingRequests, fetchRequests } = useRoleRequests();
  const pendingRequests = getPendingRequests();
  const { toast } = useToast();
  const { address } = useWeb3();
  const [processingIds, setProcessingIds] = useState<Record<string, boolean>>({});

  const handleApproveRequest = async (requestId: string, role: string, targetAddress: string) => {
    try {
      setProcessingIds(prev => ({ ...prev, [requestId]: true }));
      
      if (!address) {
        throw new Error("No hay una billetera conectada");
      }

      // Approve the role using the new service
      await RoleApprovalService.grantRole(role, targetAddress, address as `0x${string}`);

      // Update request status
      await updateRoleRequestStatus(requestId, 'approved');

      // Refresh requests
      await fetchRequests();

      toast({
        title: "Solicitud aprobada",
        description: `El rol ${roleLabels[role]} ha sido asignado a ${truncateAddress(targetAddress)}`,
      });
    } catch (error: any) {
      console.error('Error approving request:', error);

      let errorMessage = error.message || "No se pudo aprobar la solicitud";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setProcessingIds(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      setProcessingIds(prev => ({ ...prev, [requestId]: true }));
      
      // Update request status
      await updateRoleRequestStatus(requestId, 'rejected');

      // Refresh requests
      await fetchRequests();

      toast({
        title: "Solicitud rechazada",
        description: "La solicitud ha sido rechazada correctamente.",
      });
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      
      toast({
        title: "Error",
        description: "No se pudo rechazar la solicitud",
        variant: "destructive"
      });
    } finally {
      setProcessingIds(prev => ({ ...prev, [requestId]: false }));
    }
  };

  if (pendingRequests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes Pendientes</CardTitle>
          <CardDescription>
            No hay solicitudes de roles pendientes de aprobación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Check className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">¡Todo al día!</h3>
            <p className="text-muted-foreground">
              No hay solicitudes pendientes de aprobación
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Solicitudes Pendientes</CardTitle>
            <CardDescription>
              Solicitudes de roles que requieren aprobación
            </CardDescription>
          </div>
          <Badge variant="destructive" className="text-sm">
            {pendingRequests.length} pendientes
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingRequests.map((request) => (
            <div 
              key={request.id} 
              className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 mb-4 md:mb-0">
                <div className="flex items-center gap-3 mb-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium font-mono text-sm">
                    {truncateAddress(request.address)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 ml-7">
                  <Badge variant="outline" className={roleColors[request.role] || 'bg-gray-100 text-gray-800 border-gray-200'}>
                    <Shield className="mr-1 h-3 w-3" />
                    {roleLabels[request.role] || request.role}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(request.timestamp), 'dd/MM/yyyy HH:mm', { locale: es })}
                  </div>
                  {request.signature && (
                    <Badge variant="secondary" className="text-[10px] h-5 bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                      Firmada
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="gradient"
                  onClick={() => handleApproveRequest(request.id, request.role, request.address)}
                  disabled={processingIds[request.id]}
                >
                  {processingIds[request.id] ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Aprobando...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Aprobar
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRejectRequest(request.id)}
                  disabled={processingIds[request.id]}
                >
                  {processingIds[request.id] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
