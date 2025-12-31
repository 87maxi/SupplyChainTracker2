"use strict";
// web/src/components/admin/activity-logs.tsx
'use client';
// web/src/components/admin/activity-logs.tsx
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityLogs = void 0;
const react_1 = __importStar(require("react"));
const card_1 = require("@/components/ui/card");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const select_1 = require("@/components/ui/select");
const activity_logger_1 = require("@/lib/activity-logger");
const date_fns_1 = require("date-fns");
const activity_logs_table_1 = require("./activity-logs-table");
const ActivityLogs = ({ logs: externalLogs }) => {
    const [logs, setLogs] = (0, react_1.useState)([]);
    const [filteredLogs, setFilteredLogs] = (0, react_1.useState)([]);
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    const [typeFilter, setTypeFilter] = (0, react_1.useState)('all');
    const [statusFilter, setStatusFilter] = (0, react_1.useState)('all');
    const [addressFilter, setAddressFilter] = (0, react_1.useState)('');
    const [startDate, setStartDate] = (0, react_1.useState)('');
    const [endDate, setEndDate] = (0, react_1.useState)('');
    const [stats, setStats] = (0, react_1.useState)(null);
    // Cargar logs del localStorage si no se proporcionaron externamente
    (0, react_1.useEffect)(() => {
        const localLogs = externalLogs || getActivityLogs();
        setLogs(localLogs);
        setFilteredLogs(localLogs);
        setStats((0, activity_logger_1.getLogStats)(localLogs));
    }, [externalLogs]);
    // Filtrar logs cuando cambian los filtros
    (0, react_1.useEffect)(() => {
        const filters = {
            type: typeFilter !== 'all' ? typeFilter : undefined,
            status: statusFilter !== 'all' ? statusFilter : undefined,
            address: addressFilter || undefined,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            search: searchTerm || undefined
        };
        const filtered = (0, activity_logger_1.filterLogs)(logs, filters);
        setFilteredLogs(filtered);
        setStats((0, activity_logger_1.getLogStats)(filtered));
    }, [logs, searchTerm, typeFilter, statusFilter, addressFilter, startDate, endDate]);
    // Obtener logs del localStorage (si no se proporcionan externamente)
    const getActivityLogs = () => {
        if (externalLogs)
            return externalLogs;
        try {
            if (typeof window === 'undefined')
                return [];
            const stored = localStorage.getItem('supply-chain-activity-logs');
            if (!stored)
                return [];
            const parsed = JSON.parse(stored);
            return parsed.map((log) => (Object.assign(Object.assign({}, log), { timestamp: new Date(log.timestamp) })));
        }
        catch (error) {
            console.error('Error reading activity logs:', error);
            return [];
        }
    };
    // Exportar logs a CSV
    const exportLogs = () => {
        const headers = ['ID', 'Tipo', 'Acción', 'Descripción', 'Dirección', 'Estado', 'Timestamp'];
        const csvContent = [
            headers.join(','),
            ...filteredLogs.map(log => `${log.id},${log.type},${log.action},${log.description.replace(/,/g, ';')},${log.address},${log.status},${(0, date_fns_1.format)(log.timestamp, 'yyyy-MM-dd HH:mm:ss')}`)
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `activity-logs-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    return (<card_1.Card className="overflow-hidden">
      <card_1.CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <lucide_react_1.History className="h-5 w-5 text-primary"/>
            <div>
              <card_1.CardTitle className="text-xl">Actividad del Sistema</card_1.CardTitle>
              <card_1.CardDescription>Registro completo de acciones y eventos</card_1.CardDescription>
            </div>
          </div>
          <button_1.Button variant="outline" size="sm" onClick={exportLogs}>
            <lucide_react_1.Download className="h-4 w-4 mr-2"/>
            Exportar
          </button_1.Button>
        </div>
      </card_1.CardHeader>

      <card_1.CardContent className="p-0">
        {/* Estadísticas */}
        {stats && (<div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border-b bg-muted/50">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.recent24h}</div>
              <div className="text-sm text-muted-foreground">Últimas 24h</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.byStatus.success || 0}</div>
              <div className="text-sm text-muted-foreground">Éxitos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.byStatus.failed || 0}</div>
              <div className="text-sm text-muted-foreground">Errores</div>
            </div>
          </div>)}

        {/* Filtros */}
        <div className="p-4 border-b grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="relative">
            <lucide_react_1.Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
            <input_1.Input placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10"/>
          </div>

          <select_1.Select value={typeFilter} onValueChange={setTypeFilter}>
            <select_1.SelectTrigger>
              <lucide_react_1.Filter className="h-4 w-4 mr-2"/>
              <select_1.SelectValue placeholder="Tipo"/>
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="all">Todos los tipos</select_1.SelectItem>
              <select_1.SelectItem value="role_change">Cambios de Rol</select_1.SelectItem>
              <select_1.SelectItem value="token_created">Tokens Creados</select_1.SelectItem>
              <select_1.SelectItem value="transfer">Transferencias</select_1.SelectItem>
              <select_1.SelectItem value="approval">Aprobaciones</select_1.SelectItem>
              <select_1.SelectItem value="system">Sistema</select_1.SelectItem>
              <select_1.SelectItem value="error">Errores</select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>

          <select_1.Select value={statusFilter} onValueChange={setStatusFilter}>
            <select_1.SelectTrigger>
              <select_1.SelectValue placeholder="Estado"/>
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="all">Todos los estados</select_1.SelectItem>
              <select_1.SelectItem value="success">Éxito</select_1.SelectItem>
              <select_1.SelectItem value="pending">Pendiente</select_1.SelectItem>
              <select_1.SelectItem value="failed">Fallido</select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>

          <input_1.Input placeholder="Dirección..." value={addressFilter} onChange={(e) => setAddressFilter(e.target.value)} className="flex-1"/>
        </div>

        {/* Tabla de Logs */}
        <activity_logs_table_1.ActivityLogsTable logs={filteredLogs}/>
      </card_1.CardContent>
    </card_1.Card>);
};
exports.ActivityLogs = ActivityLogs;
