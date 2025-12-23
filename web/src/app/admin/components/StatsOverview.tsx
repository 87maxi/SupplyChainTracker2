"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users, HardDrive, CheckCircle, Monitor, Package } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface StatsOverviewProps {
  stats: {
    fabricanteCount: number;
    auditorHwCount: number;
    tecnicoSwCount: number;
    escuelaCount: number;
    totalFabricadas: number;
    totalHwAprobadas: number;
    totalSwValidadas: number;
    totalDistribuidas: number;
  };
  onRefresh: () => void;
  loading: boolean;
}

const roleStats = [
  {
    title: "Fabricantes",
    count: 0,
    description: "Entidades de producción",
    icon: HardDrive,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10"
  },
  {
    title: "Auditores HW",
    count: 0,
    description: "Verificadores de hardware",
    icon: CheckCircle,
    color: "text-green-500",
    bgColor: "bg-green-500/10"
  },
  {
    title: "Técnicos SW",
    count: 0,
    description: "Especialistas en software",
    icon: Monitor,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10"
  },
  {
    title: "Escuelas",
    count: 0,
    description: "Instituciones educativas",
    icon: Users,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10"
  }
];

const netbookStats = [
  {
    title: "Fabricadas",
    count: 0,
    description: "Netbooks en estado inicial",
    icon: HardDrive,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10"
  },
  {
    title: "HW Aprobado",
    count: 0,
    description: "Hardware auditado correctamente",
    icon: CheckCircle,
    color: "text-green-500",
    bgColor: "bg-green-500/10"
  },
  {
    title: "SW Validado",
    count: 0,
    description: "Software certificado e instalado",
    icon: Monitor,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10"
  },
  {
    title: "Distribuidas",
    count: 0,
    description: "Entregadas a su destino final",
    icon: Package,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10"
  }
];

export function StatsOverview({ stats, onRefresh, loading }: StatsOverviewProps) {
  const { toast } = useToast();
  
  // Update role stats with actual data
  const updatedRoleStats = roleStats.map((stat, index) => {
    const counts = [
      stats.fabricanteCount,
      stats.auditorHwCount,
      stats.tecnicoSwCount,
      stats.escuelaCount
    ];
    return {
      ...stat,
      count: counts[index]
    };
  });
  
  // Update netbook stats with actual data
  const updatedNetbookStats = netbookStats.map((stat, index) => {
    const counts = [
      stats.totalFabricadas,
      stats.totalHwAprobadas,
      stats.totalSwValidadas,
      stats.totalDistribuidas
    ];
    return {
      ...stat,
      count: counts[index]
    };
  });

  return (
    <div className="space-y-8">
      {/* Header with refresh button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Resumen del Sistema</h2>
          <p className="text-muted-foreground">
            Estado actual de usuarios y netbooks en la plataforma
          </p>
        </div>
        <Button 
          onClick={onRefresh}
          disabled={loading}
          variant="outline"
          className="h-10 px-4"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Actualizando...' : 'Actualizar'}
        </Button>
      </div>

      {/* User Roles Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold">Roles de Usuarios</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {updatedRoleStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <div className={`p-2 rounded-full ${stat.bgColor}`}>
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-1">{stat.count}</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Netbook Status Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold">Estado de Netbooks</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {updatedNetbookStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <div className={`p-2 rounded-full ${stat.bgColor}`}>
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-1">{stat.count}</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}