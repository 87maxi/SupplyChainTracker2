import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSupplyChainService } from "@/hooks/useSupplyChainService";
import { useWeb3 } from "@/hooks/useWeb3";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AuditFormData {
  serial: string;
  deviceModel: string;
  auditDate: string;
  auditorName: string;
  components: {
    cpu: boolean;
    ram: boolean;
    storage: boolean;
    display: boolean;
    keyboard: boolean;
    ports: boolean;
    battery: boolean;
  };
  observations: string;
  timestamp: string;
}

interface HardwareAuditFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
  initialSerial?: string;
  userAddress?: string;
}

export function HardwareAuditForm({
  isOpen,
  onOpenChange,
  onComplete,
  initialSerial,
}: HardwareAuditFormProps) {
  const [serial, setSerial] = useState(initialSerial || "");
  const [passed, setPassed] = useState(true);
  const [auditData, setAuditData] = useState<AuditFormData | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { auditHardware } = useSupplyChainService();
  const { address } = useWeb3();

  // Añadir efecto para actualizar el serial cuando cambie initialSerial
  useEffect(() => {
    if (initialSerial) {
      setSerial(initialSerial);
    }
  }, [initialSerial]);

  const handleAudit = async () => {
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
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
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

      const result = await auditHardware(serial, passed, reportHash, address);
      
      if (result.success) {
        toast({
          title: "Registro completado",
          description:
            "El informe de auditoría se ha registrado en la blockchain",
        });
      } else {
        throw new Error(result.error);
      }

      // Reset form
      if (!initialSerial) setSerial("");
      setPassed(true);
      setAuditData(null);

      onComplete();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error registering on blockchain:", error);
      toast({
        title: "Error",
        description: "No se pudo registrar en la blockchain",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Calcular altura máxima según el tamaño de pantalla
  const getDialogContentClass = () => {
    if (typeof window === "undefined")
      return "sm:max-w-[900px] h-[90vh] max-h-[90vh] flex flex-col";

    const width = window.innerWidth;
    const height = window.innerHeight;

    if (width < 640)
      return "max-w-full h-[95vh] max-h-[95vh] flex flex-col p-2"; // Mobile
    if (width < 768) return "max-w-[85vw] h-[90vh] max-h-[90vh] flex flex-col"; // Tablet
    if (height < 768)
      return "sm:max-w-[900px] h-[85vh] max-h-[85vh] flex flex-col"; // Small screens
    return "sm:max-w-[900px] h-[90vh] max-h-[90vh] flex flex-col"; // Default
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Collect form data from the form
    const formData = {
      serial,
      deviceModel: (document.getElementById('deviceModel') as HTMLInputElement)?.value,
      auditDate: (document.getElementById('auditDate') as HTMLInputElement)?.value,
      auditorName: (document.getElementById('auditorName') as HTMLInputElement)?.value,
      components: {
        cpu: (document.getElementById('cpu') as HTMLInputElement)?.checked,
        ram: (document.getElementById('ram') as HTMLInputElement)?.checked,
        storage: (document.getElementById('storage') as HTMLInputElement)?.checked,
        display: (document.getElementById('display') as HTMLInputElement)?.checked,
        keyboard: (document.getElementById('keyboard') as HTMLInputElement)?.checked,
        ports: (document.getElementById('ports') as HTMLInputElement)?.checked,
        battery: (document.getElementById('battery') as HTMLInputElement)?.checked,
      },
      observations: (document.getElementById('observations') as HTMLTextAreaElement)?.value,
      timestamp: new Date().toISOString()
    };
    
    setAuditData(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col h-full">
            <DialogHeader>
              <DialogTitle>Auditoría de Hardware</DialogTitle>
              <DialogDescription>
                Complete el informe de auditoría y regístrelo en la blockchain
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2 py-2">
              <Card>
                <CardHeader>
                  <CardTitle>Complete el Informe de Auditoría</CardTitle>
                  <CardDescription>
                    Complete los campos para registrar la auditoría de hardware
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleFormSubmit} className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="auditSerial">Serial</Label>
                      <Input
                        id="auditSerial"
                        value={serial}
                        onChange={(e) => setSerial(e.target.value)}
                        placeholder="NB-001"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deviceModel">Modelo</Label>
                      <Input
                        id="deviceModel"
                        placeholder="Intel N100, 8GB RAM, 256GB SSD"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="auditDate">Fecha</Label>
                      <Input id="auditDate" type="date" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="auditorName">Auditor</Label>
                      <Input
                        id="auditorName"
                        placeholder="Nombre del auditor"
                        required
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>Componentes Verificados</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="cpu" />
                          <Label htmlFor="cpu">CPU</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="ram" />
                          <Label htmlFor="ram">RAM</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="storage" />
                          <Label htmlFor="storage">Almacenamiento</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="display" />
                          <Label htmlFor="display">Display</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="keyboard" />
                          <Label htmlFor="keyboard">Teclado</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="ports" />
                          <Label htmlFor="ports">Puertos</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="battery" />
                          <Label htmlFor="battery">Batería</Label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="observations">Observaciones</Label>
                      <Textarea
                        id="observations"
                        placeholder="Detalles de la auditoría, problemas encontrados, recomendaciones..."
                        className="min-h-32"
                      />
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
            <DialogFooter className="sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                form="auditForm"
                disabled={loading}
              >
                {loading ? (<>Registringando...</>) : (<>Registrar Auditoría</>) }
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}