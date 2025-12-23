"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useRoleRequests } from '@/hooks/useRoleRequests';
import { useEnhancedRoleRequests } from '@/hooks/useEnhancedRoleRequests';
import { RoleRequest } from '@/types/role-request';

export function AdminActivitySummary() {
  const { requests } = useEnhancedRoleRequests();
  
  // Calculate statistics
  const pendingCount = requests.filter((req: RoleRequest) => req.status === 'pending').length;
  const approvedCount = requests.filter((req: RoleRequest) => req.status === 'approved').length;
  const rejectedCount = requests.filter((req: RoleRequest) => req.status === 'rejected').length;
  const totalToday = requests.filter((req: RoleRequest) => {
    const today = new Date();
    const requestDate = new Date(req.timestamp);
    return requestDate.toDateString() === today.toDateString();
  }).length;

  const stats = [
    {
      title: "Pendientes",
      value: pendingCount,
      description: "Solicitudes esperando aprobación",
      icon: Clock,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10"
    },
    {
      title: "Aprobadas",
      value: approvedCount,
      description: "Solicitudes aprobadas hoy",
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      title: "Rechazadas",
      value: rejectedCount,
      description: "Solicitudes rechazadas",
      icon: XCircle,
      color: "text-red-500",
      bgColor: "bg-red-500/10"
    },
    {
      title: "Total Hoy",
      value: totalToday,
      description: "Solicitudes recibidas hoy",
      icon: Activity,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen de Actividad</CardTitle>
        <CardDescription>
          Actividad reciente en el sistema de gestión de roles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
