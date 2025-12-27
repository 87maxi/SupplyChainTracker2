'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Check,
  X,
  Search,
  Factory,
  ShieldCheck,
  Monitor,
  GraduationCap,
  Clock,
  Copy,
  CheckCircle2,
  XCircle,
  Filter,
  RefreshCw
} from 'lucide-react';
import { useRoleRequests } from '@/hooks/useRoleRequests';
import { useToast } from '@/hooks/use-toast';
import { RoleRequest } from '@/types/role-request';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export function PendingRoleRequests() {
  const { requests, loading, approveRequest, rejectRequest, reload } = useRoleRequests();
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [recentlyProcessed, setRecentlyProcessed] = useState<Array<RoleRequest & { processedStatus: 'approved' | 'rejected' }>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('ALL');

  // Role configuration
  const roleConfig: Record<string, { label: string, icon: any, color: string, description: string }> = {
    'FABRICANTE': {
      label: 'Fabricante',
      icon: Factory,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      description: 'Registro de dispositivos'
    },
    'AUDITOR_HW': {
      label: 'Auditor HW',
      icon: ShieldCheck,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
      description: 'Auditoría física'
    },
    'TECNICO_SW': {
      label: 'Técnico SW',
      icon: Monitor,
      color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
      description: 'Validación de software'
    },
    'ESCUELA': {
      label: 'Escuela',
      icon: GraduationCap,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      description: 'Asignación a estudiantes'
    }
  };

  // Filter logic
  const pendingRequests = requests.filter(req => {
    const isPending = req.status === 'pending';
    const matchesSearch = req.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'ALL' || req.role === filterRole;
    return isPending && matchesSearch && matchesRole;
  });

  const handleApprove = async (requestId: string, role: string, userAddress: string) => {
    console.log('🖱️ Button Clicked: Approve', { requestId, role, userAddress });
    setProcessingId(requestId);
    const request = requests.find(r => r.id === requestId);

    try {
      console.log('🚀 Calling approveRequest...');
      const success = await approveRequest(requestId, role, userAddress);
      console.log('🏁 approveRequest result:', success);

      if (success) {
        if (request) {
          setRecentlyProcessed(prev => [{ ...request, processedStatus: 'approved' as const }, ...prev].slice(0, 5));
        }
        toast({
          title: "Solicitud Aprobada",
          description: `Se ha asignado el rol ${roleConfig[role]?.label || role} a ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error approving request:", error);
      toast({
        title: "Error",
        description: "No se pudo aprobar la solicitud. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setProcessingId(requestId);
    const request = requests.find(r => r.id === requestId);

    try {
      const success = await rejectRequest(requestId);

      if (success) {
        if (request) {
          setRecentlyProcessed(prev => [{ ...request, processedStatus: 'rejected' as const }, ...prev].slice(0, 5));
        }
        toast({
          title: "Solicitud Rechazada",
          description: "La solicitud ha sido rechazada correctamente.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast({
        title: "Error",
        description: "No se pudo rechazar la solicitud.",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Dirección copiada",
      description: "La dirección se ha copiado al portapapeles",
    });
  };

  const getRoleInfo = (role: string) => {
    return roleConfig[role] || {
      label: role,
      icon: ShieldCheck,
      color: 'text-gray-500 bg-gray-500/10 border-gray-500/20',
      description: 'Rol del sistema'
    };
  };

  if (loading && requests.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 flex justify-center">
          <p className="text-muted-foreground animate-pulse">Cargando solicitudes...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-muted/30 pb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Solicitudes Pendientes</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {pendingRequests.length} {pendingRequests.length === 1 ? 'solicitud requiere' : 'solicitudes requieren'} atención
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="icon"
              onClick={() => reload()}
              disabled={loading}
              title="Actualizar lista"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <div className="relative flex-1 sm:w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar dirección..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-[140px] h-9">
                <div className="flex items-center gap-2">
                  <Filter className="h-3.5 w-3.5" />
                  <SelectValue placeholder="Rol" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                {Object.keys(roleConfig).map(role => (
                  <SelectItem key={role} value={role}>{roleConfig[role].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {pendingRequests.length > 0 ? (
          <div className="divide-y">
            {pendingRequests.map((request) => {
              const roleInfo = getRoleInfo(request.role);
              const RoleIcon = roleInfo.icon;

              return (
                <div key={request.id} className="p-4 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between group">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-2.5 rounded-lg ${roleInfo.color.split(' ')[1]} ${roleInfo.color.split(' ')[0]}`}>
                      <RoleIcon className="h-5 w-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={`${roleInfo.color} font-medium border`}>
                          {roleInfo.label}
                        </Badge>
                        <div className="flex items-center gap-1.5 text-sm font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded border border-transparent group-hover:border-border transition-colors">
                          {request.address.slice(0, 6)}...{request.address.slice(-4)}
                          <button
                            onClick={() => copyToClipboard(request.address)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-foreground"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {roleInfo.description}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground/70">
                        <Clock className="h-3 w-3" />
                        <span>
                          {request.timestamp ? formatDistanceToNow(request.timestamp, { addSuffix: true, locale: es }) : 'Reciente'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto pt-2 sm:pt-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 sm:flex-none text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                      onClick={() => handleReject(request.id)}
                      disabled={processingId !== null}
                    >
                      {processingId === request.id ? (
                        <span className="animate-pulse">...</span>
                      ) : (
                        <>
                          <X className="h-4 w-4 mr-1.5" />
                          Rechazar
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => handleApprove(request.id, request.role, request.address)}
                      disabled={processingId !== null}
                    >
                      {processingId === request.id ? (
                        <span className="animate-pulse">Procesando...</span>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-1.5" />
                          Aprobar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <div className="bg-muted/50 p-4 rounded-full mb-4">
              <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No hay solicitudes pendientes</h3>
            <p className="text-muted-foreground max-w-sm mt-1">
              {searchQuery || filterRole !== 'ALL'
                ? 'No se encontraron solicitudes con los filtros actuales.'
                : 'Todas las solicitudes han sido procesadas. ¡Buen trabajo!'}
            </p>
            {(searchQuery || filterRole !== 'ALL') && (
              <Button
                variant="link"
                onClick={() => { setSearchQuery(''); setFilterRole('ALL'); }}
                className="mt-2"
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        )}

        {recentlyProcessed.length > 0 && (
          <div className="border-t bg-muted/10">
            <div className="p-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Procesados Recientemente
              </h4>
              <div className="space-y-2">
                {recentlyProcessed.map((request) => (
                  <div
                    key={`processed-${request.id}`}
                    className="flex items-center justify-between p-2 rounded-md bg-background border text-sm"
                  >
                    <div className="flex items-center gap-3">
                      {request.processedStatus === 'approved' ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                      <span className="font-mono text-muted-foreground">
                        {request.address.slice(0, 6)}...{request.address.slice(-4)}
                      </span>
                      <Badge variant="secondary" className="text-[10px] h-5">
                        {roleConfig[request.role]?.label || request.role}
                      </Badge>
                    </div>
                    <span className={`text-xs font-medium ${request.processedStatus === 'approved' ? 'text-emerald-600' : 'text-destructive'
                      }`}>
                      {request.processedStatus === 'approved' ? 'Aprobado' : 'Rechazado'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}