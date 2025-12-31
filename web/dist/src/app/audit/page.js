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
const useWeb3_1 = require("@/hooks/useWeb3");
const card_1 = require("@/components/ui/card");
const FormUploader_1 = require("@/components/ipfs/FormUploader");
const button_1 = require("@/components/ui/button");
const use_toast_1 = require("@/hooks/use-toast");
const useSupplyChainService_1 = require("@/hooks/useSupplyChainService");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
function HardwareAuditPage() {
    const { toast } = (0, use_toast_1.useToast)();
    const { auditHardware } = (0, useSupplyChainService_1.useSupplyChainService)();
    const { address } = (0, useWeb3_1.useWeb3)();
    const [ipfsHash, setIpfsHash] = (0, react_1.useState)(null);
    const [isRegistering, setIsRegistering] = (0, react_1.useState)(false);
    const [currentSerial, setCurrentSerial] = (0, react_1.useState)('');
    const [auditPassed, setAuditPassed] = (0, react_1.useState)(true);
    // Manejador para cuando se completa la subida a IPFS
    const handleUploadComplete = (hash) => {
        setIpfsHash(hash);
        toast({
            title: "Informe subido",
            description: "El informe de auditoría se ha subido a IPFS",
        });
    };
    // Manejador para registrar el hash en la blockchain
    const handleRegisterOnChain = () => __awaiter(this, void 0, void 0, function* () {
        if (!ipfsHash || !currentSerial) {
            toast({
                title: "Error",
                description: "Primero debe completar todos los campos",
                variant: "destructive"
            });
            return;
        }
        setIsRegistering(true);
        try {
            // Registrar el hash en la blockchain
            const result = yield auditHardware(currentSerial, auditPassed, ipfsHash, address || '0x0000000000000000000000000000000000000000');
            if (result.success) {
                toast({
                    title: "Registro completado",
                    description: "El informe de auditoría se ha registrado en la blockchain",
                });
                // Reset form
                setCurrentSerial('');
                setAuditPassed(true);
                setIpfsHash(null);
            }
            else {
                throw new Error(result.error);
            }
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
            <FormUploader_1.FormUploader onUploadComplete={handleUploadComplete} formTitle="Formulario de Auditoría de Hardware" formDescription="Complete los detalles de la inspección del dispositivo"/>
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
              
              {ipfsHash ? (<div className="p-4 bg-muted rounded-md">
                  <h3 className="font-medium mb-2">Hash IPFS</h3>
                  <p className="text-sm font-mono break-all">{ipfsHash}</p>
                  <div className="mt-2">
                    <a href={`https://ipfs.io/ipfs/${ipfsHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                      Ver informe completo
                    </a>
                  </div>
                </div>) : (<div className="text-center text-muted-foreground">
                  <p>Primero suba el informe a IPFS</p>
                </div>)}
            
              <button_1.Button onClick={handleRegisterOnChain} disabled={isRegistering || !ipfsHash || !currentSerial} className="w-full">
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
            <li><strong>Suba a IPFS</strong>: Los datos completos se almacenan de forma descentralizada</li>
            <li><strong>Registre en blockchain</strong>: Complete los campos y registre en la blockchain</li>
            <li><strong>Verificación</strong>: Cualquiera puede verificar la integridad del informe comparando el hash</li>
          </ol>
          <div className="mt-4 p-4 bg-muted rounded-md">
            <h4 className="font-medium mb-2">Ventajas de este enfoque:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Reducción de costos</strong>: Los datos grandes se almacenan fuera de cadena</li>
              <li><strong>Privacidad</strong>: Los detalles sensibles no están completamente expuestos</li>
              <li><strong>Verificación</strong>: Cualquiera puede comprobar que el informe no ha sido alterado</li>
              <li><strong>Permanencia</strong>: Los datos en IPFS son inmutables y permanentes</li>
            </ul>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>);
}
