import { useState } from 'react';
import { useWeb3 } from '@/hooks/useWeb3';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { TransactionStatusIndicator } from './TransactionStatusIndicator';
import { RoleApprovalService } from '@/services/RoleApprovalService';

interface RoleApprovalManagerProps {
  targetAddress: string;
  role: string;
  onApprovalComplete: () => void;
  onApprovalError: (error: string) => void;
}

export function RoleApprovalManager({ 
  targetAddress, 
  role, 
  onApprovalComplete,
  onApprovalError
}: RoleApprovalManagerProps) {
  const { address } = useWeb3();
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const handleApproveRole = async () => {
    if (!targetAddress || !role) {
      const errorMsg = "Datos de solicitud inválidos";
      onApprovalError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }

    try {
      setStatus('pending');

      if (!address) {
        throw new Error("No hay una billetera conectada");
      }

      console.log('Granting role:', { role, targetAddress, account: address });

      // Grant the role with proper account handling using the new service
      const receipt = await RoleApprovalService.grantRole(role, targetAddress, address as `0x${string}`);
      console.log('Role granted successfully:', receipt);
      setStatus('success');
      
      toast({
        title: "Éxito",
        description: `Rol asignado correctamente a ${targetAddress}`,
      });

      // Small delay to show success state before completing
      setTimeout(() => {
        onApprovalComplete();
      }, 1500);
    } catch (error: any) {
      console.error('Error granting role:', error);
      setStatus('error');
      
      const errorMessage = error.message || "No se pudo asignar el rol";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      onApprovalError(errorMessage);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Button 
        onClick={handleApproveRole} 
        disabled={status === 'pending' || status === 'success'}
        variant="default"
        size="sm"
      >
        {status === 'pending' ? 'Aprobando...' : status === 'success' ? 'Aprobado' : 'Aprobar'}
      </Button>
      <TransactionStatusIndicator status={status} />
    </div>
  );
}

