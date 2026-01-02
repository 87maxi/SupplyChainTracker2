'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { eventBus, EVENTS } from '@/lib/events';
import { useSupplyChainContract } from '@/hooks/useContract';
import { useState, useEffect } from 'react';
import { roleMapper } from '@/lib/roleMapping';
import { ContractRoleName } from '@/types/contract';
import { getRoleHashes } from '@/lib/roleUtils';

// Types for role requests
export interface RoleRequest {
  id: string;
  address: string;
  role: string;
  status: 'pending' | 'rejected' | 'processing';
  timestamp: number;
  signature?: string;
  transactionHash?: string;
}

// Keys for React Query
const QUERY_KEYS = {
  requests: ['roleRequests'],
};

export function useRoleRequests() {
  const { toast } = useToast();
  const supplyChainService = useSupplyChainContract();
  const queryClient = useQueryClient();

  // Local state for pending requests using localStorage as persistence
  const [pendingRequests, setPendingRequests] = useState<RoleRequest[]>([]);

  // Load requests from localStorage on component mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('role_requests');
      if (stored) {
        const requests = JSON.parse(stored);
        // Filter only pending requests
        const pending = requests.filter((req: RoleRequest) => req.status === 'pending' || req.status === 'processing');
        setPendingRequests(pending);
      }
    } catch (error) {
      console.error('Error loading role requests from localStorage:', error);
      // Initialize with empty array if parsing fails
      setPendingRequests([]);
    }
  }, []);

  // The deleteMutation is defined in the component that needs it
  // to avoid circular dependencies and build errors

  // Add a new role request
  const addRequest = (request: Omit<RoleRequest, 'id' | 'status' | 'timestamp'>) => {
    const newRequest: RoleRequest = {
      ...request,
      id: Math.random().toString(36).substring(7),
      status: 'pending',
      timestamp: Date.now()
    };
    
    setPendingRequests(prev => [...prev, newRequest]);
    
    toast({
      title: "Solicitud enviada",
      description: `Tu solicitud para el rol ${request.role} ha sido registrada.`,
    });
    
    return newRequest;
  };

  // Update request status
  const updateRequestStatus = (requestId: string, status: RoleRequest['status'], transactionHash?: string) => {
    setPendingRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status, transactionHash }
          : req
      )
    );
  };

  // Approve a role request
  const approveMutation = useMutation({
    mutationFn: async ({ requestId, role, userAddress }: { requestId: string, role: string, userAddress: string }) => {
      console.log(`[useRoleRequests] Approving request ${requestId}...`);

      // Update status to processing
      updateRequestStatus(requestId, 'processing');

      // Get role hashes
      const roleHashes = await getRoleHashes();
      
      // Map role name to hash
      const roleKeyMap: Record<string, keyof typeof roleHashes> = {
        'FABRICANTE_ROLE': 'FABRICANTE',
        'AUDITOR_HW_ROLE': 'AUDITOR_HW',
        'TECNICO_SW_ROLE': 'TECNICO_SW',
        'ESCUELA_ROLE': 'ESCUELA',
        'DEFAULT_ADMIN_ROLE': 'ADMIN'
      };
      
      const roleKey = roleKeyMap[role];
      if (!roleKey) {
        throw new Error(`Rol desconocido: ${role}`);
      }
      
      const roleHash = roleHashes[roleKey];
      if (!roleHash) {
        throw new Error(`Hash no encontrado para el rol: ${role}`);
      }
      
      // Check blockchain connection first
      const isConnected = await supplyChainService.checkConnection?.();
      if (!isConnected) {
        throw new Error('No hay conexión con la blockchain. Verifica que Anvil esté ejecutándose.');
      }

      // Blockchain Transaction - use grantRoleByHash since we have the role hash
      const result = await supplyChainService.grantRoleByHash(roleHash, userAddress as `0x${string}`);
      if (!result.success || !result.hash) {
        throw new Error(result.error || 'Transaction failed');
      }
      
      const hash = result.hash;
      console.log('[useRoleRequests] Transaction submitted:', hash);

      // Update request with transaction hash
      updateRequestStatus(requestId, 'processing', hash);

      // Wait for transaction confirmation is now handled by SupplyChainService
      // with improved timeout handling and retries

      toast({
        title: 'Confirmado en Blockchain',
        description: 'La asignación de rol ha sido confirmada.',
        variant: 'default'
      });

      // Update request status to approved (removed from pending)
      // This will trigger the useEffect that saves to localStorage
      setPendingRequests(prev => prev.filter(req => req.id !== requestId));

      // Invalidate cached role data to force refresh
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['userRoles'] });
      queryClient.invalidateQueries({ queryKey: ['roleMembers'] });

      // Emit event through event bus to notify all components about role update
      eventBus.emit(EVENTS.ROLE_UPDATED, { address: userAddress, role });

      return hash;
    },
    onMutate: async ({ requestId, role, userAddress }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.requests });

      // Snapshot previous value
      const previousRequests = [...pendingRequests];

      // Optimistically update status to processing
      updateRequestStatus(requestId, 'processing');

      // Notify UI immediately
      toast({
        title: 'Transacción Enviada',
        description: `La asignación de rol se está procesando en la blockchain.`,
      });

      // Normalize role name for event emission
      const normalizedRole = role.replace('_ROLE', '');

      // Emit event for other components
      eventBus.emit(EVENTS.ROLE_UPDATED, {
        action: 'approved',
        address: userAddress,
        role: normalizedRole
      });

      return { previousRequests };
    },
    onError: (err, variables, context) => {
      console.error('[useRoleRequests] Approval failed:', err);
      
      // Rollback to previous state if mutation fails
      if (context?.previousRequests) {
        setPendingRequests(context.previousRequests);
      }

      // Rollback optimistic update in ApprovedAccountsList
      eventBus.emit(EVENTS.ROLE_UPDATED, {
        action: 'rollback',
        address: variables.userAddress,
        role: variables.role.replace('_ROLE', '')
      });

      let errorMessage = 'La operación falló.';

      if (err instanceof Error) {
        if (err.message.includes('revert')) {
          errorMessage = 'La transacción fue revertida. Verifica permisos.';
        } else if (err.message.includes('user rejected')) {
          errorMessage = 'Transacción rechazada por el usuario.';
        } else if (err.message.includes('timeout')) {
          errorMessage = 'La transacción tardó demasiado en confirmarse. Verifica que Anvil esté ejecutándose correctamente.';
        } else if (err.message.includes('conexión')) {
          errorMessage = err.message;
        } else {
          errorMessage = err.message;
        }
      }

      toast({
        title: 'Error al aprobar',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  // Reject a role request
  const rejectMutation = useMutation({
    mutationFn: async (requestId: string) => {
      // Update request status to rejected
      setPendingRequests(prev => prev.filter(req => req.id !== requestId));
      
      toast({
        title: 'Solicitud rechazada',
        description: 'La solicitud ha sido eliminada de la lista.',
      });
    },
    onMutate: async (requestId) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.requests });
      const previousRequests = [...pendingRequests];

      setPendingRequests(prev => prev.filter(req => req.id !== requestId));

      return { previousRequests };
    },
    onError: (err, variables, context) => {
      if (context?.previousRequests) {
        setPendingRequests(context.previousRequests);
      }
      toast({
        title: 'Error al rechazar',
        description: 'No se pudo rechazar la solicitud.',
        variant: 'destructive',
      });
    },
  });

  // Delete a role request
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      setPendingRequests(prev => prev.filter(req => req.id !== id));
      
      toast({
        title: 'Éxito',
        description: 'Solicitud eliminada correctamente',
      });
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.requests });
      const previousRequests = [...pendingRequests];

      setPendingRequests(prev => prev.filter(req => req.id !== id));

      return { previousRequests };
    },
    onError: (err, variables, context) => {
      if (context?.previousRequests) {
        setPendingRequests(context.previousRequests);
      }
      toast({
        title: 'Error al eliminar',
        description: 'No se pudo eliminar la solicitud.',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.requests });
    }
  });

  return {
    requests: pendingRequests,
    addRequest,
    approveMutation,
    rejectMutation,
    deleteMutation
  };
}

// Re-export types
export type { RoleRequest as RoleRequestType };