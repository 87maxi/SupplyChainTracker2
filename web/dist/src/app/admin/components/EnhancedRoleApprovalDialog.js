"use strict";
// web/src/app/admin/components/EnhancedRoleApprovalDialog.tsx
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
exports.EnhancedRoleApprovalDialog = EnhancedRoleApprovalDialog;
const dialog_1 = require("@/components/ui/dialog");
const button_1 = require("@/components/ui/button");
const badge_1 = require("@/components/ui/badge");
const lucide_react_1 = require("lucide-react");
const alert_1 = require("@/components/ui/alert");
const utils_1 = require("@/lib/utils");
const react_1 = require("react");
const use_toast_1 = require("@/hooks/use-toast");
const useRoleRequests_1 = require("@/hooks/useRoleRequests");
function EnhancedRoleApprovalDialog({ request, open, onOpenChange, onApproved }) {
    const { toast } = (0, use_toast_1.useToast)();
    const { approveMutation } = (0, useRoleRequests_1.useRoleRequests)();
    const [step, setStep] = (0, react_1.useState)('confirm');
    const [txStatus, setTxStatus] = (0, react_1.useState)('pending');
    const [txHash, setTxHash] = (0, react_1.useState)(null);
    const [error, setError] = (0, react_1.useState)(null);
    // Iniciar el proceso de aprobación
    const handleApprove = () => __awaiter(this, void 0, void 0, function* () {
        setStep('processing');
        setTxStatus('pending');
        setError(null);
        try {
            // Llamar a la mutación de aprobación
            const result = yield approveMutation.mutateAsync({
                requestId: request.id,
                role: request.role,
                userAddress: request.address
            });
            // Actualizar estado con el hash de la transacción
            if (result) {
                setTxHash(result);
                setStep('completed');
                setTxStatus('confirmed');
                // Mostrar toast de éxito
                toast({
                    title: "Solicitud aprobada",
                    description: `El rol ${request.role} ha sido asignado a ${(0, utils_1.truncateAddress)(request.address)}`,
                });
                // Notificar al componente padre
                onApproved();
            }
        }
        catch (err) {
            console.error('Error approving request:', err);
            setError(err.message || 'Error desconocido al aprobar la solicitud');
            setStep('error');
            setTxStatus('failed');
            toast({
                title: "Error",
                description: error || 'Error desconocido',
                variant: "destructive"
            });
        }
    });
    // Renderizar el contenido según el paso actual
    const renderContent = () => {
        switch (step) {
            case 'confirm':
                return (<div className="space-y-6">
            <dialog_1.DialogDescription>
              ¿Estás seguro de que deseas aprobar esta solicitud de rol? Esta acción no se puede deshacer.
            </dialog_1.DialogDescription>
            
            <div className="grid grid-cols-2 gap-4 text-sm bg-muted/50 p-4 rounded-lg">
              <div>
                <p className="text-muted-foreground">Usuario</p>
                <p className="font-mono text-sm">{(0, utils_1.truncateAddress)(request.address)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Rol solicitado</p>
                <badge_1.Badge variant="outline">{request.role}</badge_1.Badge>
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <button_1.Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cancelar
              </button_1.Button>
              <button_1.Button onClick={handleApprove} className="flex-1">
                Sí, aprobar
              </button_1.Button>
            </div>
          </div>);
            case 'processing':
                return (<div className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <lucide_react_1.Loader2 className="h-5 w-5 animate-spin text-blue-600"/>
              <div>
                <p className="font-medium text-blue-800">Procesando aprobación...</p>
                <p className="text-sm text-blue-700">Por favor, confirma en tu wallet</p>
              </div>
            </div>
            
            {txHash && (<div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                <lucide_react_1.CheckCircle className="h-4 w-4 text-green-600"/>
                <span className="text-sm text-green-800">Transacción enviada!</span>
              </div>)}
            
            {error && (<alert_1.Alert variant="destructive">
                <lucide_react_1.AlertTriangle className="h-4 w-4"/>
                <alert_1.AlertTitle>Error</alert_1.AlertTitle>
                <alert_1.AlertDescription>{error}</alert_1.AlertDescription>
              </alert_1.Alert>)}
            
            <div className="text-center text-sm text-muted-foreground">
              El proceso puede tardar unos minutos. No cierres esta ventana.
            </div>
            
            <button_1.Button disabled className="w-full">
              <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>
              Confirmando...
            </button_1.Button>
          </div>);
            case 'completed':
                return (<div className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <lucide_react_1.CheckCircle className="h-5 w-5 text-green-600"/>
              <div>
                <p className="font-medium text-green-800">¡Éxito!</p>
                <p className="text-sm text-green-700">La solicitud ha sido aprobada exitosamente</p>
              </div>
            </div>
            
            {txHash && (<div className="space-y-3">
                <div className="text-sm">
                  <span className="text-muted-foreground">Hash de transacción:</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg font-mono text-xs">
                  {(0, utils_1.truncateAddress)(txHash)}
                  <button_1.Button variant="ghost" size="sm" onClick={() => window.open(`https://etherscan.io/tx/${txHash}`, '_blank')}>
                    <lucide_react_1.ExternalLink className="h-3 w-3"/>
                  </button_1.Button>
                </div>
              </div>)}
            
            <button_1.Button onClick={() => {
                        onOpenChange(false);
                        // Resetear estados cuando se cierra
                        setTimeout(() => {
                            setStep('confirm');
                            setTxHash(null);
                            setError(null);
                        }, 300);
                    }} className="w-full">
              Cerrar
            </button_1.Button>
          </div>);
            case 'error':
                return (<div className="space-y-6">
            <alert_1.Alert variant="destructive">
              <lucide_react_1.AlertTriangle className="h-4 w-4"/>
              <alert_1.AlertTitle>Error</alert_1.AlertTitle>
              <alert_1.AlertDescription>
                {error || 'No se pudo completar la aprobación de la solicitud'}
              </alert_1.AlertDescription>
            </alert_1.Alert>
            
                        <div className="text-center text-sm text-muted-foreground">
              Por favor, intenta nuevamente o contacta al equipo técnico.
            </div>
            <div className="flex gap-3 pt-4">
              <button_1.Button variant="outline" onClick={() => {
                        setStep('confirm');
                        setError(null);
                    }} className="flex-1">
                Intentar de nuevo
              </button_1.Button>
              <button_1.Button onClick={() => {
                        onOpenChange(false);
                        // Resetear estados cuando se cierra
                        setTimeout(() => {
                            setStep('confirm');
                            setTxHash(null);
                            setError(null);
                        }, 300);
                    }} className="flex-1">
                Cerrar
              </button_1.Button>
            </div>
          </div>);
        }
    };
    return (<dialog_1.Dialog open={open} onOpenChange={onOpenChange}>
      <dialog_1.DialogContent className="sm:max-w-[500px]">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle>Confirma Aprobación de Rol</dialog_1.DialogTitle>
        </dialog_1.DialogHeader>
        
        {renderContent()}
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}
