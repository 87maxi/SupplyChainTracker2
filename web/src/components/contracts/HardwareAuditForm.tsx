import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useSupplyChainService } from '@/hooks/useSupplyChainService';
import { FormUploader } from '@/components/ipfs/FormUploader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface HardwareAuditFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
  initialSerial?: string;
}

export function HardwareAuditForm({ isOpen, onOpenChange, onComplete, initialSerial }: HardwareAuditFormProps) {
  const [serial, setSerial] = useState(initialSerial || '');
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
        description: "El informe de auditoría se ha registrado en la blockchain",
      });

      // Reset form
      if (!initialSerial) setSerial('');
      setPassed(true);
      setIpfsHash(null);

      onComplete();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error registering on blockchain:', error);
      toast({
        title: "Error",
        description: "No se pudo registrar en la blockchain",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Auditoría de Hardware</DialogTitle>
          <DialogDescription>
            Complete el informe de auditoría y regístrelo en la blockchain
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <Card>
            <CardHeader>
              <CardTitle>1. Complete el Informe</CardTitle>
              <CardDescription>
                Ingrese los datos del dispositivo y sus hallazgos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormUploader 
                onUploadComplete={handleUploadComplete}
                formTitle="Formulario de Auditoría de Hardware"
                formDescription="Complete los detalles de la inspección del dispositivo"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Registre en Blockchain</CardTitle>
              <CardDescription>
                Complete los campos y registre en la blockchain
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="serial" className="text-right">
                  Serial
                </Label>
                <Input
                  id="serial"
                  value={serial}
                  onChange={(e) => setSerial(e.target.value)}
                  className="col-span-3"
                  placeholder="NB-001"
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="passed"
                  checked={passed}
                  onCheckedChange={(checked: boolean) => setPassed(checked)}
                />
                <label
                  htmlFor="passed"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Auditoría Aprobada
                </label>
              </div>

              {ipfsHash ? (
                <div className="p-4 bg-muted rounded-md">
                  <h3 className="font-medium mb-2">Hash IPFS</h3>
                  <p className="text-sm font-mono break-all">{ipfsHash}</p>
                  <div className="mt-2">
                    <a 
                      href={`https://ipfs.io/ipfs/${ipfsHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Ver informe completo
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <p>Primero suba el informe a IPFS</p>
                </div>
              )}
            
              <Button 
                onClick={handleAudit}
                disabled={loading || !ipfsHash || !serial}
                className="w-full"
              >
                {loading ? 'Registrando...' : 'Registrar en Blockchain'}
              </Button>
            </CardContent>
          </Card>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}