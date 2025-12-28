// web/src/app/admin/page.tsx
"use client";

import { useWeb3 } from '@/contexts/Web3Context';
import { useSupplyChainService } from '@/hooks/useSupplyChainService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ShieldAlert, Users, Factory, Monitor, GraduationCap, Gavel, ArrowRight, ShieldCheck, Clock, RefreshCw } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AllRolesSummary } from '@/types/supply-chain-types';
import { cn } from '@/lib/utils';
import PendingRoleRequests from './components/PendingRoleRequests';
import { ActivityLogs } from '@/components/admin/activity-logs';
import { DashboardMetrics } from './components/DashboardMetrics';
import { RoleManagementSection } from './components/RoleManagementSection';
import { ApprovedAccountsList } from './components/ApprovedAccountsList';
import { NetbookStateMetrics } from './components/NetbookStateMetrics';
import { SystemHealth } from './components/SystemHealth';
import { useRoleRequests } from '@/hooks/useRoleRequests';
import { getActivityLogs } from '@/lib/activity-logger';
import { getLogStats } from '@/lib/activity-logger';
import { NEXT_PUBLIC_ADMIN_ADDRESS, NEXT_PUBLIC_DEFAULT_ADMIN_ADDRESS } from '@/lib/env';

export default function AdminPage() {
  const { address, isConnected, connectWallet } = useWeb3();
  const { hasRole, getAllRolesSummary } = useSupplyChainService();
  const { toast } = useToast();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [rolesSummary, setRolesSummary] = useState<AllRolesSummary | null>(() => {
    // Initial load from localStorage for instant UI
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('supply_chain_roles_summary');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          // Handle new format { data, timestamp }
          return parsed.data || parsed;
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  });

  const { requests } = useRoleRequests();
  const pendingRequestsCount = requests.filter(req => req.status === 'pending').length;
  const [logs, setLogs] = useState(getActivityLogs());
  const [activityStats, setActivityStats] = useState(getLogStats(logs));

  const fetchAdminData = useCallback(async () => {
    if (!isConnected || !address) {
      setLoading(false);
      setIsAdmin(false);
      return;
    }

    try {
      // 1. Check if user has the admin role in the contract
      let userIsAdmin = await hasRole("DEFAULT_ADMIN_ROLE", address);

      // 2. Fallback: Check if the address matches the configured admin addresses (useful for development)
      if (!userIsAdmin) {
        const adminAddress = NEXT_PUBLIC_ADMIN_ADDRESS || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
        const defaultAdminAddress = NEXT_PUBLIC_DEFAULT_ADMIN_ADDRESS || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';

        console.log(`[AdminPage] Checking fallback for connected address: "${address}"`);
        console.log(`[AdminPage] Comparing against adminAddress: "${adminAddress}"`);
        console.log(`[AdminPage] Comparing against defaultAdminAddress: "${defaultAdminAddress}"`);

        const isMatch = address.toLowerCase() === adminAddress.toLowerCase() ||
          address.toLowerCase() === defaultAdminAddress.toLowerCase();

        console.log(`[AdminPage] Fallback match result: ${isMatch}`);

        if (isMatch) {
          console.log('[AdminPage] Admin detected via fallback address check');
          userIsAdmin = true;
        }
      }

      console.log(`[AdminPage] Role check for ${address}: isAdmin=${userIsAdmin}`);
      setIsAdmin(userIsAdmin);

      if (userIsAdmin) {
        const summary = await getAllRolesSummary();
        setRolesSummary(summary);
        // Save to localStorage for persistence
        localStorage.setItem('supply_chain_roles_summary', JSON.stringify({
          data: summary,
          timestamp: Date.now()
        }));
      } else {
        setRolesSummary(null);
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

  // Listen for role updates to refresh summary
  useEffect(() => {
    const { eventBus, EVENTS } = require('@/lib/events');
    const unsubscribe = eventBus.on(EVENTS.ROLE_UPDATED, () => {
      console.log('[AdminPage] Role update detected, refreshing data...');
      fetchAdminData();
    });
    return () => unsubscribe();
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

  if (loading && !rolesSummary) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="text-lg text-muted-foreground animate-pulse">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin && !loading) {
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
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const { eventBus, EVENTS } = require('@/lib/events');
              eventBus.emit(EVENTS.REFRESH_DATA || 'REFRESH_DATA');
              fetchAdminData();
              toast({
                title: "Actualizando datos",
                description: "Se ha solicitado la actualización de todos los componentes.",
              });
            }}
            className="h-10 px-4 border-white/10 hover:bg-white/5"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refrescar Todo
          </Button>
          <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/10">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-medium">Administrador Conectado</span>
          </div>
        </div>
      </div>

      <SystemHealth />

      <DashboardMetrics
        rolesSummary={rolesSummary}
        pendingRequestsCount={pendingRequestsCount}
        logs={logs}
        loading={loading && !rolesSummary}
      />

      {/* Estado de Netbooks por Etapa */}
      <NetbookStateMetrics />

      <RoleManagementSection />

      <ApprovedAccountsList />

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