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
exports.NetbookForm = NetbookForm;
const react_1 = require("react");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const textarea_1 = require("@/components/ui/textarea");
const dialog_1 = require("@/components/ui/dialog");
const useSupplyChainService_1 = require("@/hooks/useSupplyChainService");
const useWeb3_1 = require("@/hooks/useWeb3");
const use_toast_1 = require("@/hooks/use-toast");
function NetbookForm({ isOpen, onOpenChange, onComplete }) {
    const [serial, setSerial] = (0, react_1.useState)('');
    const [batch, setBatch] = (0, react_1.useState)('');
    const [specs, setSpecs] = (0, react_1.useState)('');
    const [loading, setLoading] = (0, react_1.useState)(false);
    const { toast } = (0, use_toast_1.useToast)();
    const { registerNetbooks } = (0, useSupplyChainService_1.useSupplyChainService)();
    const { address } = (0, useWeb3_1.useWeb3)();
    const handleRegister = () => __awaiter(this, void 0, void 0, function* () {
        if (!serial || !batch || !specs) {
            toast({
                title: "Error",
                description: "Por favor complete todos los campos",
                variant: "destructive",
            });
            return;
        }
        try {
            setLoading(true);
            if (!address) {
                toast({
                    title: "Error",
                    description: "No se pudo obtener tu dirección. Recarga la página.",
                    variant: "destructive",
                });
                return;
            }
            const result = yield registerNetbooks([serial], [batch], [specs], address);
            if (result.success) {
                toast({
                    title: "Éxito",
                    description: `Netbook ${serial} registrada correctamente`,
                });
            }
            else {
                throw new Error(result.error);
            }
            // Reset form
            setSerial('');
            setBatch('');
            setSpecs('');
            onComplete();
            onOpenChange(false);
        }
        catch (error) {
            console.error('Error registering netbook:', error);
            toast({
                title: "Error",
                description: error.message || "No se pudo registrar la netbook",
                variant: "destructive",
            });
        }
        finally {
            setLoading(false);
        }
    });
    return (<dialog_1.Dialog open={isOpen} onOpenChange={onOpenChange}>
      <dialog_1.DialogContent className="sm:max-w-[425px]">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle>Registrar Netbook</dialog_1.DialogTitle>
          <dialog_1.DialogDescription>
            Registre una nueva netbook proporcionando los detalles necesarios.
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label_1.Label htmlFor="serial" className="text-right">
              Serial
            </label_1.Label>
            <input_1.Input id="serial" value={serial} onChange={(e) => setSerial(e.target.value)} className="col-span-3" placeholder="NB-001"/>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label_1.Label htmlFor="batch" className="text-right">
              Lote
            </label_1.Label>
            <input_1.Input id="batch" value={batch} onChange={(e) => setBatch(e.target.value)} className="col-span-3" placeholder="L-2025-01"/>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label_1.Label htmlFor="specs" className="text-right">
              Especificaciones
            </label_1.Label>
            <textarea_1.Textarea id="specs" value={specs} onChange={(e) => setSpecs(e.target.value)} className="col-span-3" placeholder="Procesador Intel Celeron N4020, 4GB RAM, 64GB SSD..."/>
          </div>
        </div>
        <dialog_1.DialogFooter>
          <button_1.Button type="submit" onClick={handleRegister} disabled={loading}>
            {loading ? 'Registrando...' : 'Registrar'}
          </button_1.Button>
        </dialog_1.DialogFooter>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}
