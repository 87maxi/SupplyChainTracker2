"use client";

import { useWeb3 } from '@/hooks/useWeb3';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import * as SupplyChainService from '@/services/SupplyChainService';
import { useEffect, useState } from 'react';
import { Netbook } from '@/types/contract';

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

// Reusable Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'En fabricación':
        return { variant: 'secondary' as const, icon: Package };
      case 'Hardware aprobado':
        return { variant: 'outline-glow' as const, icon: ShieldCheck };
      case 'Software validado':
        return { variant: 'success' as const, icon: Monitor };
      case 'Entregada':
        return { variant: 'gradient' as any, icon: Truck };
      default:
        return { variant: 'outline' as const, icon: Package };
    }
  };

  const { variant, icon: Icon } = getStatusConfig(status);

  return (
    <Badge variant={variant} className="gap-1.5 px-3 py-1">
      <Icon className="h-3.5 w-3.5" />
      {status}
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
function TrackingCard({ netbook }: { netbook: Netbook }) {
  const getStatusText = (state: number) => {
    switch (state) {
      case 0: return 'En fabricación';
      case 1: return 'Hardware aprobado';
      case 2: return 'Software validado';
      case 3: return 'Entregada';
      default: return 'Desconocido';
    }
  };

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
              Última actualización: {new Date().toLocaleDateString()}
            </div>
          </div>
          <StatusBadge status={getStatusText(netbook.currentState)} />
        </div>
      </CardContent>
    </Card>
  );
}

export default function ManagerDashboard() {
  const { address, isConnected, connect } = useWeb3();
  const [serialNumbers, setSerialNumbers] = useState<string[]>([]);
  const [netbooks, setNetbooks] = useState<Netbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    fabricacion: 0,
    hwAprobado: 0,
    swValidado: 0,
    entregadas: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isConnected) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const serials = await SupplyChainService.getAllSerialNumbers();
        setSerialNumbers(serials);

        const netbookData = await Promise.all(
          serials.map(async (serial) => {
            try {
              const report = await SupplyChainService.getNetbookReport(serial);
              return report as Netbook;
            } catch (error) {
              console.error(`Error fetching data for ${serial}:`, error);
              return null;
            }
          })
        );

        const validNetbooks = netbookData.filter((n): n is Netbook => n !== null);
        setNetbooks(validNetbooks);

        setSummary({
          fabricacion: validNetbooks.filter(n => n.currentState === 0).length,
          hwAprobado: validNetbooks.filter(n => n.currentState === 1).length,
          swValidado: validNetbooks.filter(n => n.currentState === 2).length,
          entregadas: validNetbooks.filter(n => n.currentState === 3).length
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isConnected]);

  if (!isConnected) {
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
              <Button size="lg" variant="gradient" onClick={connect} className="h-12 px-8">
                Conectar Wallet
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Resumen General</h1>
          <p className="text-muted-foreground">Estado actual de la cadena de suministro de netbooks.</p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/10">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-medium">Sistema en línea</span>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="text-lg text-muted-foreground animate-pulse">Sincronizando con la blockchain...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              title="En fabricación"
              count={summary.fabricacion}
              description="Netbooks registradas pendientes de auditoría."
              icon={Package}
              color="text-blue-400"
            />
            <SummaryCard
              title="HW Aprobado"
              count={summary.hwAprobado}
              description="Hardware verificado por auditores."
              icon={ShieldCheck}
              color="text-emerald-400"
            />
            <SummaryCard
              title="SW Validado"
              count={summary.swValidado}
              description="Software instalado y certificado."
              icon={Monitor}
              color="text-purple-400"
            />
            <SummaryCard
              title="Entregadas"
              count={summary.entregadas}
              description="Distribuidas a instituciones finales."
              icon={Truck}
              color="text-amber-400"
            />
          </div>

          {/* Tracking List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <Search className="h-6 w-6 text-primary" />
                Seguimiento Detallado
              </h2>
              <Badge variant="secondary" className="px-3">
                {netbooks.length} Dispositivos
              </Badge>
            </div>

            <div className="grid gap-4">
              {netbooks.length > 0 ? (
                netbooks.map((netbook) => (
                  <TrackingCard key={netbook.serialNumber} netbook={netbook} />
                ))
              ) : (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                    <Package className="h-12 w-12 mb-4 opacity-20" />
                    <p>No se encontraron netbooks registradas en el sistema.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
