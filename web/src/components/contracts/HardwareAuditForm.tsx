import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { useToast } from '@/hooks/use-toast';
import { useSupplyChainService } from '@/hooks/useSupplyChainService';

interface HardwareAuditFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
  initialSerial?: string;
}

export function HardwareAuditForm({ isOpen, onOpenChange, onComplete, initialSerial }: HardwareAuditFormProps) {
  const [serial, setSerial] = useState(initialSerial || '');
  const [passed, setPassed] = useState(true);
  const [reportHash, setReportHash] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { auditHardware } = useSupplyChainService();

  // Añadir efecto para actualizar el serial cuando cambie initialSerial
  useEffect(() => {
    if (initialSerial) {
      setSerial(initialSerial);
    }
  }, [initialSerial]);

  useEffect(() => {
    if (initialSerial) {
      setSerial(initialSerial);
    }
  }, [initialSerial]);

  const handleAudit = async () => {
    if (!serial || !reportHash) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      await auditHardware(serial, passed, reportHash);

      toast({
        title: "Éxito",
        description: `Auditoría de hardware ${passed ? 'aprobada' : 'rechazada'} para netbook ${serial}`,
      });

      // Reset form
      if (!initialSerial) setSerial('');
      setPassed(true);
      setReportHash('');

      onComplete();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error auditing hardware:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo realizar la auditoría",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Auditoría de Hardware</DialogTitle>
          <DialogDescription>
            Registre los resultados de la auditoría de hardware para una netbook.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reportHash" className="text-right">
              Hash Reporte
            </Label>
            <Input
              id="reportHash"
              value={reportHash}
              onChange={(e) => setReportHash(e.target.value)}
              className="col-span-3"
              placeholder="0x... (SHA256 del reporte)"
              required
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleAudit} disabled={loading}>
            {loading ? 'Registrando...' : 'Registrar Auditoría'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}