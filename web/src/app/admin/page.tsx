// web/src/app/admin/page.tsx
"use client";

import { useWeb3 } from '@/contexts/Web3Context';
import { useSupplyChainService } from '@/hooks/useSupplyChainService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ShieldAlert, Users, Factory, Monitor, GraduationCap, Gavel, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AllRolesSummary } from '@/types/supply-chain-types';
import { cn } from '@/lib/utils';
import { PendingRoleRequests } from './components/PendingRoleRequests';
import { ActivityLogs } from '@/components/admin/activity-logs';
import { DashboardMetrics } from './components/DashboardMetrics';
import { RoleManagementSection } from './components/RoleManagementSection';
import { getActivityLogs } from '@/lib/activity-logger';
import { getLogStats } from '@/lib/activity-logger';

export default function AdminPage() {
  const { address, isConnected, connectWallet } = useWeb3();
  const { hasRole, getAllRolesSummary } = useSupplyChainService();
  const { toast } = useToast();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [rolesSummary, setRolesSummary] = useState<AllRolesSummary | null>(null);
  const [logs, setLogs] = useState(getActivityLogs());
  const [activityStats, setActivityStats] = useState(getLogStats(logs));

  const fetchAdminData = useCallback(async () => {
    if (!isConnected || !address) {
      setLoading(false);
      setIsAdmin(false);
      return;
    }

    setLoading(true);
    try {
      const userIsAdmin = await hasRole("DEFAULT_ADMIN_ROLE", address);
      setIsAdmin(userIsAdmin);

      if (userIsAdmin) {
        const summary = await getAllRolesSummary();
        setRolesSummary(summary);
      }
    } catch (err: any) {
      console.error('Error fetching admin data:', err);
      toast({
        title: "Error de carga",
        description: `No se pudieron cargar los datos de administración: ${err.message}`,
        variant: "destructive",
      });
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }, [isConnected, address, hasRole, getAllRolesSummary, toast]);

  // Actualizar logs cuando cambien
  useEffect(() => {
    const updatedLogs = getActivityLogs();
    setLogs(updatedLogs);
    setActivityStats(getLogStats(updatedLogs));
  }, [isConnected, address]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-6">
            <h3 className="text-xl font-medium text-foreground mb-2">Acceso Restringido</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Por favor, conecta tu wallet para acceder al panel de administración.
            </p>
            <Button size="lg" variant="gradient" onClick={() => connectWallet()} className="h-12 px-8">
              Conectar Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="text-lg text-muted-foreground animate-pulse">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-6">
            <ShieldAlert className="h-12 w-12 text-red-500/50 mb-4" />
            <h3 className="text-xl font-medium text-red-500 mb-2">Acceso Denegado</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              No tienes permisos de administrador para acceder a esta página.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Panel de Administración</h1>
          <p className="text-muted-foreground">Gestiona los roles y el acceso de los usuarios en la cadena de suministro.</p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/10">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-medium">Administrador Conectado</span>
        </div>
      </div>

      <DashboardMetrics 
        rolesSummary={rolesSummary}
        pendingRequestsCount={0} 
        recentActivity={undefined}
        loading={loading}
      />

      <RoleManagementSection />
      
      {/* Sección de Solicitudes Pendientes */}
      <div id="pending-requests" className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">Solicitudes de Rol Pendientes</h2>
            <p className="text-muted-foreground">Revisa y gestiona las solicitudes de acceso al sistema.</p>
          </div>
        </div>
        <PendingRoleRequests />
      </div>

      {/* Sección de Registro de Actividad */}
      <div id="activity-logs" className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">
              Registro de Actividad del Sistema
            </h2>
            <p className="text-muted-foreground">
              Monitoreo completo de todas las acciones y eventos.
            </p>
          </div>
        </div>
        <ActivityLogs logs={logs} />
      </div>
    </div>
  );
}