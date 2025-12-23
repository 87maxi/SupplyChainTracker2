"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Settings2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { RoleManager } from '@/components/contract/RoleManager';
import { Button } from '@/components/ui/button';
import {
  Building,
  Shield,
  Users,
  HardDrive,
  Monitor,
  GraduationCap,
  Package,
  CheckCircle
} from 'lucide-react';
import { NetbookStatusChart } from './charts/NetbookStatusChart';
import { UserRolesChart } from './charts/UserRolesChart';
import { useWeb3 } from '@/hooks/useWeb3';
import { useToast } from '@/hooks/use-toast';
import { DashboardSkeleton } from './skeletons/DashboardSkeleton';
import { TransactionConfirmation } from '@/components/contract/TransactionConfirmation';
import { truncateAddress } from '@/lib/utils';
import { ROLES } from '@/lib/constants';
import { getRoleRequests, updateRoleRequestStatus } from '@/services/RoleRequestService';
import { RoleRequest } from '@/types/role-request';
import { grantRole, hasRole } from '@/services/SupplyChainService';
import { getRoleConstant } from '@/lib/api/serverRpc';

// Cache configuration
const CACHE_CONFIG = {
  DASHBOARD_DATA: 'dashboard-data',
  REFRESH_INTERVAL: 30000 // 30 seconds
};

// Dashboard data types
interface DashboardStats {
  fabricanteCount: number;
  auditorHwCount: number;
  tecnicoSwCount: number;
  escuelaCount: number;
  totalFabricadas: number;
  totalHwAprobadas: number;
  totalSwValidadas: number;
  totalDistribuidas: number;
}

interface UserRoleData {
  role: string;
  address: string;
  since: string;
  status: 'active' | 'inactive';
  id?: string;
}

import { cn } from '@/lib/utils';

// Summary Card Component
function SummaryCard({ title, count, description, icon: Icon, color }: { title: string, count: number, description: string, icon: any, color: string }) {
  return (
    <Card className="relative overflow-hidden group">
      <div className={cn("absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity", color)}>
        <Icon className="h-16 w-16" />
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold mb-1">{count}</div>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}

export function DashboardOverview({ initialStats }: { initialStats: DashboardStats }) {
  const { address, isConnected } = useWeb3();
  const { toast } = useToast();
  const [showRoleManager, setShowRoleManager] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [userRoles, setUserRoles] = useState<UserRoleData[]>([]);
  const [pendingRequests, setPendingRequests] = useState<RoleRequest[]>([]);

  const fetchRoleRequests = async () => {
    try {
      const requests = await getRoleRequests();
      setPendingRequests(requests.filter(req => req.status === 'pending'));
    } catch (error) {
      console.error('Error fetching role requests:', error);
    }
  };

  const fetchDashboardData = async (silent = false) => {
    if (!isConnected || !address) return;

    try {
      // Fetch dashboard data from server action
      const response = await fetch('/api/admin/dashboard-stats');
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      
      const newStats = await response.json();
      setStats(newStats);

      if (!silent) {
        toast({
          title: "Datos actualizados",
          description: "El panel de administración se ha actualizado correctamente.",
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (!silent) {
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos del panel.",
          variant: "destructive"
        });
      }
    }
  };

  const refreshAllData = async (silent = false) => {
    if (!isConnected || !address) return;

    if (!silent) setIsLoading(true);

    await Promise.all([
      fetchDashboardData(silent),
      fetchRoleRequests()
    ]);

    setIsLoading(false);
  };

  const [confirmationDialog, setConfirmationDialog] = useState({
    open: false,
    title: '',
    description: '',
    warning: '',
    onConfirm: () => Promise.resolve()
  });

  // Handle role manager completion
  const handleRoleManagerComplete = () => {
    refreshAllData();
    toast({
      title: "Roles actualizados",
      description: "Los roles del sistema se han actualizado correctamente.",
      variant: "default"
    });
  };

  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApproveRequest = async (request: RoleRequest) => {
    try {
      setProcessingId(request.id);
      if (!address) {
        throw new Error("No hay una billetera conectada");
      }

      // Verify if current user is admin using client-side service
      const adminRole = await getRoleConstant('DEFAULT_ADMIN_ROLE');
      const isAdmin = await hasRole(adminRole, address);

      if (!isAdmin) {
        throw new Error("No tienes permisos de administrador (AccessControl)");
      }

      let roleBytes32: string;
      switch (request.role) {
        case 'fabricante': roleBytes32 = ROLES.FABRICANTE.hash; break;
        case 'auditor_hw': roleBytes32 = ROLES.AUDITOR_HW.hash; break;
        case 'tecnico_sw': roleBytes32 = ROLES.TECNICO_SW.hash; break;
        case 'escuela': roleBytes32 = ROLES.ESCUELA.hash; break;
        default: throw new Error('Rol inválido');
      }

      // Use client-side service for granting role
      await grantRole(roleBytes32, request.address, address as `0x${string}`);

      // Optimistic update: Remove request from list immediately
      setPendingRequests(prev => prev.filter(req => req.id !== request.id));

      await updateRoleRequestStatus(request.id, 'approved');

      // Refresh stats
      fetchDashboardData(true);

      toast({
        title: "Solicitud aprobada",
        description: `El rol ${request.role} ha sido asignado a ${truncateAddress(request.address)}`,
      });
    } catch (error: any) {
      console.error('Error approving request:', error);

      let errorMessage = error.message || "No se pudo aprobar la solicitud";
      if (error.message?.includes("AccessControl")) {
        errorMessage = "No tienes permisos de administrador para realizar esta acción.";
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectRequest = async (id: string) => {
    try {
      setProcessingId(id);
      await updateRoleRequestStatus(id, 'rejected');

      // Optimistic update
      setPendingRequests(prev => prev.filter(req => req.id !== id));

      toast({
        title: "Solicitud rechazada",
        description: "La solicitud ha sido rechazada correctamente.",
      });
    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      setProcessingId(null);
    }
  };

  // Refresh data when component mounts or connection changes
  useEffect(() => {
    refreshAllData();

    // Set up periodic refresh
    const interval = setInterval(() => {
      refreshAllData(true);
    }, CACHE_CONFIG.REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [isConnected, address]);

  // Loading state
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Main dashboard content
  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-bold tracking-tight mb-2">Panel de Administración</h2>
          <p className="text-muted-foreground text-lg">Gestión global de la red de suministro y permisos de usuario.</p>
        </div>
        <div className="flex gap-4">
          <Button
            size="lg"
            variant="outline"
            onClick={() => refreshAllData()}
            className="h-12 px-6"
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            Refrescar
          </Button>
          <Button size="lg" variant="gradient" onClick={() => setShowRoleManager(true)} className="h-12 px-8 shadow-lg">
            <Settings2 className="mr-2 h-5 w-5" />
            Gestión de Roles
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          <h3 className="text-2xl font-bold tracking-tight">Estado de las Netbooks</h3>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            title="Fabricadas"
            count={stats.totalFabricadas}
            description="Netbooks en estado inicial."
            icon={HardDrive}
            color="text-blue-400"
          />
          <SummaryCard
            title="HW Aprobado"
            count={stats.totalHwAprobadas}
            description="Hardware auditado correctamente."
            icon={CheckCircle}
            color="text-emerald-400"
          />
          <SummaryCard
            title="SW Validado"
            count={stats.totalSwValidadas}
            description="Software certificado e instalado."
            icon={Monitor}
            color="text-purple-400"
          />
          <SummaryCard
            title="Distribuidas"
            count={stats.totalDistribuidas}
            description="Entregadas a su destino final."
            icon={Package}
            color="text-amber-400"
          />
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          <h3 className="text-2xl font-bold tracking-tight">Roles de los Usuarios</h3>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            title="Fabricantes"
            count={stats.fabricanteCount}
            description="Entidades de producción."
            icon={Building}
            color="text-blue-400"
          />
          <SummaryCard
            title="Auditores HW"
            count={stats.auditorHwCount}
            description="Verificadores de hardware."
            icon={Shield}
            color="text-rose-400"
          />
          <SummaryCard
            title="Técnicos SW"
            count={stats.tecnicoSwCount}
            description="Especialistas en software."
            icon={Monitor}
            color="text-indigo-400"
          />
          <SummaryCard
            title="Escuelas"
            count={stats.escuelaCount}
            description="Instituciones educativas."
            icon={GraduationCap}
            color="text-emerald-400"
          />
        </div>
      </div>

      {pendingRequests.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <h3 className="text-2xl font-bold tracking-tight">Solicitudes de Rol Pendientes</h3>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-muted/50">
                    <tr>
                      <th className="px-6 py-4 font-medium">Usuario</th>
                      <th className="px-6 py-4 font-medium">Rol Solicitado</th>
                      <th className="px-6 py-4 font-medium">Fecha</th>
                      <th className="px-6 py-4 font-medium text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {pendingRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs">
                          {truncateAddress(request.address)}
                        </td>
                        <td className="px-6 py-4 flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {request.role.replace('_', ' ')}
                          </Badge>
                          {request.signature && (
                            <Badge variant="secondary" className="text-[10px] h-5 bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                              Firmada
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {new Date(request.timestamp).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <Button
                            size="sm"
                            variant="gradient"
                            onClick={() => handleApproveRequest(request)}
                            disabled={processingId === request.id}
                          >
                            {processingId === request.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Aprobar'}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectRequest(request.id)}
                            disabled={processingId === request.id}
                          >
                            Rechazar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <NetbookStatusChart data={[
          { status: 'Fabricadas', count: stats.totalFabricadas, fill: 'hsl(var(--chart-1))' },
          { status: 'HW Aprobado', count: stats.totalHwAprobadas, fill: 'hsl(var(--chart-2))' },
          { status: 'SW Validado', count: stats.totalSwValidadas, fill: 'hsl(var(--chart-3))' },
          { status: 'Distribuidas', count: stats.totalDistribuidas, fill: 'hsl(var(--chart-4))' },
        ]} />
        <UserRolesChart data={[
          { role: 'Fabricantes', count: stats.fabricanteCount, fill: 'hsl(var(--chart-1))' },
          { role: 'Auditores HW', count: stats.auditorHwCount, fill: 'hsl(var(--chart-2))' },
          { role: 'Técnicos SW', count: stats.tecnicoSwCount, fill: 'hsl(var(--chart-3))' },
          { role: 'Escuelas', count: stats.escuelaCount, fill: 'hsl(var(--chart-4))' },
        ]} />
      </div>

      <RoleManager
        isOpen={showRoleManager}
        onOpenChange={(open) => setShowRoleManager(open)}
        onComplete={() => {
          setShowRoleManager(false);
          fetchDashboardData();
        }}
      />

      <TransactionConfirmation
        open={confirmationDialog.open}
        onOpenChange={(open) => setConfirmationDialog(prev => ({ ...prev, open }))}
        title={confirmationDialog.title}
        description={confirmationDialog.description}
        warning={confirmationDialog.warning}
        onConfirm={async () => {
          await confirmationDialog.onConfirm();
          setConfirmationDialog(prev => ({ ...prev, open: false }));
        }}
      />
    </div>
  );
}
