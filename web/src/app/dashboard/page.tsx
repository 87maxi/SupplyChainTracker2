"use client";

import { useWeb3 } from '@/hooks/useWeb3';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SupplyChainService } from '@/services/SupplyChainService';
import { useEffect, useState } from 'react';
import { Netbook } from '@/types/contract';

// Reusable Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En fabricación':
        return 'bg-gray-100 text-gray-800';
      case 'Hardware aprobado':
        return 'bg-blue-100 text-blue-800';
      case 'Software validado':
        return 'bg-green-100 text-green-800';
      case 'Entregada':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      {status}
    </span>
  );
}

// Summary Card Component
function SummaryCard({ title, count, description }: { title: string, count: number, description: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{count}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

// Tracking Card Component
function TrackingCard({ netbook }: { netbook: Netbook }) {
  const getStatusText = (state: number) => {
    switch (state) {
      case 0:
        return 'En fabricación';
      case 1:
        return 'Hardware aprobado';
      case 2:
        return 'Software validado';
      case 3:
        return 'Entregada';
      default:
        return 'Desconocido';
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="font-medium">{netbook.serialNumber}</div>
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
        // Get all serial numbers
        const serials = await SupplyChainService.getAllSerialNumbers();
        setSerialNumbers(serials);

        // Get detailed data for each netbook
        const netbookData = await Promise.all(
          serials.map(async (serial) => {
            try {
              const report = await SupplyChainService.getNetbookReport(serial);
              return report;
            } catch (error) {
              console.error(`Error fetching data for ${serial}:`, error);
              return null;
            }
          })
        );

        // Filter out null results
        const validNetbooks = netbookData.filter((netbook): netbook is Netbook => netbook !== null);
        setNetbooks(validNetbooks);

        // Calculate summary counts
        const fabricacion = validNetbooks.filter(n => n.currentState === 0).length;
        const hwAprobado = validNetbooks.filter(n => n.currentState === 1).length;
        const swValidado = validNetbooks.filter(n => n.currentState === 2).length;
        const entregadas = validNetbooks.filter(n => n.currentState === 3).length;

        setSummary({
          fabricacion,
          hwAprobado,
          swValidado,
          entregadas
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
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Inicio</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <p className="text-lg text-center">Por favor, conecta tu wallet para ver el estado de las netbooks.</p>
            <Button onClick={connect}>Conectar Wallet</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Inicio</h1>
      
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-lg">Cargando...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <SummaryCard 
              title="En fabricación" 
              count={summary.fabricacion} 
              description="Netbooks recién fabricadas" 
            />
            <SummaryCard 
              title="Hardware aprobado" 
              count={summary.hwAprobado} 
              description="Netbooks con hardware auditado" 
            />
            <SummaryCard 
              title="Software validado" 
              count={summary.swValidado} 
              description="Netbooks con software validado" 
            />
            <SummaryCard 
              title="Entregadas" 
              count={summary.entregadas} 
              description="Netbooks distribuidas" 
            />
          </div>
          
          {/* Tracking List */}
          <Card>
            <CardHeader>
              <CardTitle>Estado de las Netbooks</CardTitle>
              <CardDescription>Seguimiento del estado actual de todas las netbooks</CardDescription>
            </CardHeader>
            <CardContent>
              {netbooks.length > 0 ? (
                <div className="space-y-2">
                  {netbooks.map((netbook) => (
                    <TrackingCard key={netbook.serialNumber} netbook={netbook} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No hay netbooks registradas aún.
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}