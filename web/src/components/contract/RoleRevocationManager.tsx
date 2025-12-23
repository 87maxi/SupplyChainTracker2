import { useState } from 'react';
import { useWeb3 } from '@/hooks/useWeb3';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { RoleApprovalService } from '@/services/RoleApprovalService';
import { ROLES } from '@/lib/constants';
import { TransactionStatusIndicator } from './TransactionStatusIndicator';

interface RoleRevocationManagerProps {
  targetAddress: string;
  role: string;
  onRevocationComplete: () => void;
  onRevocationError: (error: string) => void;
}

export function RoleRevocationManager({ 
  targetAddress, 
  role, 
  onRevocationComplete,
  onRevocationError
}: RoleRevocationManagerProps) {
  const { address } = useWeb3();
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const handleRevokeRole = async () => {
    if (!targetAddress || !role) {
      const errorMsg = "Datos de revocación inválidos";
      onRevocationError(errorMsg);
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

      console.log('Revoking role:', { role, targetAddress, account: address });
      
      // Revoke the role using the service
      const receipt = await RoleApprovalService.revokeRole(role, targetAddress, address as `0x${string}`);
      
      console.log('Role revoked successfully:', receipt);
      setStatus('success');
      
      toast({
        title: "Éxito",
        description: `Rol revocado correctamente de ${targetAddress}`,
      });

      // Small delay to show success state before completing
      setTimeout(() => {
        onRevocationComplete();
      }, 1500);
    } catch (error: any) {
      console.error('Error revoking role:', error);
      setStatus('error');
      
      const errorMessage = error.message || "No se pudo revocar el rol";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      onRevocationError(errorMessage);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Button 
        onClick={handleRevokeRole} 
        disabled={status === 'pending' || status === 'success'}
        variant="destructive"
        size="sm"
      >
        {status === 'pending' ? 'Revocando...' : status === 'success' ? 'Revocado' : 'Revocar'}
      </Button>
      <TransactionStatusIndicator status={status} />
    </div>
  );
}