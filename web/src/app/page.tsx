"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWeb3 } from "@/hooks/useWeb3";
import { useUserRoles } from "@/hooks/useUserRoles";
import {
  Laptop,
  Shield,
  Users,
  Wrench,
  School,
  FileText,
  BarChart3,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function HomePage() {
  const { isConnected, connectWallet } = useWeb3();
  const { activeRoleNames, isLoading: rolesLoading } = useUserRoles();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    {
      title: "Trazabilidad Completa",
      description:
        "Sigue cada netbook desde la fabricación hasta la asignación final",
      icon: Laptop,
      color: "bg-blue-500",
    },
    {
      title: "Gestión de Roles",
      description:
        "Control de acceso basado en roles para diferentes participantes",
      icon: Shield,
      color: "bg-green-500",
    },
    {
      title: "Auditoría de Hardware",
      description: "Verificación de integridad física de los dispositivos",
      icon: Wrench,
      color: "bg-yellow-500",
    },
    {
      title: "Validación de Software",
      description: "Certificación del software instalado en cada netbook",
      icon: FileText,
      color: "bg-purple-500",
    },
    {
      title: "Asignación Educativa",
      description: "Distribución a escuelas y seguimiento de estudiantes",
      icon: School,
      color: "bg-red-500",
    },
    {
      title: "Reportes y Analytics",
      description: "Visualización de datos y métricas del sistema",
      icon: BarChart3,
      color: "bg-indigo-500",
    },
  ];

  const stats = [
    {
      name: "Netbooks Registradas",
      value: "1,248",
      change: "+12%",
      icon: Laptop,
    },
    { name: "Roles Activos", value: "42", change: "+5%", icon: Users },
    {
      name: "Auditorías Completadas",
      value: "98%",
      change: "+3%",
      icon: CheckCircle,
    },
    {
      name: "Alertas Pendientes",
      value: "3",
      change: "-2",
      icon: AlertTriangle,
    },
  ];

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-lg">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-width-container padding-section">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-responsive-title mb-6">SupplyChainTracker</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
          Sistema descentralizado de trazabilidad para netbooks educativas.
          Sigue cada dispositivo desde la fabricación hasta la asignación final.
        </p>

        {!isConnected ? (
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              className="btn-responsive-lg"
              onClick={() => connectWallet()}
            >
              Conectar Wallet
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="btn-responsive-lg"
              asChild
            >
              <Link href="/dashboard">
                Ver Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="btn-responsive-lg" asChild>
              <Link href="/dashboard">
                Ir al Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="btn-responsive-lg"
              asChild
            >
              <Link href="/tokens">Ver Netbooks</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Stats Section */}
      {isConnected && !rolesLoading && activeRoleNames.length > 0 && (
        <div className="mb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={stat.name}
                  className="h-full transition-all duration-300 hover:shadow-lg"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.name}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.change.startsWith("+") ? (
                        <span className="text-green-500">{stat.change}</span>
                      ) : stat.change.startsWith("-") ? (
                        <span className="text-red-500">{stat.change}</span>
                      ) : (
                        <span>{stat.change}</span>
                      )}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Features Section */}
      <div className="mb-16">
        <h2 className="text-responsive-subtitle text-center mb-12">
          Características Principales
        </h2>
        <div className="card-layout-dashboard-md">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="card-full-height">
                <CardHeader>
                  <div
                    className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/dashboard">
                      Más información
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center py-12">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-responsive-heading">
              ¿Listo para comenzar?
            </CardTitle>
            <CardDescription className="text-lg">
              Conecta tu wallet y empieza a trazar la cadena de suministro de
              netbooks educativas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isConnected ? (
              <Button
                size="lg"
                className="btn-responsive-lg"
                onClick={() => connectWallet()}
              >
                Conectar Wallet
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button size="lg" className="btn-responsive-lg" asChild>
                  <Link href="/dashboard">Ir al Dashboard</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="btn-responsive-lg"
                  asChild
                >
                  <Link href="/tokens/create">Registrar Netbook</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
