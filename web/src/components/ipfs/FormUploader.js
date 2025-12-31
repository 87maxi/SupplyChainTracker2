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
exports.FormUploader = FormUploader;
const react_1 = require("react");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const textarea_1 = require("@/components/ui/textarea");
const use_toast_1 = require("@/hooks/use-toast");
const ipfsClient_1 = require("@/lib/ipfsClient");
const react_hook_form_1 = require("react-hook-form");
function FormUploader({ onUploadComplete, formTitle = "Subir Formulario a IPFS", formDescription = "Complete el formulario y suba sus datos a IPFS" }) {
    const { toast } = (0, use_toast_1.useToast)();
    const [isSubmitting, setIsSubmitting] = (0, react_1.useState)(false);
    const [uploadedHash, setUploadedHash] = (0, react_1.useState)(null);
    // Configurar el formulario
    const { register, handleSubmit, reset } = (0, react_hook_form_1.useForm)();
    // Manejador de envío
    const onSubmit = (data) => __awaiter(this, void 0, void 0, function* () {
        setIsSubmitting(true);
        try {
            // Validar JSON
            let jsonContent;
            try {
                jsonContent = JSON.parse(data.content);
            }
            catch (e) {
                toast({
                    title: "Error",
                    description: "El contenido debe ser JSON válido",
                    variant: "destructive"
                });
                return;
            }
            // Subir a IPFS
            const result = yield (0, ipfsClient_1.uploadToIPFS)(Object.assign(Object.assign({}, jsonContent), { timestamp: new Date().toISOString() }));
            setUploadedHash(result.hash);
            toast({
                title: "Éxito",
                description: "Datos subidos a IPFS correctamente",
            });
            // Notificar al padre con el hash
            onUploadComplete(result.hash);
            // Resetear el formulario
            reset();
        }
        catch (error) {
            console.error('Error uploading to IPFS:', error);
            toast({
                title: "Error",
                description: "No se pudieron subir los datos a IPFS",
                variant: "destructive"
            });
        }
        finally {
            setIsSubmitting(false);
        }
    });
    return (<card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle>{formTitle}</card_1.CardTitle>
        <card_1.CardDescription>{formDescription}</card_1.CardDescription>
      </card_1.CardHeader>
      <card_1.CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">
              Contenido (JSON)
            </label>
            <textarea_1.Textarea id="content" {...register('content')} placeholder='{\n  "serialNumber": "SN-ABC123XYZ789",\n  "auditDate": "2024-01-15T10:30:00Z",\n  "components": {\n    "cpu": "Intel Core i3",\n    "ram": "8GB"\n  }\n}' className="font-mono h-32" required/>
            <p className="text-sm text-muted-foreground">
              Ingrese los datos en formato JSON
            </p>
          </div>
          
          {uploadedHash && (<div className="p-3 bg-muted rounded-md text-sm">
              <strong>Hash IPFS:</strong> {uploadedHash}
              <div className="mt-1">
                <a href={`https://ipfs.io/ipfs/${uploadedHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Ver en IPFS
                </a>
              </div>
            </div>)}
          
          <button_1.Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Subiendo...' : 'Subir a IPFS'}
          </button_1.Button>
        </form>
      </card_1.CardContent>
    </card_1.Card>);
}
