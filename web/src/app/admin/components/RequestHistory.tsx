"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, Calendar, User, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRoleRequests } from '@/hooks/useRoleRequests';
import { truncateAddress } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  approved: 'Aprobada',
  rejected: 'Rechazada'
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200'
};

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  fabricante: 'Fabricante',
  auditor_hw: 'Auditor HW',
  tecnico_sw: 'Técnico SW',
  escuela: 'Escuela'
};

const roleColors: Record<string, string> = {
  admin: 'bg-red-100 text-red-800 border-red-200',
  fabricante: 'bg-blue-100 text-blue-800 border-blue-200',
  auditor_hw: 'bg-green-100 text-green-800 border-green-200',
  tecnico_sw: 'bg-purple-100 text-purple-800 border-purple-200',
  escuela: 'bg-orange-100 text-orange-800 border-orange-200'
};

export function RequestHistory() {
  const { requests, loading, error } = useRoleRequests();
  const [filteredRequests, setFilteredRequests] = useState(requests);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  // Filter requests when filters or requests change
  useEffect(() => {
    let result = [...requests];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(request => 
        request.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(request => request.status === statusFilter);
    }
    
    // Apply role filter
    if (roleFilter !== 'all') {
      result = result.filter(request => request.role === roleFilter);
    }
    
    setFilteredRequests(result);
  }, [requests, searchTerm, statusFilter, roleFilter]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historial de Solicitudes</CardTitle>
          <CardDescription>
            Cargando historial de solicitudes de roles...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8">Cargando...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historial de Solicitudes</CardTitle>
          <CardDescription>
            Error al cargar el historial
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Historial de Solicitudes</CardTitle>
            <CardDescription>
              Historial completo de solicitudes de roles
            </CardDescription>
          </div>
          <div className="text-sm text-muted-foreground">
            Total: {requests.length} solicitudes
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por dirección o ID..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="approved">Aprobada</SelectItem>
                <SelectItem value="rejected">Rechazada</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="fabricante">Fabricante</SelectItem>
                <SelectItem value="auditor_hw">Auditor HW</SelectItem>
                <SelectItem value="tecnico_sw">Técnico SW</SelectItem>
                <SelectItem value="escuela">Escuela</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setRoleFilter('all');
              }}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-muted-foreground">
          Mostrando {filteredRequests.length} de {requests.length} solicitudes
        </div>

        {/* Requests table */}
        {filteredRequests.length > 0 ? (
          <div className="rounded-md border">
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted/50">
                  <tr>
                    <th className="px-6 py-4 font-medium">ID</th>
                    <th className="px-6 py-4 font-medium">Usuario</th>
                    <th className="px-6 py-4 font-medium">Rol Solicitado</th>
                    <th className="px-6 py-4 font-medium">Estado</th>
                    <th className="px-6 py-4 font-medium">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs">
                        {request.id}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {truncateAddress(request.address)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={roleColors[request.role] || 'bg-gray-100 text-gray-800 border-gray-200'}>
                          <Shield className="mr-1 h-3 w-3" />
                          {roleLabels[request.role] || request.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={statusColors[request.status] || 'bg-gray-100 text-gray-800 border-gray-200'}>
                          {statusLabels[request.status] || request.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(request.timestamp), 'dd/MM/yyyy HH:mm', { locale: es })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No se encontraron solicitudes</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' || roleFilter !== 'all'
                ? 'Intenta ajustar tus filtros de búsqueda'
                : 'No hay solicitudes registradas en el sistema'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}