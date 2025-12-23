import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { RoleRequest } from '@/types/role-request';
import { useRoleRequests } from '@/hooks/useRoleRequests';
import { RoleApprovalManager } from './RoleApprovalManager';

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  fabricante: 'Fabricante',
  auditor_hw: 'Auditor HW',
  tecnico_sw: 'Técnico SW',
  escuela: 'Escuela'
};

const roleColors: Record<string, string> = {
  admin: 'bg-red-100 text-red-800',
  fabricante: 'bg-blue-100 text-blue-800',
  auditor_hw: 'bg-green-100 text-green-800',
  tecnico_sw: 'bg-purple-100 text-purple-800',
  escuela: 'bg-orange-100 text-orange-800'
};

export function PendingRoleRequests() {
  const { getPendingRequests, loading, error, rejectRequest } = useRoleRequests();
  const pendingRequests = getPendingRequests();
  const { toast } = useToast();

  const handleApprovalComplete = (requestId: string) => {
    // In a real implementation, you might want to refresh the list
    // For now, we'll just show a success message
    toast({
      title: "Éxito",
      description: "Solicitud aprobada correctamente.",
    });
  };

  const handleApprovalError = (requestId: string, error: string) => {
      toast({
      title: "Error",
      description: error,
      variant: "destructive",
    });
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const result = await rejectRequest(requestId);
      if (result.success) {
        toast({
          title: "Éxito",
          description: "Solicitud rechazada.",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Error rejecting request:', err);
      toast({
        title: "Error",
        description: "No se pudo rechazar la solicitud.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes de Rol Pendientes</CardTitle>
          <CardDescription>Cargando solicitudes...</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Cargando...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes de Rol Pendientes</CardTitle>
          <CardDescription>Error al cargar solicitudes</CardDescription>
        </CardHeader>
      <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solicitudes de Rol Pendientes</CardTitle>
        <CardDescription>
          Aprobar o rechazar solicitudes de roles de usuarios
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pendingRequests.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No hay solicitudes pendientes
          </p>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div 
                key={request.id} 
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium">{request.address}</div>
                  <div className="text-sm text-muted-foreground">
                    Solicitado: {new Date(request.timestamp).toLocaleString()}
                  </div>
                  <Badge className={roleColors[request.role] || 'bg-gray-100 text-gray-800'}>
                    {roleLabels[request.role] || request.role}
                  </Badge>
                </div>
                <div className="flex space-x-2">
                  <RoleApprovalManager
                    targetAddress={request.address}
                    role={request.role}
                    onApprovalComplete={() => handleApprovalComplete(request.id)}
                    onApprovalError={(error) => handleApprovalError(request.id, error)}
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleRejectRequest(request.id)}
                  >
                    Rechazar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
