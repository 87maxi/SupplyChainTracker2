// web/src/components/admin/activity-logs.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  History,
  Search,
  Filter,
  Download,
  Clock,
  AlertCircle,
  CheckCircle,
  UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  ActivityLog, 
  filterLogs, 
  getLogStats 
} from '@/lib/activity-logger';
import { format } from 'date-fns';

interface ActivityLogsProps {
  logs?: ActivityLog[];
}

import { ActivityLogsTable } from './activity-logs-table';

export const ActivityLogs: React.FC<ActivityLogsProps> = ({
  logs: externalLogs
}) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [addressFilter, setAddressFilter] = useState('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [stats, setStats] = useState<any>(null);

  // Cargar logs del localStorage si no se proporcionaron externamente
  useEffect(() => {
    const localLogs = externalLogs || getActivityLogs();
    setLogs(localLogs);
    setFilteredLogs(localLogs);
    setStats(getLogStats(localLogs));
  }, [externalLogs]);

  // Filtrar logs cuando cambian los filtros
  useEffect(() => {
    const filters = {
      type: typeFilter !== 'all' ? typeFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      address: addressFilter || undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      search: searchTerm || undefined
    };
    
    const filtered = filterLogs(logs, filters);
    setFilteredLogs(filtered);
    setStats(getLogStats(filtered));
  }, [logs, searchTerm, typeFilter, statusFilter, addressFilter, startDate, endDate]);

  // Obtener logs del localStorage (si no se proporcionan externamente)
  const getActivityLogs = (): ActivityLog[] => {
    if (externalLogs) return externalLogs;
    
    try {
      if (typeof window === 'undefined') return [];
      
      const stored = localStorage.getItem('supply-chain-activity-logs');
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      return parsed.map((log: any) => ({
        ...log,
        timestamp: new Date(log.timestamp)
      }));
    } catch (error) {
      console.error('Error reading activity logs:', error);
      return [];
    }
  };

  // Exportar logs a CSV
  const exportLogs = () => {
    const headers = ['ID', 'Tipo', 'Acción', 'Descripción', 'Dirección', 'Estado', 'Timestamp'];
    const csvContent = [
      headers.join(','),
      ...filteredLogs.map(log => 
        `${log.id},${log.type},${log.action},${log.description.replace(/,/g, ';')},${log.address},${log.status},${format(log.timestamp, 'yyyy-MM-dd HH:mm:ss')}`
      )
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

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <History className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-xl">Actividad del Sistema</CardTitle>
              <CardDescription>Registro completo de acciones y eventos</CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={exportLogs}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border-b bg-muted/50">
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
              <div className="text-2xl font-bold text-red-600">{stats.by            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>string>('');
  const [endDate, setEndDate] = useState        </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>string>('');
  const [stats, setStats] = useState        </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>any>(null);

  // Cargar logs del localStorage si no se proporcionaron externamente
  useEffect(() => {
    const localLogs = externalLogs || getActivityLogs();
    setLogs(localLogs);
    setFilteredLogs(localLogs);
    setStats(getLogStats(localLogs));
  }, [externalLogs]);

  // Filtrar logs cuando cambian los filtros
  useEffect(() => {
    const filters = {
      type: typeFilter !== 'all' ? typeFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      address: addressFilter || undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      search: searchTerm || undefined
    };
    
    const filtered = filterLogs(logs, filters);
    setFilteredLogs(filtered);
    setStats(getLogStats(filtered));
  }, [logs, searchTerm, typeFilter, statusFilter, addressFilter, startDate, endDate]);

  // Obtener logs del localStorage (si no se proporcionan externamente)
  const getActivityLogs = (): ActivityLog[] => {
    if (externalLogs) return externalLogs;
    
    try {
      if (typeof window === 'undefined') return [];
      
      const stored = localStorage.getItem('supply-chain-activity-logs');
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      return parsed.map((log: any) => ({
        ...log,
        timestamp: new Date(log.timestamp)
      }));
    } catch (error) {
      console.error('Error reading activity logs:', error);
      return [];
    }
  };

  // Exportar logs a CSV
  const exportLogs = () => {
    const headers = ['ID', 'Tipo', 'Acción', 'Descripción', 'Dirección', 'Estado', 'Timestamp'];
    const csvContent = [
      headers.join(','),
      ...filteredLogs.map(log => 
        `${log.id},${log.type},${log.action},${log.description.replace(/,/g, ';')},${log.address},${log.status},${format(log.timestamp, 'yyyy-MM-dd HH:mm:ss')}`
      )
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

  return (
            </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>Card className="overflow-hidden">
              </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>CardHeader className="pb-4">
                </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>div className="flex items-center justify-between">
                  </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>div className="flex items-center gap-3">
                    </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>History className="h-5 w-5 text-primary" />
                    </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>div>
                      </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>CardTitle className="text-xl">Actividad del Sistema        </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>/CardTitle>
                      </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>CardDescription>Registro completo de acciones y eventos        </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>/CardDescription>
                    </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>/div>
                  </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>/div>
                  </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>Button variant="outline" size="sm" onClick={exportLogs}>
                    </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>Download className="h-4 w-4 mr-2" />
            Exportar
                  </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>/Button>
                </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>/div>
              </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>/CardHeader>

              </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>
      </CardContent>

      <CardContent className="p-0">
        <ActivityLogsTable logs={filteredLogs} />
        {/* Estadísticas */}
        {stats && (
                  </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border-b bg-muted/50">
                    </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>div className="text-center">
                      </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>div className="text-2xl font-bold">{stats.total}        </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>/div>
                      </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>div className="text-sm text-muted-foreground">Total        </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>/div>
                    </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>/div>
                    </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>div className="text-center">
                      </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>div className="text-2xl font-bold">{stats.recent24h}        </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>/div>
                      </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>div className="text-sm text-muted-foreground">Últimas 24h        </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>/div>
                    </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>/div>
                    </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>div className="text-center">
                      </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>div className="text-2xl font-bold text-green-600">{stats.byStatus.success || 0}        </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>/div>
                      </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>div className="text-sm text-muted-foreground">Éxitos        </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>/div>
                    </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>/div>
                    </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>div className="text-center">
                      </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>div className="text-2xl font-bold text-red-600">{stats.byStatus.failed || 0}        </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>/div>
                      </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>div className="text-sm text-muted-foreground">Errores        </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>/div>
                    </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>/div>
                  </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>/div>
        )}

        {/* Filtros */}
                </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>div className="p-4 border-b grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>div className="relative">
                    </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
                  </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>/div>

                  </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>Select value={typeFilter} onValueChange={setTypeFilter}>
                    </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>SelectTrigger>
                      </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>Filter className="h-4 w-4 mr-2" />
                      </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>SelectValue placeholder="Tipo" />
                    </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>/SelectTrigger>
                    </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>SelectContent>
                      </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>SelectItem value="all">Todos los tipos        </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>/SelectItem>
                      </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>SelectItem value="role_change">Cambios de Rol        </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>/SelectItem>
                      </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>SelectItem value="token_created">Tokens Creados        </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>/SelectItem>
                      </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>SelectItem value="transfer">Transferencias        </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>/SelectItem>
                      </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>SelectItem value="approval">Aprobaciones        </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>/SelectItem>
                      </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>SelectItem value="system">Sistema        </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>/SelectItem>
                      </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>SelectItem value="error">Errores        </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>/SelectItem>
                    </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>/SelectContent>
                  </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>/Select>

                  </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>Select value={statusFilter} onValueChange={setStatusFilter}>
                    </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>SelectTrigger>
                      </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>SelectValue placeholder="Estado" />
                    </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>/SelectTrigger>
                    </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>SelectContent>
                      </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>SelectItem value="all">Todos los estados        </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>/SelectItem>
                      </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>SelectItem value="success">Éxito        </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>/SelectItem>
                      </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>SelectItem value="pending">Pendiente        </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>/SelectItem>
                      </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>SelectItem value="failed">Fallido        </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>/SelectItem>
                    </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>/SelectContent>
                  </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>/Select>
          
                  </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>Input
            placeholder="Dirección..."
            value={addressFilter}
            onChange={(e) => setAddressFilter(e.target.value)}
            className="flex-1"
          />

                  </div>

        <div className="grid gap-4 md:grid-cols-2 p-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>