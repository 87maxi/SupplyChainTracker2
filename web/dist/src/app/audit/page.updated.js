"use strict";
'use client';
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
exports.default = HardwareAuditPage;
const react_1 = require("react");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const use_toast_1 = require("@/hooks/use-toast");
const useSupplyChainService_1 = require("@/hooks/useSupplyChainService");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const textarea_1 = require("@/components/ui/textarea");
const useWeb3_1 = require("@/hooks/useWeb3");
function HardwareAuditPage() {
    const { toast } = (0, use_toast_1.useToast)();
    const { auditHardware } = (0, useSupplyChainService_1.useSupplyChainService)();
    const { address } = (0, useWeb3_1.useWeb3)();
    const [isRegistering, setIsRegistering] = (0, react_1.useState)(false);
    const [currentSerial, setCurrentSerial] = (0, react_1.useState)('');
    const [auditPassed, setAuditPassed] = (0, react_1.useState)(true);
    const [auditDetails, setAuditDetails] = (0, react_1.useState)('');
    // Manejador para registrar el hash en la blockchain
    const handleRegisterOnChain = () => __awaiter(this, void 0, void 0, function* () {
        if (!currentSerial || !address) {
            toast({
                title: "Error",
                description: "Primero debe completar todos los campos",
                variant: "destructive"
            });
            return;
        }
        setIsRegistering(true);
        try {
            // Create a hash from the audit details for blockchain storage
            const encoder = new TextEncoder();
            const data = encoder.encode(auditDetails);
            const hashBuffer = yield crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            const reportHash = `0x${hashHex.padStart(64, '0')}`;
            // Registrar el hash en la blockchain
            yield auditHardware(currentSerial, auditPassed, reportHash, address);
            toast({
                title: "Registro completado",
                description: "El informe de auditoría se ha registrado en la blockchain",
            });
            // Reset form
            setCurrentSerial('');
            setAuditPassed(true);
            setAuditDetails('');
        }
        catch (error) {
            console.error('Error registering on blockchain:', error);
            toast({
                title: "Error",
                description: "No se pudo registrar en la blockchain",
                variant: "destructive"
            });
        }
        finally {
            setIsRegistering(false);
        }
    });
    return (<div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Auditoría de Hardware</h1>
          <p className="text-muted-foreground">
            Registre y almacene informes de auditoría de hardware
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>1. Complete el Informe</card_1.CardTitle>
            <card_1.CardDescription>
              Ingrese los datos del dispositivo y sus hallazgos
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label_1.Label htmlFor="auditDetails">
                  Detalles de la Auditoría
                </label_1.Label>
                <textarea_1.Textarea id="auditDetails" value={auditDetails} onChange={(e) => setAuditDetails(e.target.value)} placeholder="Ingrese los detalles completos de la auditoría..." className="min-h-[200px]" required/>
                <p className="text-sm text-muted-foreground">
                  Los detalles completos se almacenarán en la base de datos MongoDB
                </p>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>2. Registre en Blockchain</card_1.CardTitle>
            <card_1.CardDescription>
              Complete los campos y registre en la blockchain
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label_1.Label htmlFor="serial" className="text-right">
                  Serial
                </label_1.Label>
                <input_1.Input id="serial" value={currentSerial} onChange={(e) => setCurrentSerial(e.target.value)} className="col-span-3" placeholder="NB-001" required/>
              </div>
              
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="auditPassed" checked={auditPassed} onChange={(e) => setAuditPassed(e.target.checked)} className="h-4 w-4"/>
                <label_1.Label htmlFor="auditPassed">
                  Auditoría Aprobada
                </label_1.Label>
              </div>
              
              <button_1.Button onClick={handleRegisterOnChain} disabled={isRegistering || !currentSerial || !auditDetails || !address} className="w-full">
                {isRegistering ? 'Registrando...' : 'Registrar en Blockchain'}
              </button_1.Button>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>¿Cómo funciona?</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li><strong>Complete el formulario</strong>: Ingrese todos los detalles del dispositivo y sus hallazgos</li>
            <li><strong>Almacenamiento en MongoDB</strong>: Los datos completos se almacenan en la base de datos</li>
            <li><strong>Registro en blockchain</strong>: Un hash del informe se registra en la blockchain</li>
            <li><strong>Verificación</strong>: Cualquiera puede verificar la integridad del informe</li>
          </ol>
          <div className="mt-4 p-4 bg-muted rounded-md">
            <h4 className="font-medium mb-2">Ventajas de este enfoque:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Reducción de costos</strong>: Los datos grandes se almacenan fuera de cadena</li>
              <li><strong>Privacidad</strong>: Los detalles sensibles se almacenan en MongoDB con control de acceso</li>
              <li><strong>Verificación</strong>: Cualquiera puede comprobar que el informe no ha sido alterado</li>
              <li><strong>Accesibilidad</strong>: Los datos están disponibles para roles autorizados</li>
            </ul>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>);
}
