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
exports.HardwareAuditForm = HardwareAuditForm;
const react_1 = require("react");
const button_1 = require("@/components/ui/button");
const use_toast_1 = require("@/hooks/use-toast");
const useSupplyChainService_1 = require("@/hooks/useSupplyChainService");
const useWeb3_1 = require("@/hooks/useWeb3");
const card_1 = require("@/components/ui/card");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const checkbox_1 = require("@/components/ui/checkbox");
const textarea_1 = require("@/components/ui/textarea");
const dialog_1 = require("@/components/ui/dialog");
function HardwareAuditForm({ isOpen, onOpenChange, onComplete, initialSerial, }) {
    const [serial, setSerial] = (0, react_1.useState)(initialSerial || "");
    const [passed, setPassed] = (0, react_1.useState)(true);
    const [auditData, setAuditData] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const { toast } = (0, use_toast_1.useToast)();
    const { auditHardware } = (0, useSupplyChainService_1.useSupplyChainService)();
    const { address } = (0, useWeb3_1.useWeb3)();
    // Añadir efecto para actualizar el serial cuando cambie initialSerial
    (0, react_1.useEffect)(() => {
        if (initialSerial) {
            setSerial(initialSerial);
        }
    }, [initialSerial]);
    const handleAudit = () => __awaiter(this, void 0, void 0, function* () {
        if (!serial || !auditData) {
            toast({
                title: "Error",
                description: "Primero debe completar todos los campos",
                variant: "destructive",
            });
            return;
        }
        try {
            setLoading(true);
            // Create a hash from the audit data for blockchain storage
            const encoder = new TextEncoder();
            const data = encoder.encode(JSON.stringify(auditData));
            const hashBuffer = yield crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            const reportHash = `0x${hashHex.padStart(64, '0')}`;
            if (!address) {
                toast({
                    title: "Error",
                    description: "No se pudo obtener tu dirección. Recarga la página.",
                    variant: "destructive",
                });
                return;
            }
            const result = yield auditHardware(serial, passed, reportHash, address);
            if (result.success) {
                toast({
                    title: "Registro completado",
                    description: "El informe de auditoría se ha registrado en la blockchain",
                });
            }
            else {
                throw new Error(result.error);
            }
            // Reset form
            if (!initialSerial)
                setSerial("");
            setPassed(true);
            setAuditData(null);
            onComplete();
            onOpenChange(false);
        }
        catch (error) {
            console.error("Error registering on blockchain:", error);
            toast({
                title: "Error",
                description: "No se pudo registrar en la blockchain",
                variant: "destructive",
            });
        }
        finally {
            setLoading(false);
        }
    });
    // Calcular altura máxima según el tamaño de pantalla
    const getDialogContentClass = () => {
        if (typeof window === "undefined")
            return "sm:max-w-[900px] h-[90vh] max-h-[90vh] flex flex-col";
        const width = window.innerWidth;
        const height = window.innerHeight;
        if (width < 640)
            return "max-w-full h-[95vh] max-h-[95vh] flex flex-col p-2"; // Mobile
        if (width < 768)
            return "max-w-[85vw] h-[90vh] max-h-[90vh] flex flex-col"; // Tablet
        if (height < 768)
            return "sm:max-w-[900px] h-[85vh] max-h-[85vh] flex flex-col"; // Small screens
        return "sm:max-w-[900px] h-[90vh] max-h-[90vh] flex flex-col"; // Default
    };
    const handleFormSubmit = (e) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        e.preventDefault();
        // Collect form data from the form
        const formData = {
            serial,
            deviceModel: (_a = document.getElementById('deviceModel')) === null || _a === void 0 ? void 0 : _a.value,
            auditDate: (_b = document.getElementById('auditDate')) === null || _b === void 0 ? void 0 : _b.value,
            auditorName: (_c = document.getElementById('auditorName')) === null || _c === void 0 ? void 0 : _c.value,
            components: {
                cpu: (_d = document.getElementById('cpu')) === null || _d === void 0 ? void 0 : _d.checked,
                ram: (_e = document.getElementById('ram')) === null || _e === void 0 ? void 0 : _e.checked,
                storage: (_f = document.getElementById('storage')) === null || _f === void 0 ? void 0 : _f.checked,
                display: (_g = document.getElementById('display')) === null || _g === void 0 ? void 0 : _g.checked,
                keyboard: (_h = document.getElementById('keyboard')) === null || _h === void 0 ? void 0 : _h.checked,
                ports: (_j = document.getElementById('ports')) === null || _j === void 0 ? void 0 : _j.checked,
                battery: (_k = document.getElementById('battery')) === null || _k === void 0 ? void 0 : _k.checked,
            },
            observations: (_l = document.getElementById('observations')) === null || _l === void 0 ? void 0 : _l.value,
            timestamp: new Date().toISOString()
        };
        setAuditData(formData);
    };
    return (<dialog_1.Dialog open={isOpen} onOpenChange={onOpenChange}>
      <dialog_1.DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col h-full">
            <dialog_1.DialogHeader>
              <dialog_1.DialogTitle>Auditoría de Hardware</dialog_1.DialogTitle>
              <dialog_1.DialogDescription>
                Complete el informe de auditoría y regístrelo en la blockchain
              </dialog_1.DialogDescription>
            </dialog_1.DialogHeader>
            <div className="grid gap-2 py-2">
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle>Complete el Informe de Auditoría</card_1.CardTitle>
                  <card_1.CardDescription>
                    Complete los campos para registrar la auditoría de hardware
                  </card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <form onSubmit={handleFormSubmit} className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label_1.Label htmlFor="auditSerial">Serial</label_1.Label>
                      <input_1.Input id="auditSerial" value={serial} onChange={(e) => setSerial(e.target.value)} placeholder="NB-001" required/>
                    </div>

                    <div className="space-y-2">
                      <label_1.Label htmlFor="deviceModel">Modelo</label_1.Label>
                      <input_1.Input id="deviceModel" placeholder="Intel N100, 8GB RAM, 256GB SSD" required/>
                    </div>

                    <div className="space-y-2">
                      <label_1.Label htmlFor="auditDate">Fecha</label_1.Label>
                      <input_1.Input id="auditDate" type="date" required/>
                    </div>

                    <div className="space-y-2">
                      <label_1.Label htmlFor="auditorName">Auditor</label_1.Label>
                      <input_1.Input id="auditorName" placeholder="Nombre del auditor" required/>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label_1.Label>Componentes Verificados</label_1.Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2">
                          <checkbox_1.Checkbox id="cpu"/>
                          <label_1.Label htmlFor="cpu">CPU</label_1.Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <checkbox_1.Checkbox id="ram"/>
                          <label_1.Label htmlFor="ram">RAM</label_1.Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <checkbox_1.Checkbox id="storage"/>
                          <label_1.Label htmlFor="storage">Almacenamiento</label_1.Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <checkbox_1.Checkbox id="display"/>
                          <label_1.Label htmlFor="display">Display</label_1.Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <checkbox_1.Checkbox id="keyboard"/>
                          <label_1.Label htmlFor="keyboard">Teclado</label_1.Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <checkbox_1.Checkbox id="ports"/>
                          <label_1.Label htmlFor="ports">Puertos</label_1.Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <checkbox_1.Checkbox id="battery"/>
                          <label_1.Label htmlFor="battery">Batería</label_1.Label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label_1.Label htmlFor="observations">Observaciones</label_1.Label>
                      <textarea_1.Textarea id="observations" placeholder="Detalles de la auditoría, problemas encontrados, recomendaciones..." className="min-h-32"/>
                    </div>
                  </form>
                </card_1.CardContent>
              </card_1.Card>
            </div>
            <dialog_1.DialogFooter className="sm:justify-end">
              <button_1.Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancelar
              </button_1.Button>
              <button_1.Button type="submit" form="auditForm" disabled={loading}>
                {loading ? (<>Registringando...</>) : (<>Registrar Auditoría</>)}
              </button_1.Button>
            </dialog_1.DialogFooter>
          </div>
        </div>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}
