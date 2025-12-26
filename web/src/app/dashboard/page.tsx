// web/src/app/dashboard/page.tsx
"use client";

// Importaciones actualizadas
import { useWeb3 } from '@/contexts/Web3Context'; // Usar el contexto correcto
import { useSupplyChainService } from '@/hooks/useSupplyChainService'; // Usar el hook del servicio
import { Netbook, NetbookState } from '@/types/supply-chain-types'; // Usar el tipo correcto
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState, useCallback } from 'react'; // Asegurar useCallback para funciones

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
function StatusBadge({ status }: { status: NetbookState }) { // Tipado de status como NetbookState
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
      {status.replace(/_/g, ' ')} {/* Formatear el texto del estado */}
    </Badge>
  );
}

// Summary Card Component (no necesita cambios directos relacionados con Web3, solo ajustes de tipo)
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
  // El estado ya viene como NetbookState (string) gracias a getNetbookBySerial
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
              Última actualización: {new Date(Number(netbook.distributionTimestamp) * 1000).toLocaleDateString()}
            </div>
          </div>
          <StatusBadge status={netbook.currentState} />
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
  const { isConnected, connectWallet } = useWeb3();
  const { getAllSerialNumbers, getNetbookBySerial } = useSupplyChainService();
  
  // Fallback functions in case the service functions are not implemented
  const fetchAllSerialNumbers = useCallback(async () => {
    console.warn('getAllSerialNumbers is not implemented, using mock data');
    // Return mock data for now
    return ['S12345', 'S67890', 'S11223'];
  }, []);
  
  const fetchNetbookBySerial = useCallback(async (serial: string) => {
    console.warn('getNetbookBySerial is not implemented, using mock data for', serial);
    // Return mock data for now
    return {
      serialNumber: serial,
      batchId: `Batch-${serial.slice(-3)}`,
      initialModelSpecs: 'Model A',
      hwAuditor: '0x742d35Cc6634C0532925a3b8D4C01512D82A2c3d',
      hwIntegrityPassed: true,
      hwReportHash: '0x8f62b5e4d7c3d1e2a5f6b8c9d0e1f2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8',
      swTechnician: '0x2a1d46A2e881C86B6894bC5B6A9Be66D6e1f2a3b',
      osVersion: 'Linux 5.15',
      swValidationPassed: true,
      destinationSchoolHash: '0x3b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0s',
      studentIdHash: '0x4c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f',
      distributionTimestamp: Date.now().toString(),
      currentState: 'DISTRIBUIDA' as const
    };
  }, []);

  const [serialNumbers, setSerialNumbers] = useState<string[]>([]);
  const [netbooks, setNetbooks] = useState<Netbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    FABRICADA: 0,
    HW_APROBADO: 0,
    SW_VALIDADO: 0,
    DISTRIBUIDA: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isConnected) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Use the service function if available, otherwise use mock data
        const serials = getAllSerialNumbers ? await getAllSerialNumbers() : await fetchAllSerialNumbers();
        setSerialNumbers(serials);

        const netbookData = await Promise.all(
          serials.map(async (serial) => {
            try {
              // Use the service function if available, otherwise use mock data
              const report = getNetbookBySerial ? await getNetbookBySerial(serial) : await fetchNetbookBySerial(serial);
              return report;
            } catch (error) {
              console.error(`Error fetching data for ${serial}:`, error);
              return null;
            }
          })
        );

        const validNetbooks = netbookData.filter((n): n is Netbook => n !== null);
        setNetbooks(validNetbooks);

        // Actualizar el resumen usando los estados tipados
        setSummary({
          FABRICADA: validNetbooks.filter(n => n.currentState === "FABRICADA").length,
          HW_APROBADO: validNetbooks.filter(n => n.currentState === "HW_APROBADO").length,
          SW_VALIDADO: validNetbooks.filter(n => n.currentState === "SW_VALIDADO").length,
          DISTRIBUIDA: validNetbooks.filter(n => n.currentState === "DISTRIBUIDA").length
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Podríamos añadir un estado de error para mostrar al usuario
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isConnected, getAllSerialNumbers, getNetbookBySerial]); // Asegurar dependencias del useEffect

  // Show temporary dashboard when not connected
  // Initialize loading state to true for SSR compatibility
  // This ensures server and client render matching content initially
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // This will only run on the client side
    setInitialized(true);
  }, []);

  // Prevent rendering dynamic content until client-side initialization
  if (!initialized) {
    // Return null or minimal placeholder during SSR and initial render
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="text-lg text-muted-foreground animate-pulse">Iniciando aplicación...</p>
        </div>
      </div>
    );
  }

  // Show temporary dashboard when not connected
  if (!isConnected) {
    return <TempDashboard onConnect={connectWallet} />;
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
              count={summary.FABRICADA}
              description="Netbooks registradas pendientes de auditoría."
              icon={Package}
              color="text-blue-400"
            />
            <SummaryCard
              title="HW Aprobado"
              count={summary.HW_APROBADO}
              description="Hardware verificado por auditores."
              icon={ShieldCheck}
              color="text-emerald-400"
            />
            <SummaryCard
              title="SW Validado"
              count={summary.SW_VALIDADO}
              description="Software instalado y certificado."
              icon={Monitor}
              color="text-purple-400"
            />
            <SummaryCard
              title="Entregadas"
              count={summary.DISTRIBUIDA}
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
              {Array.isArray(netbooks) && netbooks.length > 0 ? (
                netbooks.map((netbook) => (
                  <TrackingCard key={netbook.serialNumber || Math.random()} netbook={netbook} />
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
