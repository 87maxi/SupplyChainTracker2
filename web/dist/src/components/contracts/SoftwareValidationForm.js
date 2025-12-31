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
exports.SoftwareValidationForm = SoftwareValidationForm;
const react_1 = require("react");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const checkbox_1 = require("@/components/ui/checkbox");
const dialog_1 = require("@/components/ui/dialog");
const use_toast_1 = require("@/hooks/use-toast");
const useSupplyChainService_1 = require("@/hooks/useSupplyChainService");
const useWeb3_1 = require("@/hooks/useWeb3");
function SoftwareValidationForm({ isOpen, onOpenChange, onComplete, initialSerial }) {
    const [serial, setSerial] = (0, react_1.useState)(initialSerial || '');
    const [version, setVersion] = (0, react_1.useState)('');
    const [passed, setPassed] = (0, react_1.useState)(true);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const { toast } = (0, use_toast_1.useToast)();
    const { validateSoftware } = (0, useSupplyChainService_1.useSupplyChainService)();
    const { address } = (0, useWeb3_1.useWeb3)();
    (0, react_1.useEffect)(() => {
        if (initialSerial) {
            setSerial(initialSerial);
        }
    }, [initialSerial]);
    const handleValidate = () => __awaiter(this, void 0, void 0, function* () {
        if (!serial || !version) {
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
            const result = yield validateSoftware(serial, version, passed, address);
            if (result.success) {
                toast({
                    title: "Éxito",
                    description: `Validación de software ${passed ? 'aprobada' : 'rechazada'} para netbook ${serial}`,
                });
            }
            else {
                throw new Error(result.error);
            }
            // Reset form
            if (!initialSerial)
                setSerial('');
            setVersion('');
            setPassed(true);
            onComplete();
            onOpenChange(false);
        }
        catch (error) {
            console.error('Error validating software:', error);
            toast({
                title: "Error",
                description: error.message || "No se pudo validar el software",
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
          <dialog_1.DialogTitle>Validación de Software</dialog_1.DialogTitle>
          <dialog_1.DialogDescription>
            Registre los resultados de la validación del software instalado en una netbook.
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
            <label_1.Label htmlFor="version" className="text-right">
              Versión OS
            </label_1.Label>
            <input_1.Input id="version" value={version} onChange={(e) => setVersion(e.target.value)} className="col-span-3" placeholder="Ubuntu 22.04 LTS"/>
          </div>
          <div className="flex items-center space-x-2">
            <checkbox_1.Checkbox id="passed" checked={passed} onCheckedChange={(checked) => setPassed(checked)}/>
            <label htmlFor="passed" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Validación Aprobada
            </label>
          </div>
        </div>
        <dialog_1.DialogFooter>
          <button_1.Button type="submit" onClick={handleValidate} disabled={loading}>
            {loading ? 'Registrando...' : 'Registrar Validación'}
          </button_1.Button>
        </dialog_1.DialogFooter>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}
