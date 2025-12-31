"use strict";
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
exports.default = EnhancedPendingRoleRequests;
const card_1 = require("@/components/ui/card");
const badge_1 = require("@/components/ui/badge");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/components/ui/button");
const utils_1 = require("@/lib/utils");
const use_toast_1 = require("@/hooks/use-toast");
const useRoleRequests_1 = require("@/hooks/useRoleRequests");
const EnhancedRoleApprovalDialog_1 = require("@/app/admin/components/EnhancedRoleApprovalDialog");
const alert_1 = require("@/components/ui/alert");
const react_1 = require("react");
// Componente de badge de estado reutilizable
function RoleStatusBadge({ status, transactionHash }) {
    const statusConfig = {
        pending: {
            label: 'Pendiente',
            color: 'bg-yellow-100 text-yellow-800',
            icon: <lucide_react_1.Clock className='h-3 w-3'/>
        },
        confirming: {
            label: 'Confirmando...',
            color: 'bg-blue-100 text-blue-800 animate-pulse',
            icon: <lucide_react_1.AlertTriangle className='h-3 w-3'/>
        },
        approved: {
            label: 'Aprobado',
            color: 'bg-blue-100 text-blue-800',
            icon: <lucide_react_1.CheckCircle className='h-3 w-3'/>
        },
        confirmed: {
            label: 'Confirmado',
            color: 'bg-green-100 text-green-800',
            icon: <lucide_react_1.ShieldCheck className='h-3 w-3'/>
        },
        rejected: {
            label: 'Rechazado',
            color: 'bg-red-100 text-red-800',
            icon: <lucide_react_1.XCircle className='h-3 w-3'/>
        }
    };
    const config = statusConfig[status];
    return (<badge_1.Badge className={`flex items-center gap-1 ${config.color}`} variant='outline'>
      {config.icon}
      {config.label}
      {transactionHash && status === 'confirmed' && (<button onClick={() => window.open(`https://etherscan.io/tx/${transactionHash}`, '_blank')} className='ml-1 hover:underline flex items-center gap-1'>
          <lucide_react_1.ExternalLink className='h-3 w-3'/>
          ver TX
        </button>)}
    </badge_1.Badge>);
}
function EnhancedPendingRoleRequests() {
    const { toast } = (0, use_toast_1.useToast)();
    const { requests: pendingRequests, rejectMutation } = (0, useRoleRequests_1.useRoleRequests)();
    // Estado para el diálogo de aprobación
    const [approvalDialog, setApprovalDialog] = (0, react_1.useState)({
        open: false,
        request: null
    });
    // Estado para errores
    const [error, setError] = (0, react_1.useState)(null);
    // Manejar el rechazo de solicitud
    const handleRejectRequest = (id) => __awaiter(this, void 0, void 0, function* () {
        if (!confirm('¿Estás seguro de que deseas rechazar esta solicitud?'))
            return;
        setRejectingId(id);
        try {
            yield rejectMutation.mutateAsync(id);
            toast({
                title: "Solicitud rechazada",
                description: "La solicitud ha sido rechazada correctamente.",
            });
        }
        catch (error) {
            console.error('Error rejecting request:', error);
            showError("No se pudo rechazar la solicitud");
        }
        finally {
            setRejectingId(null);
        }
    });
    // Cerrar el diálogo de aprobación
    const handleDialogClose = (open) => {
        setApprovalDialog(prev => (Object.assign(Object.assign({}, prev), { open })));
    };
    // Manejar la aprobación exitosa
    const handleApproved = () => {
        toast({
            title: "Solicitud aprobada",
            description: "El rol ha sido asignado exitosamente",
        });
    };
    // Mostrar mensaje de error
    const showError = (message, type = 'unknown') => {
        setError({ type, message, timestamp: Date.now() });
        toast({
            title: "Error",
            description: message,
            variant: "destructive"
        });
    };
    // Estado de carga del rechazo
    const [rejectingId, setRejectingId] = (0, react_1.useState)(null);
    return (<>
      <card_1.Card>
        <card_1.CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <card_1.CardTitle>Solicitudes de Rol Pendientes</card_1.CardTitle>
              <card_1.CardDescription>
                Revisa y gestiona las solicitudes de acceso al sistema.
              </card_1.CardDescription>
            </div>
            <div className="text-sm text-muted-foreground">
              {pendingRequests.length} solicitud(es) pendiente(s)
            </div>
          </div>
        </card_1.CardHeader>
        
        <card_1.CardContent>
          {/* Mensaje de error general */}
          {error && (<div className="mb-4">
              <alert_1.Alert variant="destructive">
                <lucide_react_1.AlertTriangle className="h-4 w-4"/>
                <alert_1.AlertTitle>Error</alert_1.AlertTitle>
                <alert_1.AlertDescription>{error.message}</alert_1.AlertDescription>
              </alert_1.Alert>
            </div>)}

          {/* Lista de solicitudes */}
          <div className="rounded-md border">
            {pendingRequests.length === 0 ? (<div className="text-center py-8 text-muted-foreground">
                No hay solicitudes pendientes de aprobación.
              </div>) : (<div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs uppercase bg-muted/50">
                    <tr>
                      <th className="px-6 py-4 font-medium text-left">Usuario</th>
                      <th className="px-6 py-4 font-medium text-left">Rol Solicitado</th>
                      <th className="px-6 py-4 font-medium text-left">Fecha</th>
                      <th className="px-6 py-4 font-medium text-left">Estado</th>
                      <th className="px-6 py-4 font-medium text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {pendingRequests.map((request) => (<tr key={request.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-mono text-sm">
                          {(0, utils_1.truncateAddress)(request.address)}
                        </td>
                        <td className="px-6 py-4">
                          <badge_1.Badge variant="secondary" className="capitalize">
                            {request.role.replace('_', ' ').toLowerCase()}
                          </badge_1.Badge>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {new Date(request.timestamp).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}
                      </td>
                      <td className="px-6 py-4">
                        <RoleStatusBadge status="pending"/>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button_1.Button variant="default" size="sm" onClick={() => {
                    setApprovalDialog({
                        open: true,
                        request
                    });
                }} disabled={rejectMutation.isPending && rejectingId === request.id}>
                            <lucide_react_1.CheckCircle className="mr-2 h-4 w-4"/>
                            Aprobar
                          </button_1.Button>
                          <button_1.Button variant="outline" size="sm" onClick={() => handleRejectRequest(request.id)} disabled={rejectMutation.isPending && rejectingId === request.id}>
                            {rejectMutation.isPending && rejectingId === request.id ? (<>
                                <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                Procesando...
                              </>) : (<>
                                <lucide_react_1.XCircle className="mr-2 h-4 w-4"/>
                                Rechazar
                              </>)}
                          </button_1.Button>
                        </div>
                      </td>
                    </tr>))}
                </tbody>
              </table>
            </div>)}
        </div>
      </card_1.CardContent>
    </card_1.Card>
    {approvalDialog.request && (<EnhancedRoleApprovalDialog_1.EnhancedRoleApprovalDialog key={`approval-dialog-${approvalDialog.request.id}`} open={approvalDialog.open} onOpenChange={handleDialogClose} request={approvalDialog.request} onApproved={handleApproved}/>)}
    </>);
}
