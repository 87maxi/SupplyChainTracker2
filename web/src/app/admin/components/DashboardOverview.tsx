"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
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
  CheckCircle,
  Network,
  TrendingUp
} from 'lucide-react';
import { NetbookStatusChart } from './charts/NetbookStatusChart';
import { UserRolesChart } from './charts/UserRolesChart';
import { AnalyticsChart } from './charts/AnalyticsChart';
import { useWeb3 } from '@/hooks/useWeb3';
import { serverRpc } from '@/lib/api/serverRpc';
import { useToast } from '@/hooks/use-toast';
import { DashboardSkeleton } from './skeletons/DashboardSkeleton';
import { TransactionConfirmation } from '@/components/contract/TransactionConfirmation';
import { truncateAddress } from '@/lib/utils';
import { ROLES } from '@/lib/constants';

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
import { Settings2 } from 'lucide-react';

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

// State enum for better type safety
enum State {
  FABRICADA = 0,
  HW_APROBADO = 1,
  SW_VALIDADO = 2,
  DISTRIBUIDA = 3
}

export function DashboardOverview({ stats: initialStats }: { stats: DashboardStats }) {
  const { address, isConnected } = useWeb3();
  const { toast } = useToast();
  const [showRoleManager, setShowRoleManager] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  // In a real app, this would be fetched from the contract
  const [userRoles, setUserRoles] = useState<UserRoleData[]>([]);

  // Fetch actual user roles when component mounts
  useEffect(() => {
    if (isConnected && address) {
      fetchUserRoles();
    }
  }, [isConnected, address]);

  const fetchUserRoles = async () => {
    try {
      // Get role hashes from constants
      const { FABRICANTE, AUDITOR_HW, TECNICO_SW, ESCUELA, ADMIN } = ROLES;

      // Fetch members for each role concurrently
      const [adminMembers, fabricanteMembers, auditorHwMembers, tecnicoSwMembers, escuelaMembers] =
        await Promise.all([
          serverRpc.getRoleMembers(ADMIN.hash),
          serverRpc.getRoleMembers(FABRICANTE.hash),
          serverRpc.getRoleMembers(AUDITOR_HW.hash),
          serverRpc.getRoleMembers(TECNICO_SW.hash),
          serverRpc.getRoleMembers(ESCUELA.hash)
        ]);

      // Transform to UserRoleData format
      const allUserRoles: UserRoleData[] = [];

      // Add admin members
      adminMembers.forEach((address: string, index: number) => {
        allUserRoles.push({
          id: `admin-${index}`,
          address,
          role: 'admin',
          since: new Date().toISOString().split('T')[0],
          status: 'active'
        });
      });

      // Add fabricante members
      fabricanteMembers.forEach((address: string, index: number) => {
        allUserRoles.push({
          id: `fabricante-${index}`,
          address,
          role: 'fabricante',
          since: new Date().toISOString().split('T')[0],
          status: 'active'
        });
      });

      // Add auditor_hw members
      auditorHwMembers.forEach((address: string, index: number) => {
        allUserRoles.push({
          id: `auditor_hw-${index}`,
          address,
          role: 'auditor_hw',
          since: new Date().toISOString().split('T')[0],
          status: 'active'
        });
      });

      // Add tecnico_sw members
      tecnicoSwMembers.forEach((address: string, index: number) => {
        allUserRoles.push({
          id: `tecnico_sw-${index}`,
          address,
          role: 'tecnico_sw',
          since: new Date().toISOString().split('T')[0],
          status: 'active'
        });
      });

      // Add escuela members
      escuelaMembers.forEach((address: string, index: number) => {
        allUserRoles.push({
          id: `escuela-${index}`,
          address,
          role: 'escuela',
          since: new Date().toISOString().split('T')[0],
          status: 'active'
        });
      });

      setUserRoles(allUserRoles);
    } catch (error) {
      console.error('Error fetching user roles:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los roles de usuario.",
        variant: "destructive"
      });
    }
  };
  const [error, setError] = useState<string | null>(null);
  const [confirmationDialog, setConfirmationDialog] = useState({
    open: false,
    title: '',
    description: '',
    warning: '',
    onConfirm: () => Promise.resolve()
  });

  // Move effect inside DashboardOverview to handle client-side revalidation
  useEffect(() => {
    if (isConnected && address) {
      const interval = setInterval(() => {
        fetchDashboardData();
      }, CACHE_CONFIG.REFRESH_INTERVAL);

      return () => clearInterval(interval);
    }
  }, [isConnected, address]);

  // Client-side data refetch for real-time updates
  const fetchDashboardData = async () => {
    if (!isConnected || !address) return;

    try {
      // Fetch all serial numbers
      const serialNumbers = await serverRpc.getAllSerialNumbers();

      // Initialize counters
      const counters = { ...stats };

      // Reset state counters
      counters.totalFabricadas = 0;
      counters.totalHwAprobadas = 0;
      counters.totalSwValidadas = 0;
      counters.totalDistribuidas = 0;

      // Process each netbook state
      for (const serial of serialNumbers) {
        try {
          const state = await serverRpc.getNetbookState(serial);

          // Count by state
          switch (state) {
            case State.FABRICADA:
              counters.totalFabricadas++;
              break;
            case State.HW_APROBADO:
              counters.totalHwAprobadas++;
              break;
            case State.SW_VALIDADO:
              counters.totalSwValidadas++;
              break;
            case State.DISTRIBUIDA:
              counters.totalDistribuidas++;
              break;
          }
        } catch (error) {
          console.error(`Error fetching state for ${serial}:`, error);
        }
      }

      // Update stats
      setStats(counters);

      // Show success toast
      toast({
        title: "Datos actualizados",
        description: "El panel de administración se ha actualizado correctamente.",
        variant: "default"
      });

      // Revalidate cache
      serverRpc.revalidate.all();

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del panel.",
        variant: "destructive"
      });
    }
  };

  // Handle role manager completion
  const handleRoleManagerComplete = () => {
    // Refresh data after role management
    fetchDashboardData();
    toast({
      title: "Roles actualizados",
      description: "Los roles del sistema se han actualizado correctamente.",
      variant: "default"
    });
  };

  // Handle confirmation dialog
  const confirmAction = (title: string, description: string, warning: string, onConfirm: () => Promise<void>) => {
    setConfirmationDialog({
      open: true,
      title,
      description,
      warning,
      onConfirm
    });
  };

  // Refresh data when component mounts or connection changes
  useEffect(() => {
    fetchDashboardData();

    // Set up periodic refresh
    const interval = setInterval(() => {
      fetchDashboardData();
    }, CACHE_CONFIG.REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [isConnected, address]);

  // Loading state
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight">Panel de Administración</h2>
          <Button onClick={() => fetchDashboardData()}>
            Intentar de nuevo
          </Button>
        </div>
      </div>
    );
  }

  // Main dashboard content
  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-bold tracking-tight mb-2">Panel de Administración</h2>
          <p className="text-muted-foreground text-lg">Gestión global de la red de suministro y permisos de usuario.</p>
        </div>
        <Button size="lg" variant="gradient" onClick={() => setShowRoleManager(true)} className="h-12 px-8 shadow-lg">
          <Settings2 className="mr-2 h-5 w-5" />
          Gestión de Roles
        </Button>
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

      <div className="grid gap-6 md:grid-cols-2">
        <NetbookStatusChart />
        <UserRolesChart />
      </div>

      <AnalyticsChart />

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