"use strict";
// web/src/app/admin/components/DashboardMetrics.tsx
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardMetrics = void 0;
const card_1 = require("@/components/ui/card");
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/lib/utils");
// Componente para el resumen de roles
function RoleMetricCard({ title, count, icon: Icon, color }) {
    return (<card_1.Card className="text-center hover:shadow-lg transition-shadow">
      <card_1.CardContent className="p-6">
        <Icon className={(0, utils_1.cn)("h-8 w-8 mx-auto mb-2", color)}/>
        <div className="text-2xl font-bold">{count}</div>
        <p className="text-sm text-muted-foreground">{title}</p>
      </card_1.CardContent>
    </card_1.Card>);
}
const DashboardMetrics = ({ rolesSummary, pendingRequestsCount, logs = [], loading = false }) => {
    var _a, _b, _c, _d, _e;
    if (loading) {
        return (<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (<card_1.Card key={i} className="animate-pulse">
            <card_1.CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </card_1.CardContent>
          </card_1.Card>))}
      </div>);
    }
    const metrics = [
        {
            title: 'Solicitudes Pendientes',
            value: pendingRequestsCount,
            icon: lucide_react_1.Clock,
            color: 'text-amber-500',
            trend: pendingRequestsCount > 0 ? 'warning' : 'positive',
            description: 'Esperando aprobación'
        },
        {
            title: 'Usuarios Totales',
            value: rolesSummary ? Object.values(rolesSummary).reduce((acc, curr) => acc + curr.count, 0) : 0,
            icon: lucide_react_1.Users,
            color: 'text-blue-500',
            trend: 'positive',
            description: 'Registrados en el sistema'
        },
        {
            title: 'Roles Activos',
            value: rolesSummary ? Object.values(rolesSummary).filter(r => r.count > 0).length : 0,
            icon: lucide_react_1.ShieldCheck,
            color: 'text-green-500',
            trend: 'positive',
            description: 'Con miembros asignados'
        },
        {
            title: 'Alertas de Sistema',
            value: logs.filter(l => l.type === 'error').length,
            icon: lucide_react_1.AlertTriangle,
            color: 'text-red-500',
            trend: logs.filter(l => l.type === 'error').length > 0 ? 'warning' : 'positive',
            description: logs.filter(l => l.type === 'error').length > 0 ? 'Requiere revisión' : 'Sin incidencias'
        }
    ];
    return (<div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (<card_1.Card key={index} className="hover:shadow-lg transition-shadow">
            <card_1.CardHeader className="pb-2 flex flex-row items-center justify-between">
              <card_1.CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </card_1.CardTitle>
              {/* Asumiendo que los íconos están disponibles en un componente de íconos o similar */}
              <metric.icon className={(0, utils_1.cn)("h-4 w-4", metric.color)}/>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">{metric.description}</p>
              {metric.trend === 'warning' && metric.value > 0 && (<div className="mt-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                  Necesita atención
                </div>)}
            </card_1.CardContent>
          </card_1.Card>))}
      </div>

      {/* Resumen de Roles */}
      {rolesSummary && (<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          <RoleMetricCard title="Administradores" count={((_a = rolesSummary.DEFAULT_ADMIN_ROLE) === null || _a === void 0 ? void 0 : _a.count) || 0} icon={lucide_react_1.Gavel} color="text-red-400"/>
          <RoleMetricCard title="Fabricantes" count={((_b = rolesSummary.FABRICANTE_ROLE) === null || _b === void 0 ? void 0 : _b.count) || 0} icon={lucide_react_1.Factory} color="text-blue-400"/>
          <RoleMetricCard title="Auditores HW" count={((_c = rolesSummary.AUDITOR_HW_ROLE) === null || _c === void 0 ? void 0 : _c.count) || 0} icon={lucide_react_1.ShieldCheck} color="text-emerald-400"/>
          <RoleMetricCard title="Técnicos SW" count={((_d = rolesSummary.TECNICO_SW_ROLE) === null || _d === void 0 ? void 0 : _d.count) || 0} icon={lucide_react_1.Monitor} color="text-purple-400"/>
          <RoleMetricCard title="Escuelas" count={((_e = rolesSummary.ESCUELA_ROLE) === null || _e === void 0 ? void 0 : _e.count) || 0} icon={lucide_react_1.GraduationCap} color="text-amber-400"/>
        </div>)}
    </div>);
};
exports.DashboardMetrics = DashboardMetrics;
