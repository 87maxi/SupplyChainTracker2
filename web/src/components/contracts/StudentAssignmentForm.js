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
exports.StudentAssignmentForm = StudentAssignmentForm;
const react_1 = require("react");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const dialog_1 = require("@/components/ui/dialog");
const use_toast_1 = require("@/hooks/use-toast");
const useSupplyChainService_1 = require("@/hooks/useSupplyChainService");
const useWeb3_1 = require("@/hooks/useWeb3");
function StudentAssignmentForm({ isOpen, onOpenChange, onComplete, initialSerial }) {
    const [serial, setSerial] = (0, react_1.useState)(initialSerial || '');
    const [schoolHash, setSchoolHash] = (0, react_1.useState)('');
    const [studentHash, setStudentHash] = (0, react_1.useState)('');
    const [loading, setLoading] = (0, react_1.useState)(false);
    const { toast } = (0, use_toast_1.useToast)();
    const { assignToStudent } = (0, useSupplyChainService_1.useSupplyChainService)();
    const { address } = (0, useWeb3_1.useWeb3)();
    (0, react_1.useEffect)(() => {
        if (initialSerial) {
            setSerial(initialSerial);
        }
    }, [initialSerial]);
    const handleAssign = () => __awaiter(this, void 0, void 0, function* () {
        if (!serial || !schoolHash || !studentHash) {
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
            const result = yield assignToStudent(serial, schoolHash, studentHash, address);
            if (result.success) {
                toast({
                    title: "Éxito",
                    description: `Netbook ${serial} asignada al estudiante`,
                });
            }
            else {
                throw new Error(result.error);
            }
            // Reset form
            if (!initialSerial)
                setSerial('');
            setSchoolHash('');
            setStudentHash('');
            onComplete();
            onOpenChange(false);
        }
        catch (error) {
            console.error('Error assigning to student:', error);
            toast({
                title: "Error",
                description: error.message || "No se pudo asignar la netbook al estudiante",
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
          <dialog_1.DialogTitle>Asignar a Estudiante</dialog_1.DialogTitle>
          <dialog_1.DialogDescription>
            Asigne una netbook a un estudiante final proporcionando los identificadores hash.
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
            <label_1.Label htmlFor="schoolHash" className="text-right">
              Hash Escuela
            </label_1.Label>
            <input_1.Input id="schoolHash" value={schoolHash} onChange={(e) => setSchoolHash(e.target.value)} className="col-span-3" placeholder="0x... (CID del registro)"/>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label_1.Label htmlFor="studentHash" className="text-right">
              Hash Estudiante
            </label_1.Label>
            <input_1.Input id="studentHash" value={studentHash} onChange={(e) => setStudentHash(e.target.value)} className="col-span-3" placeholder="0x... (DNI hash)"/>
          </div>
        </div>
        <dialog_1.DialogFooter>
          <button_1.Button type="submit" onClick={handleAssign} disabled={loading}>
            {loading ? 'Asignando...' : 'Asignar'}
          </button_1.Button>
        </dialog_1.DialogFooter>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}
