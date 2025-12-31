"use strict";
// web/src/components/admin/activity-logs-table.tsx
'use client';
// web/src/components/admin/activity-logs-table.tsx
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityLogsTable = void 0;
const react_1 = __importDefault(require("react"));
const lucide_react_1 = require("lucide-react");
const badge_1 = require("@/components/ui/badge");
const date_fns_1 = require("date-fns");
// Icons por tipo de log
const typeIcons = {
    role_change: lucide_react_1.UserPlus,
    token_created: lucide_react_1.TrendingUp,
    transfer: lucide_react_1.ShieldCheck,
    approval: lucide_react_1.CheckCircle,
    system: lucide_react_1.Gavel,
    error: lucide_react_1.AlertCircle
};
// Colores por tipo
const typeColors = {
    role_change: 'bg-blue-100 text-blue-800 border-blue-200',
    token_created: 'bg-green-100 text-green-800 border-green-200',
    transfer: 'bg-purple-100 text-purple-800 border-purple-200',
    approval: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    system: 'bg-gray-100 text-gray-800 border-gray-200',
    error: 'bg-red-100 text-red-800 border-red-200'
};
// Colores por estado
const statusColors = {
    success: 'bg-green-100 text-green-800 border-green-200',
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    failed: 'bg-red-100 text-red-800 border-red-200'
};
const ActivityLogsTable = ({ logs }) => {
    // Obtener icono por tipo
    const getIcon = (type) => {
        const Icon = typeIcons[type] || lucide_react_1.Clock;
        return <Icon className="h-4 w-4"/>;
    };
    if (logs.length === 0) {
        return (<div className="text-center py-10 text-muted-foreground">
        <lucide_react_1.Clock className="h-12 w-12 mx-auto mb-4 opacity-50"/>
        <p>No se encontraron registros de actividad</p>
      </div>);
    }
    return (<div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b text-left text-sm font-medium text-muted-foreground">
          <tr>
            <th className="px-4 py-3 w-12"></th>
            <th className="px-4 py-3">Acción</th>
            <th className="px-4 py-3">Descripción</th>
            <th className="px-4 py-3">Dirección</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3">Fecha</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {logs.map((log) => (<tr key={log.id} className="hover:bg-muted/50 transition-colors">
              <td className="px-4 py-3 text-primary">
                {getIcon(log.type)}
              </td>
              <td className="px-4 py-3 font-medium">
                <badge_1.Badge variant="outline" className={typeColors[log.type] || ''}>
                  {log.action}
                </badge_1.Badge>
              </td>
              <td className="px-4 py-3 text-sm">
                {log.description}
              </td>
              <td className="px-4 py-3 font-mono text-xs text-gray-600 max-w-[150px] truncate">
                {log.address}
              </td>
              <td className="px-4 py-3">
                <badge_1.Badge variant="outline" className={statusColors[log.status] || ''}>
                  {log.status}
                </badge_1.Badge>
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                {(0, date_fns_1.format)(log.timestamp, 'dd/MM/yyyy HH:mm:ss')}
              </td>
            </tr>))}
        </tbody>
      </table>
    </div>);
};
exports.ActivityLogsTable = ActivityLogsTable;
