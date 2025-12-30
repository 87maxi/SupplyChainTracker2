"use client";

import { useWeb3 } from '@/hooks/useWeb3';
import { useSupplyChainService } from '@/hooks/useSupplyChainService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Factory, ShieldCheck, Gavel } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AllRolesSummary } from '@/types/supply-chain-types';
import { AnalyticsChart } from './components/AnalyticsChart';
import { DateRangeSelector } from './components/DateRangeSelector';

/**
 * Página de Analytics & Reporting para administradores
 * 
 * Muestra métricas de roles, gráficos de participación
 * y herramientas para análisis de la red de participantes.
 */
export default function AnalyticsPage() {
  const { address, isConnected, connectWallet } = useWeb3();
  const { hasRole, getAllRolesSummary } = useSupplyChainService();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [rolesSummary, setRolesSummary] = useState<AllRolesSummary | null>(null);

  // Transform roles summary data into analytics chart format
  const getAnalyticsData = (summary: AllRolesSummary | null): Array<{date: string, fabricadas: number, distribuidas: number}> => {
    if (!summary) return [];
    
    // Extract counts for fabricantes and escuelas
    const fabricantesCount = summary.FABRICANTE_ROLE?.count || 0;
    const escuelasCount = summary.ESCUELA_ROLE?.count || 0;
    
    // Create a simple time series with the current month
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'short', year: '2-digit' });
    
    // Return mock data using the role counts as proxies for fabricated and distributed count
    return [
      { date: currentMonth, fabricadas: fabricantesCount * 50, distribuidas: escuelasCount * 25 }
    ];
  };

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!isConnected || !address) {
        setLoading(false);
        setIsAdmin(false);
        return;
      }

      try {
        setLoading(true);
        
        // Verificar rol de administrador
        const userIsAdmin = await hasRole("DEFAULT_ADMIN_ROLE", address);
        setIsAdmin(userIsAdmin);
        
        if (userIsAdmin) {
          const summary = await getAllRolesSummary();
          setRolesSummary(summary);
        }
      } catch (error: any) {
        console.error('Error fetching analytics data:', error);
        toast({
          title: "Error de carga",
          description: `No se pudieron cargar los datos: ${error.message}`,
          variant: "destructive",
        });
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [isConnected, address, hasRole, getAllRolesSummary, toast]);

  // Renderizado según estado
  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-6">
            <h3 className="text-xl font-medium text-foreground mb-2">Acceso Restringido</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Por favor, conecta tu wallet para acceder al panel de análisis.
            </p>
            <Button 
              size="lg" 
              onClick={() => connectWallet()} 
              className="h-12 px-8"
            >
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-lg text-muted-foreground">Cargando análisis...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-6">
            <div className="h-12 w-12 text-red-500/50 mb-4 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-red-500 mb-2">Acceso Denegado</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              No tienes permisos de administrador para acceder a esta página.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Renderizado principal
  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Analytics & Reporting</h1>
          <p className="text-muted-foreground">Visualiza el estado del sistema y el crecimiento de la red de participantes.</p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/10">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-medium">Administrador Conectado</span>
        </div>
      </div>

      {/* Selectores de rango de fechas */}
      <DateRangeSelector />

      {/* Metrics Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rolesSummary 
                ? Object.values(rolesSummary).reduce((sum, role) => sum + (role?.count || 0), 0)
                : 0
              }
            </div>
            <p className="text-xs text-muted-foreground">Todos los roles combinados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <div className="h-4 w-4 text-red-500 flex items-center justify-center">
              <Gavel className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rolesSummary?.DEFAULT_ADMIN_ROLE?.count || 0}</div>
            <p className="text-xs text-muted-foreground">Usuarios con acceso máximo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fabricantes</CardTitle>
            <div className="h-4 w-4 text-blue-500 flex items-center justify-center">
              <Factory className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rolesSummary?.FABRICANTE_ROLE?.count || 0}</div>
            <p className="text-xs text-muted-foreground">Instalaciones registradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auditores HW</CardTitle>
            <div className="h-4 w-4 text-green-500 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rolesSummary?.AUDITOR_HARDWARE_ROLE?.count || 0}</div>
            <p className="text-xs text-muted-foreground">Verificación de dispositivos</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de análisis general */}
      <AnalyticsChart data={getAnalyticsData(rolesSummary)} />

    </div>
  );
}
