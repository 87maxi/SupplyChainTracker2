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
exports.default = AnalyticsPage;
const useWeb3_1 = require("@/hooks/useWeb3");
const useSupplyChainService_1 = require("@/hooks/useSupplyChainService");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const lucide_react_1 = require("lucide-react");
const react_1 = require("react");
const use_toast_1 = require("@/hooks/use-toast");
const AnalyticsChart_1 = require("./components/AnalyticsChart");
const DateRangeSelector_1 = require("./components/DateRangeSelector");
/**
 * Página de Analytics & Reporting para administradores
 *
 * Muestra métricas de roles, gráficos de participación
 * y herramientas para análisis de la red de participantes.
 */
function AnalyticsPage() {
    var _a, _b, _c;
    const { address, isConnected, connectWallet } = (0, useWeb3_1.useWeb3)();
    const { hasRole, getAllRolesSummary } = (0, useSupplyChainService_1.useSupplyChainService)();
    const { toast } = (0, use_toast_1.useToast)();
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [isAdmin, setIsAdmin] = (0, react_1.useState)(false);
    const [rolesSummary, setRolesSummary] = (0, react_1.useState)(null);
    // Transform roles summary data into analytics chart format
    const getAnalyticsData = (summary) => {
        var _a, _b;
        if (!summary)
            return [];
        // Extract counts for fabricantes and escuelas
        const fabricantesCount = ((_a = summary.FABRICANTE_ROLE) === null || _a === void 0 ? void 0 : _a.count) || 0;
        const escuelasCount = ((_b = summary.ESCUELA_ROLE) === null || _b === void 0 ? void 0 : _b.count) || 0;
        // Create a simple time series with the current month
        const currentDate = new Date();
        const currentMonth = currentDate.toLocaleString('default', { month: 'short', year: '2-digit' });
        // Return mock data using the role counts as proxies for fabricated and distributed count
        return [
            { date: currentMonth, fabricadas: fabricantesCount * 50, distribuidas: escuelasCount * 25 }
        ];
    };
    (0, react_1.useEffect)(() => {
        const fetchAnalyticsData = () => __awaiter(this, void 0, void 0, function* () {
            if (!isConnected || !address) {
                setLoading(false);
                setIsAdmin(false);
                return;
            }
            try {
                setLoading(true);
                // Verificar rol de administrador
                const userIsAdmin = yield hasRole("DEFAULT_ADMIN_ROLE", address);
                setIsAdmin(userIsAdmin);
                if (userIsAdmin) {
                    const summary = yield getAllRolesSummary();
                    setRolesSummary(summary);
                }
            }
            catch (error) {
                console.error('Error fetching analytics data:', error);
                toast({
                    title: "Error de carga",
                    description: `No se pudieron cargar los datos: ${error.message}`,
                    variant: "destructive",
                });
                setIsAdmin(false);
            }
            finally {
                setLoading(false);
            }
        });
        fetchAnalyticsData();
    }, [isConnected, address, hasRole, getAllRolesSummary, toast]);
    // Renderizado según estado
    if (!isConnected) {
        return (<div className="container mx-auto px-4 py-12">
        <card_1.Card className="border-dashed border-2">
          <card_1.CardContent className="flex flex-col items-center justify-center py-16 space-y-6">
            <h3 className="text-xl font-medium text-foreground mb-2">Acceso Restringido</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Por favor, conecta tu wallet para acceder al panel de análisis.
            </p>
            <button_1.Button size="lg" onClick={() => connectWallet()} className="h-12 px-8">
              Conectar Wallet
            </button_1.Button>
          </card_1.CardContent>
        </card_1.Card>
      </div>);
    }
    if (loading) {
        return (<div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-lg text-muted-foreground">Cargando análisis...</p>
        </div>
      </div>);
    }
    if (!isAdmin) {
        return (<div className="container mx-auto px-4 py-12">
        <card_1.Card className="border-dashed border-2">
          <card_1.CardContent className="flex flex-col items-center justify-center py-16 space-y-6">
            <div className="h-12 w-12 text-red-500/50 mb-4 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
            </div>
            <h3 className="text-xl font-medium text-red-500 mb-2">Acceso Denegado</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              No tienes permisos de administrador para acceder a esta página.
            </p>
          </card_1.CardContent>
        </card_1.Card>
      </div>);
    }
    // Renderizado principal
    return (<div className="container mx-auto px-4 py-12 space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Analytics & Reporting</h1>
          <p className="text-muted-foreground">Visualiza el estado del sistema y el crecimiento de la red de participantes.</p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/10">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"/>
          <span className="text-sm font-medium">Administrador Conectado</span>
        </div>
      </div>

      {/* Selectores de rango de fechas */}
      <DateRangeSelector_1.DateRangeSelector />

      {/* Metrics Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Total de Usuarios</card_1.CardTitle>
            <lucide_react_1.Users className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {rolesSummary
            ? Object.values(rolesSummary).reduce((sum, role) => sum + ((role === null || role === void 0 ? void 0 : role.count) || 0), 0)
            : 0}
            </div>
            <p className="text-xs text-muted-foreground">Todos los roles combinados</p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Administradores</card_1.CardTitle>
            <div className="h-4 w-4 text-red-500 flex items-center justify-center">
              <lucide_react_1.Gavel className="h-4 w-4"/>
            </div>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{((_a = rolesSummary === null || rolesSummary === void 0 ? void 0 : rolesSummary.DEFAULT_ADMIN_ROLE) === null || _a === void 0 ? void 0 : _a.count) || 0}</div>
            <p className="text-xs text-muted-foreground">Usuarios con acceso máximo</p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Fabricantes</card_1.CardTitle>
            <div className="h-4 w-4 text-blue-500 flex items-center justify-center">
              <lucide_react_1.Factory className="h-4 w-4"/>
            </div>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{((_b = rolesSummary === null || rolesSummary === void 0 ? void 0 : rolesSummary.FABRICANTE_ROLE) === null || _b === void 0 ? void 0 : _b.count) || 0}</div>
            <p className="text-xs text-muted-foreground">Instalaciones registradas</p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Auditores HW</card_1.CardTitle>
            <div className="h-4 w-4 text-green-500 flex items-center justify-center">
              <lucide_react_1.ShieldCheck className="h-4 w-4"/>
            </div>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{((_c = rolesSummary === null || rolesSummary === void 0 ? void 0 : rolesSummary.AUDITOR_HARDWARE_ROLE) === null || _c === void 0 ? void 0 : _c.count) || 0}</div>
            <p className="text-xs text-muted-foreground">Verificación de dispositivos</p>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Gráfico de análisis general */}
      <AnalyticsChart_1.AnalyticsChart data={getAnalyticsData(rolesSummary)}/>

    </div>);
}
