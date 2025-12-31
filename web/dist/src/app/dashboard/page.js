"use strict";
// web/src/app/dashboard/page.tsx
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
exports.default = ManagerDashboard;
// Importaciones actualizadas
const useWeb3_1 = require("@/hooks/useWeb3"); // Usar el contexto correcto
const useSupplyChainService_1 = require("@/hooks/useSupplyChainService"); // Usar el hook del servicio
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const react_1 = require("react"); // Asegurar useCallback para funciones
const RoleActions_1 = require("./components/RoleActions");
const lucide_react_1 = require("lucide-react");
const badge_1 = require("@/components/ui/badge");
const utils_1 = require("@/lib/utils");
const useUserRoles_1 = require("@/hooks/useUserRoles");
const HardwareAuditForm_1 = require("@/components/contracts/HardwareAuditForm");
const SoftwareValidationForm_1 = require("@/components/contracts/SoftwareValidationForm");
const StudentAssignmentForm_1 = require("@/components/contracts/StudentAssignmentForm");
// Reusable Status Badge Component
function StatusBadge({ status }) {
    const getStatusConfig = (status) => {
        switch (status) {
            case 'FABRICADA':
                return { variant: 'secondary', icon: lucide_react_1.Package };
            case 'HW_APROBADO':
                return { variant: 'outline-glow', icon: lucide_react_1.ShieldCheck };
            case 'SW_VALIDADO':
                return { variant: 'success', icon: lucide_react_1.Monitor };
            case 'DISTRIBUIDA':
                return { variant: 'gradient', icon: lucide_react_1.Truck };
            default:
                return { variant: 'outline', icon: lucide_react_1.Package };
        }
    };
    const { variant, icon: Icon } = getStatusConfig(status);
    return (<badge_1.Badge variant={variant} className="gap-1.5 px-3 py-1">
      <Icon className="h-3.5 w-3.5"/>
      {status.replace(/_/g, ' ')}
    </badge_1.Badge>);
}
// Summary Card Component
function SummaryCard({ title, count, description, icon: Icon, color }) {
    return (<card_1.Card className="relative overflow-hidden group">
      <div className={(0, utils_1.cn)("absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity", color)}>
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
// Tracking Card Component
function TrackingCard({ netbook, onAction }) {
    const { isHardwareAuditor, isSoftwareTechnician, isSchool, isAdmin } = (0, useUserRoles_1.useUserRoles)();
    // Ensure netbook is defined
    if (!netbook)
        return null;
    return (<card_1.Card className="hover:bg-white/5 transition-colors border-white/5">
      <card_1.CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-mono">S/N:</span>
              <span className="font-bold tracking-tight">{netbook.serialNumber}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {netbook.currentState === 'FABRICADA' ? (<>Fecha de registro: {netbook.distributionTimestamp ? new Date(Number(netbook.distributionTimestamp) * 1000).toLocaleDateString() : 'N/A'}</>) : (<>Última actualización: {Number.isFinite(netbook.distributionTimestamp) ? new Date(Number(netbook.distributionTimestamp) * 1000).toLocaleDateString() : 'N/A'}</>)}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={netbook.currentState}/>
            {onAction && (<div className="flex gap-2">
                              {(netbook.currentState === 'FABRICADA') && (isHardwareAuditor || isAdmin) && (<button_1.Button size="sm" variant="outline" className="h-8 text-xs border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10" onClick={() => onAction('audit', netbook.serialNumber)}>
                  Auditar
                </button_1.Button>)}
              {(netbook.currentState === 'HW_APROBADO') && (isSoftwareTechnician || isAdmin) && (<button_1.Button size="sm" variant="outline" className="h-8 text-xs border-purple-500/50 text-purple-400 hover:bg-purple-500/10" onClick={() => onAction('validate', netbook.serialNumber)}>
                  Validar
                </button_1.Button>)}
              {(netbook.currentState === 'SW_VALIDADO') && (isSchool || isAdmin) && (<button_1.Button size="sm" variant="outline" className="h-8 text-xs border-amber-500/50 text-amber-400 hover:bg-amber-500/10" onClick={() => onAction('assign', netbook.serialNumber)}>
                  Asignar
                </button_1.Button>)}
              </div>)}
          </div>
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
// Temporary Dashboard for non-connected state
function TempDashboard({ onConnect }) {
    return (<div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <div className="inline-flex p-4 rounded-full bg-primary/10 text-primary animate-pulse">
          <lucide_react_1.LayoutDashboard className="h-12 w-12"/>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Panel de Control</h1>
        <card_1.Card className="border-dashed border-2">
          <card_1.CardContent className="flex flex-col items-center justify-center py-16 space-y-6">
            <p className="text-xl text-muted-foreground text-center max-w-md">
              Conecta tu wallet para acceder al sistema de trazabilidad y gestionar tus netbooks.
            </p>
            <button_1.Button size="lg" variant="gradient" onClick={onConnect} className="h-12 px-8">
              Conectar Wallet
            </button_1.Button>
          </card_1.CardContent>
        </card_1.Card>
      </div>
    </div>);
}
function ManagerDashboard() {
    const { isConnected, connectWallet } = (0, useWeb3_1.useWeb3)();
    const { getAllSerialNumbers, getNetbookState, getNetbookReport } = (0, useSupplyChainService_1.useSupplyChainService)();
    const { isHardwareAuditor, isSoftwareTechnician, isSchool, isAdmin } = (0, useUserRoles_1.useUserRoles)();
    const [netbooks, setNetbooks] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [summary, setSummary] = (0, react_1.useState)({
        FABRICADA: 0,
        HW_APROBADO: 0,
        SW_VALIDADO: 0,
        DISTRIBUIDA: 0
    });
    // Form states
    const [selectedSerial, setSelectedSerial] = (0, react_1.useState)('');
    const [showAuditForm, setShowAuditForm] = (0, react_1.useState)(false);
    const [showValidationForm, setShowValidationForm] = (0, react_1.useState)(false);
    const [showAssignmentForm, setShowAssignmentForm] = (0, react_1.useState)(false);
    // Enhanced action handler with debugging
    const handleAction = (0, react_1.useCallback)((action, serial) => {
        console.log('Handling action:', { action, serial });
        setSelectedSerial(serial);
        switch (action) {
            case 'audit':
                setShowAuditForm(true);
                console.log('Audit form state set to:', true);
                break;
            case 'validate':
                setShowValidationForm(true);
                console.log('Validation form state set to:', true);
                break;
            case 'assign':
                setShowAssignmentForm(true);
                console.log('Assignment form state set to:', true);
                break;
        }
    }, []);
    const fetchDashboardData = (0, react_1.useCallback)(() => __awaiter(this, void 0, void 0, function* () {
        if (!isConnected) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const serials = yield getAllSerialNumbers();
            const netbookData = yield Promise.all(serials.map((serial) => __awaiter(this, void 0, void 0, function* () {
                try {
                    // Obtener el estado y el reporte por separado
                    const state = yield getNetbookState(serial);
                    const report = yield getNetbookReport(serial);
                    // Combinar en un solo objeto netbook
                    if (report) {
                        return Object.assign(Object.assign({}, report), { currentState: state, serialNumber: serial, 
                            // Añadir timestamp de registro si no existe en el reporte
                            distributionTimestamp: report.distributionTimestamp || 0 });
                    }
                    return null;
                }
                catch (error) {
                    console.error(`Error fetching data for ${serial}:`, error);
                    return null;
                }
            })));
            const validNetbooks = netbookData.filter((n) => n !== null);
            setNetbooks(validNetbooks);
            setSummary({
                FABRICADA: validNetbooks.filter((n) => n.currentState === "FABRICADA").length,
                HW_APROBADO: validNetbooks.filter((n) => n.currentState === "HW_APROBADO").length,
                SW_VALIDADO: validNetbooks.filter((n) => n.currentState === "SW_VALIDADO").length,
                DISTRIBUIDA: validNetbooks.filter((n) => n.currentState === "DISTRIBUIDA").length
            });
        }
        catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
        finally {
            setLoading(false);
        }
    }), [isConnected, getAllSerialNumbers, getNetbookState, getNetbookReport]);
    (0, react_1.useEffect)(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);
    // Remove the initialized state since it's not needed
    // The component should render based on isConnected and loading states only
    if (!isConnected) {
        return <TempDashboard onConnect={connectWallet}/>;
    }
    // Filter pending tasks based on roles
    const pendingTasks = netbooks.filter((n) => {
        if (!n)
            return false;
        if ((n.currentState === 'FABRICADA') && (isHardwareAuditor || isAdmin))
            return true;
        if ((n.currentState === 'HW_APROBADO') && (isSoftwareTechnician || isAdmin))
            return true;
        if ((n.currentState === 'SW_VALIDADO') && (isSchool || isAdmin))
            return true;
        return false;
    });
    return (<div className="container mx-auto px-4 py-12 space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Resumen General</h1>
          <p className="text-muted-foreground">Estado actual de la cadena de suministro de netbooks.</p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/10">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"/>
          <span className="text-sm font-medium">Sistema en línea</span>
        </div>
      </div>

      <RoleActions_1.RoleActions />

      {loading ? (<div className="flex flex-col items-center justify-center py-24 space-y-4">
          <lucide_react_1.Loader2 className="h-12 w-12 text-primary animate-spin"/>
          <p className="text-lg text-muted-foreground animate-pulse">Sincronizando con la blockchain...</p>
        </div>) : (<>
          {/* Summary Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <SummaryCard title="En fabricación" count={summary.FABRICADA} description="Netbooks registradas pendientes de auditoría." icon={lucide_react_1.Package} color="text-blue-400"/>
            <SummaryCard title="HW Aprobado" count={summary.HW_APROBADO} description="Hardware verificado por auditores." icon={lucide_react_1.ShieldCheck} color="text-emerald-400"/>
            <SummaryCard title="SW Validado" count={summary.SW_VALIDADO} description="Software instalado y certificado." icon={lucide_react_1.Monitor} color="text-purple-400"/>
            <SummaryCard title="Entregadas" count={summary.DISTRIBUIDA} description="Distribuidas a instituciones finales." icon={lucide_react_1.Truck} color="text-amber-400"/>
          </div>

          {/* Pending Tasks Section */}
          {pendingTasks.length > 0 && (<div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                  <lucide_react_1.ShieldCheck className="h-6 w-6 text-emerald-400"/>
                  Tareas Pendientes
                </h2>
                <badge_1.Badge variant="success" className="px-3">
                  {pendingTasks.length} Acciones requeridas
                </badge_1.Badge>
              </div>
              <div className="grid gap-4">
                {pendingTasks.map((netbook) => (<TrackingCard key={netbook.serialNumber} netbook={netbook} onAction={handleAction}/>))}
              </div>
            </div>)}

          {/* Tracking List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <lucide_react_1.Search className="h-6 w-6 text-primary"/>
                Seguimiento Detallado
              </h2>
              <badge_1.Badge variant="secondary" className="px-3">
                {netbooks.length} Dispositivos
              </badge_1.Badge>
            </div>

            <div className="grid gap-4">
              {netbooks.length > 0 ? (netbooks.map((netbook) => (<TrackingCard key={netbook.serialNumber} netbook={netbook}/>))) : (<card_1.Card className="border-dashed">
                  <card_1.CardContent className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                    <lucide_react_1.Package className="h-12 w-12 mb-4 opacity-20"/>
                    <p>No se encontraron netbooks registradas en el sistema.</p>
                  </card_1.CardContent>
                </card_1.Card>)}
            </div>
          </div>
        </>)}

        {/* Forms - Conditional rendering to ensure proper state management */}
  {showAuditForm && (<HardwareAuditForm_1.HardwareAuditForm isOpen={showAuditForm} onOpenChange={setShowAuditForm} onComplete={() => {
                console.log('Audit form completed, refetching data');
                fetchDashboardData();
                // Reset form state
                setSelectedSerial('');
                setShowAuditForm(false);
            }} initialSerial={selectedSerial}/>)}
  {showValidationForm && (<SoftwareValidationForm_1.SoftwareValidationForm isOpen={showValidationForm} onOpenChange={setShowValidationForm} onComplete={() => {
                console.log('Validation form completed, refetching data');
                fetchDashboardData();
                // Reset form state
                setSelectedSerial('');
                setShowValidationForm(false);
            }} initialSerial={selectedSerial}/>)}
  {showAssignmentForm && (<StudentAssignmentForm_1.StudentAssignmentForm isOpen={showAssignmentForm} onOpenChange={setShowAssignmentForm} onComplete={() => {
                console.log('Assignment form completed, refetching data');
                fetchDashboardData();
                // Reset form state
                setSelectedSerial('');
                setShowAssignmentForm(false);
            }} initialSerial={selectedSerial}/>)}
    </div>);
}
