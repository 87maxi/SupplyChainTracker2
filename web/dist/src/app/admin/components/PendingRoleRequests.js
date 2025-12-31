"use strict";
"use client";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PendingRoleRequests;
const card_1 = require("@/components/ui/card");
const badge_1 = require("@/components/ui/badge");
const lucide_react_1 = require("lucide-react");
const react_1 = require("react");
const button_1 = require("@/components/ui/button");
const lucide_react_2 = require("lucide-react");
const NetbookStatusChart_1 = require("@/components/charts/NetbookStatusChart");
const UserRolesChart_1 = require("@/components/charts/UserRolesChart");
const useWeb3_1 = require("@/hooks/useWeb3");
const serverRpc_1 = require("@/lib/api/serverRpc");
const use_toast_1 = require("@/hooks/use-toast");
const skeleton_1 = require("@/components/ui/skeleton");
const TransactionConfirmation_1 = require("@/components/contracts/TransactionConfirmation");
const utils_1 = require("@/lib/utils");
const roleUtils_1 = require("@/lib/roleUtils");
const useRoleRequests_1 = require("@/hooks/useRoleRequests");
// Cache configuration
const CACHE_CONFIG = {
    DASHBOARD_DATA: 'dashboard-data',
    REFRESH_INTERVAL: 30000 // 30 seconds
};
const utils_2 = require("@/lib/utils");
// Summary Card Component
function SummaryCard({ title, count, description, icon: Icon, color }) {
    return (<card_1.Card className="relative overflow-hidden group">
      <div className={(0, utils_2.cn)("absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity", color)}>
        <Icon className="h-16 w-16"/>
      </div>
      <card_1.CardHeader className="pb-2">
        <card_1.CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent>
        <div className="text-4xl font-bold mb-1">{count}</div>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </card_1.CardContent>
    </card_1.Card>);
}
// State enum for better type safety
var State;
(function (State) {
    State[State["FABRICADA"] = 0] = "FABRICADA";
    State[State["HW_APROBADO"] = 1] = "HW_APROBADO";
    State[State["SW_VALIDADO"] = 2] = "SW_VALIDADO";
    State[State["DISTRIBUIDA"] = 3] = "DISTRIBUIDA";
})(State || (State = {}));
function PendingRoleRequests({ stats: initialStats }) {
    const { address, isConnected } = (0, useWeb3_1.useWeb3)();
    const { toast } = (0, use_toast_1.useToast)();
    const { requests: pendingRequests, approveMutation, rejectMutation } = (0, useRoleRequests_1.useRoleRequests)();
    const [showRoleManager, setShowRoleManager] = (0, react_1.useState)(false);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [stats, setStats] = (0, react_1.useState)(initialStats || {
        fabricanteCount: 0,
        auditorHwCount: 0,
        tecnicoSwCount: 0,
        escuelaCount: 0,
        totalFabricadas: 0,
        totalHwAprobadas: 0,
        totalSwValidadas: 0,
        totalDistribuidas: 0
    });
    // In a real app, this would be fetched from the contract
    const [userRoles, setUserRoles] = (0, react_1.useState)([]);
    // Removed redundant fetchRoleRequests as we use useRoleRequests hook now
    const fetchUserRoles = () => __awaiter(this, void 0, void 0, function* () {
        try {
            const roleHashes = yield (0, roleUtils_1.getRoleHashes)();
            const [adminMembers, fabricanteMembers, auditorHwMembers, tecnicoSwMembers, escuelaMembers] = yield Promise.all([
                (0, serverRpc_1.getRoleMembers)(roleHashes.ADMIN).catch(() => []),
                (0, serverRpc_1.getRoleMembers)(roleHashes.FABRICANTE).catch(() => []),
                (0, serverRpc_1.getRoleMembers)(roleHashes.AUDITOR_HW).catch(() => []),
                (0, serverRpc_1.getRoleMembers)(roleHashes.TECNICO_SW).catch(() => []),
                (0, serverRpc_1.getRoleMembers)(roleHashes.ESCUELA).catch(() => [])
            ]);
            const allUserRoles = [];
            adminMembers.forEach((address, index) => {
                allUserRoles.push({
                    id: `admin-${index}`,
                    address,
                    role: 'admin',
                    since: new Date().toISOString().split('T')[0],
                    status: 'active'
                });
            });
            fabricanteMembers.forEach((address, index) => {
                allUserRoles.push({
                    id: `fabricante-${index}`,
                    address,
                    role: 'fabricante',
                    since: new Date().toISOString().split('T')[0],
                    status: 'active'
                });
            });
            auditorHwMembers.forEach((address, index) => {
                allUserRoles.push({
                    id: `auditor_hw-${index}`,
                    address,
                    role: 'auditor_hw',
                    since: new Date().toISOString().split('T')[0],
                    status: 'active'
                });
            });
            tecnicoSwMembers.forEach((address, index) => {
                allUserRoles.push({
                    id: `tecnico_sw-${index}`,
                    address,
                    role: 'tecnico_sw',
                    since: new Date().toISOString().split('T')[0],
                    status: 'active'
                });
            });
            escuelaMembers.forEach((address, index) => {
                allUserRoles.push({
                    id: `escuela-${index}`,
                    address,
                    role: 'escuela',
                    since: new Date().toISOString().split('T')[0],
                    status: 'active'
                });
            });
            setUserRoles(allUserRoles);
        }
        catch (error) {
            console.error('Error fetching user roles:', error);
        }
    });
    const fetchDashboardData = (...args_1) => __awaiter(this, [...args_1], void 0, function* (silent = false) {
        if (!isConnected || !address)
            return;
        try {
            // Get role hashes from the contract
            const roleHashes = yield (0, roleUtils_1.getRoleHashes)();
            const [fabricanteCount, auditorHwCount, tecnicoSwCount, escuelaCount, fabricadas, hwAprobadas, swValidadas, distribuidas] = yield Promise.all([
                (0, serverRpc_1.getRoleMemberCount)(roleHashes.FABRICANTE).catch(() => 0),
                (0, serverRpc_1.getRoleMemberCount)(roleHashes.AUDITOR_HW).catch(() => 0),
                (0, serverRpc_1.getRoleMemberCount)(roleHashes.TECNICO_SW).catch(() => 0),
                (0, serverRpc_1.getRoleMemberCount)(roleHashes.ESCUELA).catch(() => 0),
                (0, serverRpc_1.getNetbooksByState)(State.FABRICADA).catch(() => []),
                (0, serverRpc_1.getNetbooksByState)(State.HW_APROBADO).catch(() => []),
                (0, serverRpc_1.getNetbooksByState)(State.SW_VALIDADO).catch(() => []),
                (0, serverRpc_1.getNetbooksByState)(State.DISTRIBUIDA).catch(() => [])
            ]);
            setStats({
                fabricanteCount,
                auditorHwCount,
                tecnicoSwCount,
                escuelaCount,
                totalFabricadas: fabricadas.length,
                totalHwAprobadas: hwAprobadas.length,
                totalSwValidadas: swValidadas.length,
                totalDistribuidas: distribuidas.length
            });
            if (!silent) {
                toast({
                    title: "Datos actualizados",
                    description: "El panel de administración se ha actualizado correctamente.",
                });
            }
            (0, serverRpc_1.revalidateAll)();
        }
        catch (error) {
            console.error('Error fetching dashboard data:', error);
            if (!silent) {
                toast({
                    title: "Error",
                    description: "No se pudieron cargar los datos del panel.",
                    variant: "destructive"
                });
            }
        }
    });
    const refreshAllData = (...args_1) => __awaiter(this, [...args_1], void 0, function* (silent = false) {
        if (!isConnected || !address)
            return;
        if (!silent)
            setIsLoading(true);
        yield Promise.all([
            fetchDashboardData(silent),
            fetchUserRoles()
        ]);
        setIsLoading(false);
    });
    const [error, setError] = (0, react_1.useState)(null);
    const [confirmationDialog, setConfirmationDialog] = (0, react_1.useState)({
        open: false,
        title: '',
        description: '',
        warning: '',
        onConfirm: () => Promise.resolve()
    });
    // Handle role manager completion
    const handleRoleManagerComplete = () => {
        refreshAllData();
        toast({
            title: "Roles actualizados",
            description: "Los roles del sistema se han actualizado correctamente.",
            variant: "default"
        });
    };
    const [processingId, setProcessingId] = (0, react_1.useState)(null);
    const handleApproveRequest = (request) => __awaiter(this, void 0, void 0, function* () {
        try {
            setProcessingId(request.id);
            yield approveMutation.mutateAsync({
                requestId: request.id,
                role: request.role,
                userAddress: request.address
            });
            // Refresh stats and roles
            fetchDashboardData(true);
            fetchUserRoles();
            toast({
                title: "Solicitud aprobada",
                description: `El rol ${request.role} ha sido asignado a ${(0, utils_1.truncateAddress)(request.address)}`,
            });
        }
        catch (error) {
            console.error('Error approving request:', error);
            toast({
                title: "Error",
                description: error.message || "No se pudo aprobar la solicitud",
                variant: "destructive"
            });
        }
        finally {
            setProcessingId(null);
        }
    });
    const handleRejectRequest = (id) => __awaiter(this, void 0, void 0, function* () {
        try {
            setProcessingId(id);
            yield rejectMutation.mutateAsync(id);
            toast({
                title: "Solicitud rechazada",
                description: "La solicitud ha sido rechazada correctamente.",
            });
        }
        catch (error) {
            console.error('Error rejecting request:', error);
        }
        finally {
            setProcessingId(null);
        }
    });
    // Handle confirmation dialog
    const confirmAction = (title, description, warning, onConfirm) => {
        setConfirmationDialog({
            open: true,
            title,
            description,
            warning,
            onConfirm
        });
    };
    // Refresh data when component mounts or connection changes
    (0, react_1.useEffect)(() => {
        refreshAllData();
        // Listen for global refresh events
        const { eventBus, EVENTS } = require('@/lib/events');
        const unsubscribe = eventBus.on(EVENTS.REFRESH_DATA || 'REFRESH_DATA', () => {
            console.log('[PendingRoleRequests] Global refresh detected...');
            refreshAllData(true);
        });
        return () => unsubscribe();
    }, [isConnected, address]);
    // Loading state
    if (isLoading) {
        return (<div className="space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-4xl font-bold tracking-tight mb-2"><skeleton_1.Skeleton className="h-8 w-64"/></h2>
            <div className="text-muted-foreground text-lg"><skeleton_1.Skeleton className="h-4 w-96"/></div>
          </div>
          <div className="flex gap-4">
            <button_1.Button size="lg" variant="outline" className="h-12 px-6">
              <skeleton_1.Skeleton className="h-5 w-20"/>
            </button_1.Button>
            <button_1.Button size="lg" variant="gradient" className="h-12 px-8 shadow-lg">
              <skeleton_1.Skeleton className="h-5 w-24"/>
            </button_1.Button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <lucide_react_2.Package className="h-6 w-6 text-primary"/>
            <h3 className="text-2xl font-bold tracking-tight"><skeleton_1.Skeleton className="h-6 w-48"/></h3>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (<card_1.Card key={i}>
                <card_1.CardHeader className="pb-2">
                  <skeleton_1.Skeleton className="h-4 w-32"/>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <skeleton_1.Skeleton className="h-10 w-16"/>
                  <skeleton_1.Skeleton className="h-4 w-24 mt-1"/>
                </card_1.CardContent>
              </card_1.Card>))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <lucide_react_2.Users className="h-6 w-6 text-primary"/>
            <h3 className="text-2xl font-bold tracking-tight"><skeleton_1.Skeleton className="h-6 w-40"/></h3>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (<card_1.Card key={i}>
                <card_1.CardHeader className="pb-2">
                  <skeleton_1.Skeleton className="h-4 w-32"/>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <skeleton_1.Skeleton className="h-10 w-16"/>
                  <skeleton_1.Skeleton className="h-4 w-24 mt-1"/>
                </card_1.CardContent>
              </card_1.Card>))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (<card_1.Card key={i}>
              <card_1.CardContent className="p-6">
                <skeleton_1.Skeleton className="h-64 w-full"/>
              </card_1.CardContent>
            </card_1.Card>))}
        </div>
      </div>);
    }
    // Error state
    if (error) {
        return (<div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight">Panel de Administración</h2>
          <button_1.Button onClick={() => fetchDashboardData()}>
            Intentar de nuevo
          </button_1.Button>
        </div>
      </div>);
    }
    // Main dashboard content
    return (<div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-bold tracking-tight mb-2">Panel de Administración</h2>
          <p className="text-muted-foreground text-lg">Gestión global de la red de suministro y permisos de usuario.</p>
        </div>
        <div className="flex gap-4">
          <button_1.Button size="lg" variant="outline" onClick={() => refreshAllData()} className="h-12 px-6" disabled={isLoading}>
            <lucide_react_1.RefreshCw className={`mr-2 h-5 w-5 ${isLoading ? 'animate-spin' : ''}`}/>
            Refrescar
          </button_1.Button>
          <button_1.Button size="lg" variant="gradient" onClick={() => setShowRoleManager(true)} className="h-12 px-8 shadow-lg">
            <lucide_react_1.Settings2 className="mr-2 h-5 w-5"/>
            Gestión de Roles
          </button_1.Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <lucide_react_2.Package className="h-6 w-6 text-primary"/>
          <h3 className="text-2xl font-bold tracking-tight">Estado de las Netbooks</h3>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard title="Fabricadas" count={stats.totalFabricadas} description="Netbooks en estado inicial." icon={lucide_react_2.HardDrive} color="text-blue-400"/>
          <SummaryCard title="HW Aprobado" count={stats.totalHwAprobadas} description="Hardware auditado correctamente." icon={lucide_react_2.CheckCircle} color="text-emerald-400"/>
          <SummaryCard title="SW Validado" count={stats.totalSwValidadas} description="Software certificado e instalado." icon={lucide_react_2.Monitor} color="text-purple-400"/>
          <SummaryCard title="Distribuidas" count={stats.totalDistribuidas} description="Entregadas a su destino final." icon={lucide_react_2.Package} color="text-amber-400"/>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <lucide_react_2.Users className="h-6 w-6 text-primary"/>
          <h3 className="text-2xl font-bold tracking-tight">Roles de los Usuarios</h3>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard title="Fabricantes" count={stats.fabricanteCount} description="Entidades de producción." icon={lucide_react_2.Building} color="text-blue-400"/>
          <SummaryCard title="Auditores HW" count={stats.auditorHwCount} description="Verificadores de hardware." icon={lucide_react_2.Shield} color="text-rose-400"/>
          <SummaryCard title="Técnicos SW" count={stats.tecnicoSwCount} description="Especialistas en software." icon={lucide_react_2.Monitor} color="text-indigo-400"/>
          <SummaryCard title="Escuelas" count={stats.escuelaCount} description="Instituciones educativas." icon={lucide_react_2.GraduationCap} color="text-emerald-400"/>
        </div>
      </div>

      {pendingRequests.length > 0 && (<div className="space-y-6">
          <div className="flex items-center gap-2">
            <lucide_react_2.Users className="h-6 w-6 text-primary"/>
            <h3 className="text-2xl font-bold tracking-tight">Solicitudes de Rol Pendientes</h3>
          </div>
          <card_1.Card>
            <card_1.CardContent className="p-0">
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-muted/50">
                    <tr>
                      <th className="px-6 py-4 font-medium">Usuario</th>
                      <th className="px-6 py-4 font-medium">Rol Solicitado</th>
                      <th className="px-6 py-4 font-medium">Fecha</th>
                      <th className="px-6 py-4 font-medium text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {pendingRequests.map((request) => (<tr key={request.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs">
                          {(0, utils_1.truncateAddress)(request.address)}
                        </td>
                        <td className="px-6 py-4 flex items-center gap-2">
                          <badge_1.Badge variant="outline" className="capitalize">
                            {request.role.replace('_', ' ')}
                          </badge_1.Badge>
                          {request.signature && (<badge_1.Badge variant="secondary" className="text-[10px] h-5 bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                              Firmada
                            </badge_1.Badge>)}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {new Date(request.timestamp).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button_1.Button size="sm" variant="gradient" onClick={() => handleApproveRequest(request)} disabled={processingId === request.id}>
                            {processingId === request.id ? <lucide_react_1.RefreshCw className="h-4 w-4 animate-spin"/> : 'Aprobar'}
                          </button_1.Button>
                          <button_1.Button size="sm" variant="destructive" onClick={() => handleRejectRequest(request.id)} disabled={processingId === request.id}>
                            Rechazar
                          </button_1.Button>
                        </td>
                      </tr>))}
                  </tbody>
                </table>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </div>)}

      <div className="grid gap-6 md:grid-cols-2">
        <NetbookStatusChart_1.NetbookStatusChart data={[
            { status: 'Fabricadas', count: stats.totalFabricadas, fill: 'hsl(var(--chart-1))' },
            { status: 'HW Aprobado', count: stats.totalHwAprobadas, fill: 'hsl(var(--chart-2))' },
            { status: 'SW Validado', count: stats.totalSwValidadas, fill: 'hsl(var(--chart-3))' },
            { status: 'Distribuidas', count: stats.totalDistribuidas, fill: 'hsl(var(--chart-4))' },
        ]}/>
        <UserRolesChart_1.UserRolesChart data={[
            { role: 'Fabricantes', count: stats.fabricanteCount, fill: 'hsl(var(--chart-1))' },
            { role: 'Auditores HW', count: stats.auditorHwCount, fill: 'hsl(var(--chart-2))' },
            { role: 'Técnicos SW', count: stats.tecnicoSwCount, fill: 'hsl(var(--chart-3))' },
            { role: 'Escuelas', count: stats.escuelaCount, fill: 'hsl(var(--chart-4))' },
        ]}/>
      </div>

      {/* Analytics chart hidden as we don't have historical data yet */}
      {/* <AnalyticsChart data={[]} /> */}

      {/*
          <RoleManager
            isOpen={showRoleManager}
            onOpenChange={(open) => setShowRoleManager(open)}
            onComplete={() => {
              setShowRoleManager(false);
              fetchDashboardData();
            }}
          />
        */}

      <TransactionConfirmation_1.TransactionConfirmation open={confirmationDialog.open} onOpenChange={(open) => setConfirmationDialog(prev => (Object.assign(Object.assign({}, prev), { open })))} title={confirmationDialog.title} description={confirmationDialog.description} warning={confirmationDialog.warning} onConfirm={() => __awaiter(this, void 0, void 0, function* () {
            yield confirmationDialog.onConfirm();
            setConfirmationDialog(prev => (Object.assign(Object.assign({}, prev), { open: false })));
        })}/>
    </div>);
}
