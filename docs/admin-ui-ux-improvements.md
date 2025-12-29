# Mejoras de UI/UX para el Panel de Administración

## Análisis del Problema

El proceso de aprobación de roles en el sistema actual presenta problemas de claridad y retroalimentación visual. Los usuarios administradores no tienen una comprensión clara del estado del proceso cuando aprueban un rol, lo que genera incertidumbre sobre si la acción fue exitosa y cuál es el siguiente paso.

### Problemas Identificados:

1. **Falta de retroalimentación visual clara** durante el proceso de aprobación de roles
2. **Confusión en el estado** de la solicitud después de la aprobación
3. **Falta de confirmación visual** de que la transacción blockchain fue exitosa
4. **Proceso no intuitivo** para nuevos administradores

## Propuesta de Mejoras

### 1. Sistema de Estado Visual para Solicitudes de Aprobación

Implementar un sistema de estados con retroalimentación visual clara en cada etapa del proceso:

```tsx
type RequestStatus = 'pending' | 'approving' | 'approved' | 'confirmed' | 'rejected';

// Componente de estado visual
type StatusBadgeProps = {
  status: RequestStatus;
  transactionHash?: string;
};

function RequestStatusBadge({ status, transactionHash }: StatusBadgeProps) {
  const statusConfig = {
    pending: {
      label: 'Pendiente',
      color: 'bg-yellow-100 text-yellow-800',
      icon: <Clock className='h-3 w-3' />
    },
    approving: {
      label: 'Aprobando...',
      color: 'bg-blue-100 text-blue-800 animate-pulse',
      icon: <Loader2 className='h-3 w-3 animate-spin' />
    },
    approved: {
      label: 'Aprobado (pendiente confirmación)',
      color: 'bg-blue-100 text-blue-800',
      icon: <CheckCircle className='h-3 w-3' />
    },
    confirmed: {
      label: 'Confirmado en blockchain',
      color: 'bg-green-100 text-green-800',
      icon: <ShieldCheck className='h-3 w-3' />
    },
    rejected: {
      label: 'Rechazado',
      color: 'bg-red-100 text-red-800',
      icon: <XCircle className='h-3 w-3' />
    }
  };

  const config = statusConfig[status];

  return (
    <Badge className={`flex items-center gap-1 ${config.color}`} variant='outline'>
      {config.icon}
      {config.label}
      {transactionHash && status === 'approved' && (
        <button 
          onClick={() => window.open(`https://etherscan.io/tx/${transactionHash}`, '_blank')}
          className='ml-1 hover:underline'
        >
          ver TX
        </button>
      )}
    </Badge>
  );
}
```

### 2. Flujo de Aprobación Rediseñado

Crear un flujo paso a paso con retroalimentación clara:

```tsx
function ApprovalModal({ request, isOpen, onClose }: { 
  request: RoleRequest; 
  isOpen: boolean; 
  onClose: () => void 
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  // Paso 1: Confirmación inicial
  if (step === 1) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Aprobación de Rol</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas aprobar esta solicitud?
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <p className='text-muted-foreground'>Usuario</p>
                <p className='font-mono text-sm'>{truncateAddress(request.address)}</p>
              </div>
              <div>
                <p className='text-muted-foreground'>Rol</p>
                <Badge>{request.role}</Badge>
              </div>
            </div>
            <div className='flex gap-2 pt-2'>
              <Button variant='outline' onClick={onClose}>Cancelar</Button>
              <Button onClick={() => setStep(2)}>Sí, aprobar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Paso 2: Procesamiento y espera de confirmación
  if (step === 2) {
    return (
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Procesando Aprobación</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='flex items-center gap-3 p-4 bg-muted/50 rounded-lg'>
              <Loader2 className='h-5 w-5 animate-spin text-primary' />
              <div>
                <p className='font-medium'>Enviando transacción...</p>
                <p className='text-sm text-muted-foreground'>Por favor, confirma en tu wallet</p>
              </div>
            </div>
            {txHash && (
              <div className='flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md'>
                <CheckCircle className='h-4 w-4 text-green-600' />
                <span className='text-sm text-green-800'>Transacción enviada!</span>
              </div>
            )}
            {error && (
              <Alert variant='destructive'>
                <AlertTriangle className='h-4 w-4' />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button 
              onClick={async () => {
                try {
                  setIsConfirming(true);
                  // Lógica para enviar la transacción
                  const result = await handleApproveRequest(request);
                  setTxHash(result.txHash);
                  setStep(3);
                  onRoleApproved();
                } catch (err: any) {
                  setError(err.message);
                } finally {
                  setIsConfirming(false);
                }
              }}
              disabled={isConfirming}
            >
              {isConfirming ? 'Confirmando...' : 'Confirmar en Wallet'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Paso 3: Confirmación final
  if (step === 3) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <div className='flex items-center gap-2'>
              <CheckCircle className='h-5 w-5 text-green-600' />
              <DialogTitle>¡Éxito!</DialogTitle>
            </div>
          </DialogHeader>
          <div className='space-y-4'>
            <p>La solicitud ha sido aprobada exitosamente. La transacción ha sido enviada a la blockchain.</p>
            
            {txHash && (
              <div className='flex items-center justify-between p-3 bg-muted/50 rounded-lg'>
                <span className='text-sm'>Hash de transacción:</span>
                <Button 
                  variant='link' 
                  onClick={() => window.open(`https://etherscan.io/tx/${txHash}`, '_blank')}
                  className='font-mono text-xs p-0 h-auto'
                >
                  {truncateAddress(txHash)}
                </Button>
              </div>
            )}
            
            <div className='flex gap-2'>
              <Button onClick={onClose}>Cerrar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

