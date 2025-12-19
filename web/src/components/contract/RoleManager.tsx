import { useState } from 'react';
import { useWeb3 } from '@/hooks/useWeb3';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { SupplyChainContract } from '@/lib/contracts/SupplyChainContract';

interface RoleManagerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function RoleManager({ isOpen, onOpenChange, onComplete }: RoleManagerProps) {
  const { address } = useWeb3();
  const [targetAddress, setTargetAddress] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGrantRole = async () => {
    if (!targetAddress || !role) {
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
        throw new Error("No hay una billetera conectada");
      }

      // Verify if current user is admin
      const adminRole = await SupplyChainContract.getDefaultAdminRole();
      const isAdmin = await SupplyChainContract.hasRole(adminRole, address);

      if (!isAdmin) {
        throw new Error("No tienes permisos de administrador (AccessControl)");
      }

      let roleBytes32: string;

      switch (role) {
        case 'admin':
          roleBytes32 = await SupplyChainContract.getDefaultAdminRole();
          break;
        case 'fabricante':
          roleBytes32 = await SupplyChainContract.getFabricanteRole();
          break;
        case 'auditor_hw':
          roleBytes32 = await SupplyChainContract.getAuditorHwRole();
          break;
        case 'tecnico_sw':
          roleBytes32 = await SupplyChainContract.getTecnicoSwRole();
          break;
        case 'escuela':
          roleBytes32 = await SupplyChainContract.getEscuelaRole();
          break;
        default:
          throw new Error('Rol inválido');
      }

      const tx = await SupplyChainContract.grantRole(roleBytes32, targetAddress);
      await tx.wait();

      toast({
        title: "Éxito",
        description: `Rol asignado correctamente a ${targetAddress}`,
      });

      setTargetAddress('');
      setRole('');
      onComplete();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error granting role:', error);

      // Better error message for permissions
      let errorMessage = error.message || "No se pudo asignar el rol";
      if (error.message?.includes("AccessControl")) {
        errorMessage = "No tienes permisos de administrador para realizar esta acción.";
      }

      toast({
        title: "Error",
        description: errorMessage,
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
          <DialogTitle>Asignar Rol</DialogTitle>
          <DialogDescription>
            Asigne un rol a una dirección de Ethereum para permitirle realizar acciones específicas en el sistema.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address" className="text-right">
              Dirección
            </Label>
            <Input
              id="address"
              value={targetAddress}
              onChange={(e) => setTargetAddress(e.target.value)}
              className="col-span-3"
              placeholder="0x..."
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Rol
            </Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Seleccione un rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="fabricante">Fabricante</SelectItem>
                <SelectItem value="auditor_hw">Auditor HW</SelectItem>
                <SelectItem value="tecnico_sw">Técnico SW</SelectItem>
                <SelectItem value="escuela">Escuela</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleGrantRole} disabled={loading}>
            {loading ? 'Asignando...' : 'Asignar Rol'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}