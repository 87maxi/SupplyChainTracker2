"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Download, Calendar, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

// Mock data for audit logs
const mockAuditLogs = [
  {
    id: 1,
    timestamp: '2024-01-20T14:32:15Z',
    eventType: 'role_assigned',
    description: 'Rol FABRICANTE_ROLE asignado a 0x8ba1f109551bD432803012645Ac136dddF49456f',
    actor: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    success: true
  },
  {
    id: 2,
    timestamp: '2024-01-20T13:45:22Z',
    eventType: 'role_revoked',
    description: 'Rol AUDITOR_HW_ROLE revocado de 0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    actor: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    success: true
  },
  {
    id: 3,
    timestamp: '2024-01-20T12:15:08Z',
    eventType: 'netbook_registered',
    description: 'Netbook registrada con serial SC-001234',
    actor: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    success: true
  },
  {
    id: 4,
    timestamp: '2024-01-20T11:30:44Z',
    eventType: 'hardware_audited',
    description: 'Netbook SC-001234 auditada con éxito',
    actor: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    success: true
  },
  {
    id: 5,
    timestamp: '2024-01-20T10:18:27Z',
    eventType: 'software_validated',
    description: 'Netbook SC-001234 validada por software',
    actor: '0x90F79bf6EB2c4f870365E785982E1f1010034008',
    success: true
  },
  {
    id: 6,
    timestamp: '2024-01-19T16:55:12Z',
    eventType: 'role_request_approved',
    description: 'Solicitud de rol FABRICANTE_ROLE aprobada para 0x57f1887a8BF19b14fC0dF6B1f3E887b0B4BFf1B2',
    actor: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    success: true
  }
];

export default function AuditLogsPage() {
  const [logs, setLogs] = useState(mockAuditLogs);
  const [searchQuery, setSearchQuery] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [successFilter, setSuccessFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulate filtering
    setLoading(true);
    const timer = setTimeout(() => {
      let filtered = mockAuditLogs;

      if (searchQuery) {
        filtered = filtered.filter(log =>
          log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.actor.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      if (eventTypeFilter !== 'all') {
        filtered = filtered.filter(log => log.eventType === eventTypeFilter);
      }

      if (successFilter !== 'all') {
        filtered = filtered.filter(log => 
          successFilter === 'success' ? log.success : !log.success
        );
      }

      setLogs(filtered);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, eventTypeFilter, successFilter]);

  const exportLogs = () => {
    // In a real implementation, this would export the logs to a file
    const csvContent = "data:text/csv;charset=utf-8," 
      + "ID,Timestamp,Event Type,Description,Actor,Success\n"
      + logs.map(log => 
          `${log.id},"${log.timestamp}","${log.eventType}","${log.description}","${log.actor}",${log.success}`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const eventTypes = [
    { value: 'all', label: 'Todos' },
    { value: 'role_assigned', label: 'Asignación de Rol' },
    { value: 'role_revoked', label: 'Revocación de Rol' },
    { value: 'role_request_approved', label: 'Aprobación de Solicitud' },
    { value: 'netbook_registered', label: 'Registro de Netbook' },
    { value: 'hardware_audited', label: 'Auditoría de Hardware' },
    { value: 'software_validated', label: 'Validación de Software' }
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Registros de Auditoría</h1>
          <p className="text-muted-foreground">
            Historial completo de eventos y transacciones del sistema.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar en descripciones, direcciones..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={eventTypeFilter}
                  onChange={(e) => setEventTypeFilter(e.target.value)}
                  className="h-10 rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {eventTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                <select
                  value={successFilter}
                  onChange={(e) => setSuccessFilter(e.target.value)}
                  className="h-10 rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="all">Todos los Estados</option>
                  <option value="success">Éxito</option>
                  <option value="failure">Error</option>
                </select>
                <Button onClick={exportLogs} variant="outline" size="icon" className="h-10 w-10">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <span className="ml-3 text-muted-foreground">Cargando registros...</span>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Fecha y Hora</TableHead>
                    <TableHead>Tipo de Evento</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono">{log.id}</TableCell>
                      <TableCell>{new Date(log.timestamp).toLocaleString('es-AR')}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            log.eventType === 'role_assigned' || log.eventType === 'role_request_approved' || log.eventType === 'netbook_registered' || log.eventType === 'hardware_audited' || log.eventType === 'software_validated'
                              ? 'default'
                              : 'destructive'
                          }
                        >
                          {eventTypes.find(t => t.value === log.eventType)?.label || log.eventType}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">{log.description}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.actor.substring(0, 6)}...{log.actor.substring(38)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={log.success ? 'success' : 'destructive'}>
                          {log.success ? 'Éxito' : 'Error'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}