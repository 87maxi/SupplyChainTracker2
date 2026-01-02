"use client";

import { useState, useEffect } from "react";
import { useWeb3 } from "@/hooks/useWeb3";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useSupplyChainService } from "@/hooks/useSupplyChainService";
import { useRoleRequests } from "@/hooks/useRoleRequests";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Laptop,
  Users,
  Shield,
  Wrench,
  FileText,
  School,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight,
  Plus,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { NetbookStats } from "./components/NetbookStats";
import { UserStats } from "./components/UserStats";
import { RoleActions } from "./components/RoleActions";
import { PendingRoleApprovals } from "./components/role-approval/PendingRoleApprovals";
import { NetbookDataTable } from "./components/NetbookDataTable";
import { UserDataTable } from "./components/UserDataTable";
import { ProgressStepper } from "@/components/dashboard/ProgressStepper";

export default function DashboardPage() {
  const { isConnected, address } = useWeb3();
  const { activeRoleNames, isLoading: rolesLoading, hasRole } = useUserRoles();
  const { getAllSerialNumbers } = useSupplyChainService();
  const { requests } = useRoleRequests();

  const [serialNumbers, setSerialNumbers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSerialNumbers = async () => {
      if (!isConnected || !address) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const serials = await getAllSerialNumbers();
        setSerialNumbers(serials || []);
      } catch (err) {
        console.error("Error fetching serial numbers:", err);
        setError("Failed to load netbooks");
      } finally {
        setLoading(false);
      }
    };

    fetchSerialNumbers();
  }, [isConnected, address, getAllSerialNumbers]);

  // Filter pending requests for current user (if admin)
  const pendingRequests = hasRole("DEFAULT_ADMIN_ROLE")
    ? requests.filter((req) => req.status === "pending")
    : [];

  const userHasRoles = activeRoleNames.length > 0;
  const isAdmin = hasRole("DEFAULT_ADMIN_ROLE");

  if (!isConnected) {
    return (
      <div className="max-width-container padding-section">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Acceso Restringido</CardTitle>
            <CardDescription>
              Por favor, conecta tu wallet para acceder al dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-6">
                Necesitas conectar tu wallet para ver el contenido del dashboard
              </p>
              <Button asChild>
                <Link href="/">Volver al Inicio</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Bienvenido al panel de control de SupplyChainTracker
        </p>
      </div>

      {/* Role-based quick actions */}
      {userHasRoles && (
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-6">
            {activeRoleNames.map((role) => (
              <Badge
                key={role}
                variant="secondary"
                className="px-3 py-1.5 text-sm"
              >
                {role.replace(/_ROLE$/, "").replace(/_/g, " ")}
              </Badge>
            ))}
          </div>

          <RoleActions />
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <NetbookStats />
        <UserStats />
      </div>

      {/* Pending Approvals for Admins */}
      {isAdmin && pendingRequests.length > 0 && (
        <div className="mb-8">
          <Card className="transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                Solicitudes Pendientes
              </CardTitle>
              <CardDescription>
                Tienes {pendingRequests.length} solicitud(es) de rol
                pendiente(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PendingRoleApprovals requests={pendingRequests} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Netbooks Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-responsive-heading">Netbooks</h2>
            <p className="text-muted-foreground mt-1">
              {serialNumbers.length} dispositivo(s) registrado(s)
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild size="sm">
              <Link href="/tokens/create">
                <Plus className="h-4 w-4 mr-2" />
                Registrar
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/tokens">
                <Eye className="h-4 w-4 mr-2" />
                Ver Todos
              </Link>
            </Button>
          </div>
        </div>

        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
                <p className="text-muted-foreground">Cargando netbooks...</p>
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Error al cargar</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  Reintentar
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <NetbookDataTable
            serialNumbers={serialNumbers}
            onFilterChange={() => {}}
          />
        )}
      </div>

      {/* Users Section for Admins */}
      {isAdmin && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-responsive-heading">Usuarios</h2>
              <p className="text-muted-foreground mt-1">
                Gestión de usuarios y roles del sistema
              </p>
            </div>
            <Button asChild size="sm">
              <Link href="/admin/users">
                <Eye className="h-4 w-4 mr-2" />
                Ver Todos
              </Link>
            </Button>
          </div>

          <UserDataTable data={[]} onFilterChange={() => {}} />
        </div>
      )}

      {/* Getting Started Guide for New Users */}
      {!userHasRoles && (
        <Card>
          <CardHeader>
            <CardTitle>Comenzando</CardTitle>
            <CardDescription>
              Solicita un rol para comenzar a usar el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <ProgressStepper
                steps={[
                  { id: "connect", title: "Conectar Wallet", completed: true },
                  { id: "request", title: "Solicitar Rol", completed: false },
                  {
                    id: "approve",
                    title: "Esperar Aprobación",
                    completed: false,
                  },
                  { id: "use", title: "Comenzar a Usar", completed: false },
                ]}
                currentStep="request"
              />

              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">
                  Aún no tienes roles asignados. Solicita acceso para comenzar.
                </p>
                <Button asChild>
                  <Link href="/profile">
                    Solicitar Rol
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
