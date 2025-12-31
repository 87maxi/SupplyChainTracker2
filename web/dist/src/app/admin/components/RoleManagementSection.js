"use strict";
// web/src/app/admin/components/RoleManagementSection.tsx
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
exports.RoleManagementSection = void 0;
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const select_1 = require("@/components/ui/select");
const use_toast_1 = require("@/hooks/use-toast");
const useSupplyChainService_1 = require("@/hooks/useSupplyChainService");
const react_1 = require("react");
const events_1 = require("@/lib/events");
const toast_1 = require("@/components/ui/toast");
// Definición de los roles disponibles
const availableRoles = [
    { value: 'FABRICANTE_ROLE', label: 'Fabricante' },
    { value: 'AUDITOR_HW_ROLE', label: 'Auditor de Hardware' },
    { value: 'TECNICO_SW_ROLE', label: 'Técnico de Software' },
    { value: 'ESCUELA_ROLE', label: 'Escuela' }
];
const RoleManagementSection = () => {
    const { grantRole, getAllRolesSummary } = (0, useSupplyChainService_1.useSupplyChainService)();
    const { toast } = (0, use_toast_1.useToast)();
    const [selectedRole, setSelectedRole] = (0, react_1.useState)('FABRICANTE_ROLE');
    const [newMemberAddress, setNewMemberAddress] = (0, react_1.useState)('');
    const [loading, setLoading] = (0, react_1.useState)(false);
    // Añadir nuevo miembro
    const handleAddMember = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!newMemberAddress) {
            toast({
                title: "Error",
                description: "Por favor, ingresa una dirección",
                variant: "destructive"
            });
            return;
        }
        setLoading(true);
        try {
            const result = yield grantRole(selectedRole, newMemberAddress);
            if (result.success) {
                toast({
                    title: "Éxito",
                    description: `Rol otorgado correctamente.`,
                    action: result.hash ? <toast_1.ToastAction altText="Ver transacción" onClick={() => window.open(`https://sepolia.etherscan.io/tx/${result.hash}`, '_blank')}>Ver TX</toast_1.ToastAction> : undefined
                });
                setNewMemberAddress('');
                // Refresh and notify
                yield getAllRolesSummary(); // Refresh cache
                events_1.eventBus.emit(events_1.EVENTS.ROLE_UPDATED);
            }
        }
        catch (error) {
            console.error('Error al otorgar rol:', error);
            toast({
                title: "Error",
                description: error.message || "No se pudo otorgar el rol",
                variant: "destructive"
            });
        }
        finally {
            setLoading(false);
        }
    });
    return (<card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle>Otorgar Nuevo Rol</card_1.CardTitle>
        <card_1.CardDescription>Asigna roles manualmente a direcciones específicas</card_1.CardDescription>
      </card_1.CardHeader>
      <card_1.CardContent>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label_1.Label htmlFor="role-select">Seleccionar Rol</label_1.Label>
            <select_1.Select value={selectedRole} onValueChange={(value) => setSelectedRole(value)}>
              <select_1.SelectTrigger id="role-select">
                <select_1.SelectValue placeholder="Selecciona un rol"/>
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                {availableRoles.map(({ value, label }) => (<select_1.SelectItem key={value} value={value}>
                    {label}
                  </select_1.SelectItem>))}
              </select_1.SelectContent>
            </select_1.Select>
          </div>

          <div className="flex-1">
            <label_1.Label htmlFor="new-member">Dirección de Wallet</label_1.Label>
            <div className="flex gap-2">
              <input_1.Input id="new-member" placeholder="0x..." value={newMemberAddress} onChange={(e) => setNewMemberAddress(e.target.value)}/>
              <button_1.Button onClick={handleAddMember} disabled={loading}>
                {loading ? 'Procesando...' : 'Otorgar Rol'}
              </button_1.Button>
            </div>
          </div>
        </div>
      </card_1.CardContent>
    </card_1.Card>);
};
exports.RoleManagementSection = RoleManagementSection;
