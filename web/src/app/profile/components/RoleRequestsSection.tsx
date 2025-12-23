"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRoleRequests } from '@/hooks/useRoleRequests';
import { useWeb3 } from '@/hooks/useWeb3';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Shield, Clock, CheckCircle, XCircle } from 'lucide-react';

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  approved: 'Aprobada',
  rejected: 'Rechazada'
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200'
};

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  fabricante: 'Fabricante',
  auditor_hw: 'Auditor HW',
  tecnico_sw: 'Técnico SW',
  escuela: 'Escuela'
};

export function RoleRequestsSection() {
  const { requests, loading, error } = useRoleRequests();
  const { address } = useWeb3();
  
  // Filter requests for current user
  const userRequests = requests.filter(req => req.address === address);
  
  // Separate requests by status
  const pendingRequests = userRequests.filter(req => req.status === 'pending');
  const approvedRequests = userRequests.filter(req => req.status === 'approved');
  const rejectedRequests = userRequests.filter(req => req.status === 'rejected');

  if (loading) {
    return (
      <Card>
        <CardHeader>
        <CardTitle>Solicitudes de Rol</CardTitle>
        <CardDescription>
          Cargando historial de solicitudes...
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-center py-4">Cargando...</p>
      </CardContent>
    </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes de Rol</CardTitle>
          <CardDescription>
            Error al cargar el historial
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-4 text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solicitudes de Rol</CardTitle>
        <CardDescription>
          Historial de tus solicitudes de roles en el sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {userRequests.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay solicitudes</h3>
            <p className="text-muted-foreground">
              Aún no has solicitado ningún rol en el sistema
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pending requests */}
            {pendingRequests.length > 0 && (
              <div>
                <h4 className="flex items-center gap-2 text-sm font-medium mb-3">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  Solicitudes Pendientes ({pendingRequests.length})
                </h4>
                <div className="space-y-3">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50/50">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                          {roleLabels[request.role] || request.role}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Solicitado el {format(new Date(request.timestamp), 'dd/MM/yyyy', { locale: es })}
                        </span>
                      </div>
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        Pendiente
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Approved requests */}
            {approvedRequests.length > 0 && (
              <div>
                <h4 className="flex items-center gap-2 text-sm font-medium mb-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Solicitudes Aprobadas ({approvedRequests.length})
                </h4>
                <div className="space-y-3">
                  {approvedRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg bg-green-50/50">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                          {roleLabels[request.role] || request.role}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Aprobado el {format(new Date(request.timestamp), 'dd/MM/yyyy', { locale: es })}
                        </span>
                      </div>
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        Aprobada
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rejected requests */}
            {rejectedRequests.length > 0 && (
              <div>
                <h4 className="flex items-center gap-2 text-sm font-medium mb-3">
                  <XCircle className="h-4 w-4 text-red-500" />
                  Solicitudes Rechazadas ({rejectedRequests.length})
                </h4>
                <div className="space-y-3">
                  {rejectedRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg bg-red-50/50">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                          {roleLabels[request.role] || request.role}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Rechazado el {format(new Date(request.timestamp), 'dd/MM/yyyy', { locale: es })}
                        </span>
                      </div>
                      <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                        Rechazada
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}