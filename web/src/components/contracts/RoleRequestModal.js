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
exports.RoleRequestModal = RoleRequestModal;
const react_1 = require("react");
const button_1 = require("@/components/ui/button");
const dialog_1 = require("@/components/ui/dialog");
const select_1 = require("@/components/ui/select");
const use_toast_1 = require("@/hooks/use-toast");
const RoleRequestService_1 = require("@/services/RoleRequestService");
const useWeb3_1 = require("@/hooks/useWeb3");
const wagmi_1 = require("wagmi");
function RoleRequestModal({ isOpen, onOpenChange }) {
    const { address } = (0, useWeb3_1.useWeb3)();
    const { signMessageAsync } = (0, wagmi_1.useSignMessage)();
    const [role, setRole] = (0, react_1.useState)('');
    const [loading, setLoading] = (0, react_1.useState)(false);
    const { toast } = (0, use_toast_1.useToast)();
    const handleSubmit = () => __awaiter(this, void 0, void 0, function* () {
        if (!address) {
            toast({
                title: "Error",
                description: "Por favor conecta tu wallet",
                variant: "destructive",
            });
            return;
        }
        if (!role) {
            toast({
                title: "Error",
                description: "Por favor selecciona un rol",
                variant: "destructive",
            });
            return;
        }
        try {
            setLoading(true);
            // 1. Prompt user to sign a message
            const roleName = role.replace(/_ROLE/g, '').replace(/_/g, ' ').toLowerCase()
                .split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            const message = `Solicito el rol de ${roleName} para mi dirección ${address} en SupplyChainTracker.`;
            const signature = yield signMessageAsync({ message });
            // 2. Submit request with signature
            yield (0, RoleRequestService_1.submitRoleRequest)(address, role, signature);
            toast({
                title: "Solicitud enviada",
                description: "Tu solicitud de rol ha sido firmada y enviada correctamente. Está pendiente de aprobación.",
            });
            onOpenChange(false);
        }
        catch (error) {
            console.error('Error submitting role request:', error);
            // Handle user rejection
            if (error.code === 4001 || error.name === 'UserRejectedRequestError') {
                toast({
                    title: "Firma rechazada",
                    description: "Debes firmar el mensaje para enviar la solicitud.",
                    variant: "destructive",
                });
            }
            else {
                toast({
                    title: "Error",
                    description: error.message || "No se pudo enviar la solicitud",
                    variant: "destructive",
                });
            }
        }
        finally {
            setLoading(false);
        }
    });
    return (<dialog_1.Dialog open={isOpen} onOpenChange={onOpenChange}>
            <dialog_1.DialogContent className="sm:max-w-[425px]">
                <dialog_1.DialogHeader>
                    <dialog_1.DialogTitle>Solicitar Rol</dialog_1.DialogTitle>
                    <dialog_1.DialogDescription>
                        Selecciona el rol que deseas solicitar para operar en el sistema.
                    </dialog_1.DialogDescription>
                </dialog_1.DialogHeader>
                <div className="grid gap-4 py-4">
                    <select_1.Select value={role} onValueChange={setRole}>
                        <select_1.SelectTrigger>
                            <select_1.SelectValue placeholder="Seleccione un rol"/>
                        </select_1.SelectTrigger>
                        <select_1.SelectContent>
                            <select_1.SelectItem value="FABRICANTE_ROLE">Fabricante</select_1.SelectItem>
                            <select_1.SelectItem value="AUDITOR_HW_ROLE">Auditor HW</select_1.SelectItem>
                            <select_1.SelectItem value="TECNICO_SW_ROLE">Técnico SW</select_1.SelectItem>
                            <select_1.SelectItem value="ESCUELA_ROLE">Escuela</select_1.SelectItem>
                        </select_1.SelectContent>
                    </select_1.Select>
                </div>
                <dialog_1.DialogFooter>
                    <button_1.Button onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Enviando...' : 'Enviar Solicitud'}
                    </button_1.Button>
                </dialog_1.DialogFooter>
            </dialog_1.DialogContent>
        </dialog_1.Dialog>);
}
