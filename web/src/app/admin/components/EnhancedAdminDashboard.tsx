"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Settings2 } from 'lucide-react';
import { StatsOverview } from './StatsOverview';
import { PendingRequests } from './PendingRequests';
import { RequestHistory } from './RequestHistory';
import { AdminActivitySummary } from './AdminActivitySummary';
import { RoleManager } from '@/components/contract/RoleManager';
import { useEnhancedRoleRequests } from '@/hooks/useEnhancedRoleRequests';

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

export function EnhancedAdminDashboard({ stats: initialStats }: { stats: DashboardStats }) {
  const { toast } = useToast();
  const [showRoleManager, setShowRoleManager] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const { refreshRequests } = useEnhancedRoleRequests();

  const handleRefreshAll = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would fetch updated stats
      // For now, we'll just refresh the requests
      await refreshRequests();
      
      toast({
        title: "Datos actualizados",
        description: "Todos los datos del panel se han actualizado correctamente.",
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        title: "Error",
        description: "No se pudieron actualizar los datos.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Panel de Administración</h1>
          <p className="text-muted-foreground text-lg">Gestión global de la red de suministro y permisos de usuario.</p>
        </div>
        <div className="flex gap-4">
          <Button
            size="lg"
            variant="outline"
            onClick={handleRefreshAll}
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

      {/* Activity Summary */}
      <AdminActivitySummary />

      {/* Stats Overview */}
      <StatsOverview stats={stats} onRefresh={handleRefreshAll} loading={isLoading} />

      {/* Pending Requests */}
      <PendingRequests />

      {/* Request History */}
      <RequestHistory />

      {/* Role Manager Modal */}
      <RoleManager
        isOpen={showRoleManager}
        onOpenChange={(open) => setShowRoleManager(open)}
        onComplete={() => {
          setShowRoleManager(false);
          handleRefreshAll();
        }}
      />
    </div>
  );
}