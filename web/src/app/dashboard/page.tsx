// web/src/app/dashboard/page.tsx
"use client";

// Importaciones actualizadas
import { useWeb3 } from '@/hooks/useWeb3'; // Usar el contexto correcto
import { useSupplyChainService } from '@/hooks/useSupplyChainService'; // Usar el hook del servicio
import { Netbook, NetbookState } from '@/types/supply-chain-types'; // Usar el tipo correcto
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState, useCallback } from 'react'; // Asegurar useCallback para funciones
import { RoleActions } from './components/RoleActions';
import { PendingRoleApprovals } from './components/role-approval/PendingRoleApprovals';

import {
  Package,
  ShieldCheck,
  Monitor,
  Truck,
  Search,
  LayoutDashboard,
  Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import { useUserRoles } from '@/hooks/useUserRoles';
import { HardwareAuditForm } from '@/components/contracts/HardwareAuditForm';
import { SoftwareValidationForm } from '@/components/contracts/SoftwareValidationForm';
import { StudentAssignmentForm } from '@/components/contracts/StudentAssignmentForm';

// Importar componentes de estadísticas y tablas
import { UserStats } from '@/app/dashboard/components/UserStats';
import { NetbookStats } from '@/app/dashboard/components/NetbookStats';
import { UserDataTable } from '@/app/dashboard/components/UserDataTable';
import { NetbookDataTable } from '@/app/dashboard/components/NetbookDataTable';

// Importar hooks para obtener datos de MongoDB
import { useUserStats } from '@/hooks/useUserStats';
import { useNetbookStats } from '@/hooks/useNetbookStats';
import { useProcessedUserAndNetbookData } from '@/hooks/useProcessedUserAndNetbookData';

// Reusable Status Badge Component
function StatusBadge({ status }: { status: NetbookState }) {
  const getStatusConfig = (status: NetbookState) => {
    switch (status) {
      case 'FABRICADA':
        return { variant: 'secondary' as const, icon: Package };
      case 'HW_APROBADO':
        return { variant: 'outline-glow' as const, icon: ShieldCheck };
      case 'SW_VALIDADO':
        return { variant: 'success' as const, icon: Monitor };
      case 'DISTRIBUIDA':
        return { variant: 'gradient' as any, icon: Truck };
      default:
        return { variant: 'outline' as const, icon: Package };
    }
  };

  const { variant, icon: Icon } = getStatusConfig(status);

  return (
    <Badge variant={variant} className="gap-1.5 px-3 py-1">
      <Icon className="h-3.5 w-3.5" />
      {status.replace(/_/g, ' ')}
    </Badge>
  );
}

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

// Tracking Card Component
function TrackingCard({ netbook, onAction }: { netbook: Netbook, onAction?: (action: string, serial: string) => void }) {
  const { isHardwareAuditor, isSoftwareTechnician, isSchool, isAdmin } = useUserRoles();
  
  // Ensure netbook is defined
  if (!netbook) return null;

  return (
    <Card className="hover:bg-white/5 transition-colors border-white/5">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-mono">S/N:</span>
              <span className="font-bold tracking-tight">{netbook.serialNumber}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {netbook.currentState === 'FABRICADA' ? (
                <>Fecha de registro: {netbook.distributionTimestamp ? new Date(Number(netbook.distributionTimestamp) * 1000).toLocaleDateString() : 'N/A'}</>
              ) : (
                <>Última actualización: {Number.isFinite(netbook.distributionTimestamp) ? new Date(Number(netbook.distributionTimestamp) * 1000).toLocaleDateString() : 'N/A'}</>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={netbook.currentState as NetbookState} />
            {onAction && (
              <div className="flex gap-2">
                              {(netbook.currentState === 'FABRICADA') && (isHardwareAuditor || isAdmin) && (
                <Button size="sm" variant="outline" className="h-8 text-xs border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10" onClick={() => onAction('audit', netbook.serialNumber)}>
                  Auditar
                </Button>
              )}
              {(netbook.currentState === 'HW_APROBADO') && (isSoftwareTechnician || isAdmin) && (
                <Button size="sm" variant="outline" className="h-8 text-xs border-purple-500/50 text-purple-400 hover:bg-purple-500/10" onClick={() => onAction('validate', netbook.serialNumber)}>
                  Validar
                </Button>
              )}
              {(netbook.currentState === 'SW_VALIDADO') && (isSchool || isAdmin) && (
                <Button size="sm" variant="outline" className="h-8 text-xs border-amber-500/50 text-amber-400 hover:bg-amber-500/10" onClick={() => onAction('assign', netbook.serialNumber)}>
                  Asignar
                </Button>
              )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Temporary Dashboard for non-connected state
function TempDashboard({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <div className="inline-flex p-4 rounded-full bg-primary/10 text-primary animate-pulse">
          <LayoutDashboard className="h-12 w-12" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Panel de Control</h1>
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-6">
            <p className="text-xl text-muted-foreground text-center max-w-md">
              Conecta tu wallet para acceder al sistema de trazabilidad y gestionar tus netbooks.
            </p>
            <Button size="lg" variant="gradient" onClick={onConnect} className="h-12 px-8">
              Conectar Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ManagerDashboard() {
  // Obtener estadísticas desde MongoDB usando los nuevos endpoints
  const { stats: userStatsData, isLoading: usersLoading } = useUserStats();
  const { stats: netbookStatsData, isLoading: netbooksLoading } = useNetbookStats();
  
  // Obtener datos procesados combinados de usuarios y netbooks
  const { users, netbooks: netbooksTable, isLoading: dataLoading, refetch: fetchDashboardData } = useProcessedUserAndNetbookData();
  
  // Combinar estados de carga
  const isLoading = usersLoading || netbooksLoading || dataLoading;
  
  // Funciones para manejar filtros
  const handleUserFilterChange = (filter: { key: string; value: string }) => {
    console.log('User filter changed:', filter);
  };
  
  const handleNetbookFilterChange = (filter: { key: string; value: string }) => {
    console.log('Netbook filter changed:', filter);
  };
  const { isConnected, connectWallet } = useWeb3();
  const { getAllSerialNumbers, getNetbookState, getNetbookReport } = useSupplyChainService();
  const { isHardwareAuditor, isSoftwareTechnician, isSchool, isAdmin } = useUserRoles();

  // Utilizar los datos cargados desde MongoDB
  // const [netbooks, setNetbooks] = useState<Netbook[]>([]);
  // const [loading, setLoading] = useState(true);
  
  // Utilizar datos de estadísticas desde MongoDB en lugar del conteo directo
  const summary = {
    FABRICADA: netbookStatsData?.production || 0,
    HW_APROBADO: netbookStatsData?.distribution || 0,
    SW_VALIDADO: netbookStatsData?.retail || 0,
    DISTRIBUIDA: netbookStatsData?.sold || 0
  };

  // Utilizar usuarios y netbooks ya definidos anteriormente
  // const { users } = useFetchUsers();
  // const { netbooks } = useProcessedUserAndNetbookData();
  
  // Filtrar tareas pendientes basado en roles
  const pendingTasks = netbooksTable.filter((n: Netbook) => {
    if (!n) return false;
    if ((n.currentState === 'FABRICADA') && (isHardwareAuditor || isAdmin)) return true;
    if ((n.currentState === 'HW_APROBADO') && (isSoftwareTechnician || isAdmin)) return true;
    if ((n.currentState === 'SW_VALIDADO') && (isSchool || isAdmin)) return true;
    return false;
  });

  // Usar los datos de netbookStatsData para las estadísticas
  // y los datos de fetch para las tablas con paginación
  // Establecer netbooksForTable con los datos obtenidos de useFetchNetbooks
  const netbooksForTable = netbooksTable;

  // Form states
  const [selectedSerial, setSelectedSerial] = useState<string>('');
  const [showAuditForm, setShowAuditForm] = useState(false);
  const [showValidationForm, setShowValidationForm] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);

  // Enhanced action handler with debugging
  const handleAction = useCallback((action: string, serial: string) => {
    console.log('Handling action:', { action, serial });
    setSelectedSerial(serial);
    
    switch (action) {
      case 'audit':
        setShowAuditForm(true);
        console.log('Audit form state set to:', true);
        break;
      case 'validate':
        setShowValidationForm(true);
        console.log('Validation form state set to:', true);
        break;
      case 'assign':
        setShowAssignmentForm(true);
        console.log('Assignment form state set to:', true);
        break;
    }
  }, []);



  // El efecto para actualizar datos del dashboard se ha eliminado porque los datos
  // ya vienen del hook useProcessedUserAndNetbookData
  // y se actualizan automáticamente cada 30 segundos

  if (!isConnected) {
    return <TempDashboard onConnect={connectWallet} />;
  }



  return (
    <div className="container mx-auto px-4 py-12 space-y-12 relative">
      <div className="absolute inset-0 bg-gradient-overlay opacity-30 pointer-events-none"></div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Resumen General</h1>
          <p className="text-muted-foreground">Estado actual de la cadena de suministro de netbooks.</p>
        </div>
        <div className="flex items-center gap-3 bg-gradient-subtle p-2 rounded-xl border border-white/10 shadow-lg">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-medium">Sistema en línea</span>
        </div>
      </div>

      <RoleActions />

      {(isHardwareAuditor || isSoftwareTechnician || isSchool || isAdmin) && (
        <PendingRoleApprovals />
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="text-lg text-muted-foreground animate-pulse">Sincronizando con la blockchain...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <SummaryCard title="En fabricación" count={summary.FABRICADA} description="Netbooks registradas pendientes de auditoría." icon={Package} color="text-blue-400" />
            <SummaryCard title="HW Aprobado" count={summary.HW_APROBADO} description="Hardware verificado por auditores." icon={ShieldCheck} color="text-emerald-400" />
            <SummaryCard title="SW Validado" count={summary.SW_VALIDADO} description="Software instalado y certificado." icon={Monitor} color="text-purple-400" />
            <SummaryCard title="Entregadas" count={summary.DISTRIBUIDA} description="Distribuidas a instituciones finales." icon={Truck} color="text-amber-400" />
          </div>

          {/* Pending Tasks Section */}
          {pendingTasks.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                  <ShieldCheck className="h-6 w-6 text-emerald-400" />
                  Tareas Pendientes
                </h2>
                <Badge variant="success" className="px-3">
                  {pendingTasks.length} Acciones requeridas
                </Badge>
              </div>
              <div className="grid gap-4">
                {pendingTasks.map((netbook) => (
                  <TrackingCard key={netbook.serialNumber} netbook={netbook} onAction={handleAction} />
                ))}
              </div>
            </div>
          )}

          {/* Tracking List */}
          {/* Renderizar las tablas con filtros */}
          <div className="grid gap-8 md:grid-cols-2">
            <UserDataTable 
              data={users} 
              onFilterChange={handleUserFilterChange} 
            />
            <NetbookDataTable 
              data={netbooksForTable} 
              onFilterChange={handleNetbookFilterChange} 
            />
          </div>
        </>
      )}

        {/* Forms - Conditional rendering to ensure proper state management */}
  {showAuditForm && (
    <HardwareAuditForm
      isOpen={showAuditForm}
      onOpenChange={setShowAuditForm}
      onComplete={() => {
        console.log('Audit form completed, refetching data');
        fetchDashboardData();
        // Reset form state
        setSelectedSerial('');
        setShowAuditForm(false);
      }}
      initialSerial={selectedSerial}
    />
  )}
  {showValidationForm && (
    <SoftwareValidationForm
      isOpen={showValidationForm}
      onOpenChange={setShowValidationForm}
      onComplete={() => {
        console.log('Validation form completed, refetching data');
        fetchDashboardData();
        // Reset form state
        setSelectedSerial('');
        setShowValidationForm(false);
      }}
      initialSerial={selectedSerial}
    />
  )}
  {showAssignmentForm && (
    <StudentAssignmentForm
      isOpen={showAssignmentForm}
      onOpenChange={setShowAssignmentForm}
      onComplete={() => {
        console.log('Assignment form completed, refetching data');
        fetchDashboardData();
        // Reset form state
        setSelectedSerial('');
        setShowAssignmentForm(false);
      }}
      initialSerial={selectedSerial}
    />
  )}
    </div>
  );
}
