import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSupplyChainService } from "@/hooks/useSupplyChainService";
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

interface HardwareAuditFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
  initialSerial?: string;
}

export function HardwareAuditForm({
  isOpen,
  onOpenChange,
  onComplete,
  initialSerial,
}: HardwareAuditFormProps) {
  const [serial, setSerial] = useState(initialSerial || "");
  const [passed, setPassed] = useState(true);
  const [ipfsHash, setIpfsHash] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { auditHardware } = useSupplyChainService();

  // Añadir efecto para actualizar el serial cuando cambie initialSerial
  useEffect(() => {
    if (initialSerial) {
      setSerial(initialSerial);
    }
  }, [initialSerial]);

  // Manejador para cuando se completa la subida a IPFS
  const handleUploadComplete = (hash: string) => {
    setIpfsHash(hash);
    toast({
      title: "Informe subido",
      description: "El informe de auditoría se ha subido a IPFS",
    });
  };

  const handleAudit = async () => {
    if (!serial || !ipfsHash) {
      toast({
        title: "Error",
        description: "Primero debe completar todos los campos",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      await auditHardware(serial, passed, ipfsHash);

      toast({
        title: "Registro completado",
        description:
          "El informe de auditoría se ha registrado en la blockchain",
      });

      // Reset form
      if (!initialSerial) setSerial("");
      setPassed(true);
      setIpfsHash(null);

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
                  <div className="grid gap-4 md:grid-cols-2">
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
                          <Label htmlFor="display">Pantalla</Label>
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
                        placeholder="Observaciones adicionales sobre el estado del dispositivo"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 flex-shrink-0 bg-background border-t">
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAudit}
              disabled={loading || !serial}
              className="w-auto"
            >
              {loading ? "Registrando..." : "Registrar en Blockchain"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
