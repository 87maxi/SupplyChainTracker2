'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { eventBus, EVENTS } from '@/lib/events';
import { useSupplyChainService } from '@/hooks/useSupplyChainService';
import { useState, useEffect } from 'react';
import { roleMapper } from '@/lib/roleMapping';

// Types for role requests
export interface RoleRequest {
  id: string;
  address: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: number;
  signature?: string;
}

// Keys for React Query
const QUERY_KEYS = {
  requests: ['roleRequests'],
};

export function useRoleRequests() {
  const { toast } = useToast();
  const supplyChainService = useSupplyChainService();
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
        const pending = requests.filter((req: RoleRequest) => req.status === 'pending');
        setPendingRequests(pending);
      }
    } catch (error) {
      console.error('Error loading role requests from localStorage:', error);
      // Initialize with empty array if parsing fails
      setPendingRequests([]);
    }
  }, []);

  // Save requests to localStorage whenever they change
  useEffect(() => {
    try {
      // Get all requests (including non-pending) from localStorage
      const stored = localStorage.getItem('role_requests');
      const allRequests = stored ? JSON.parse(stored) : [];
      
      // Update pending requests
      const updatedRequests = allRequests.map((req: RoleRequest) => 
        pendingRequests.find(p => p.id === req.id) || req
      );
      
      // Add new pending requests
      pendingRequests.forEach(req => {
        if (!updatedRequests.find((r: RoleRequest) => r.id === req.id)) {
          updatedRequests.push(req);
        }
      });
      
      localStorage.setItem('role_requests', JSON.stringify(updatedRequests));
    } catch (error) {
      console.error('Error saving role requests to localStorage:', error);
    }
  }, [pendingRequests]);

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

  // Approve a role request
  const approveMutation = useMutation({
    mutationFn: async ({ requestId, role, userAddress }: { requestId: string, role: string, userAddress: string }) => {
      console.log(`[useRoleRequests] Approving request ${requestId}...`);

      // Remove _ROLE suffix from role to match contract's expected parameter
      // Convert to uppercase as contract expects
      const normalizedRole = role.replace('_ROLE', '').toUpperCase();
      console.log(`[useRoleRequests] Using role name: ${normalizedRole}`);
      
      // Blockchain Transaction
      const result = await supplyChainService.grantRole(normalizedRole, userAddress as `0x\${string}`);
      if (!result.success || !result.hash) {
        throw new Error(result.error || 'Transaction failed');
      }
      const hash = result.hash;
      console.log('[useRoleRequests] Transaction submitted:', hash);

      // Wait for transaction confirmation
      try {
        // Use the standardized wait for transaction receipt from grantRole
        console.log('[useRoleRequests] Transaction confirmed on blockchain');
        
        toast({
          title: 'Confirmado en Blockchain',
          description: 'La asignación de rol ha sido confirmada.',
          variant: 'default'
        });
      } catch (e) {
        console.error('Transaction confirmation failed:', e);
        throw e;
      }

      // Update request status to approved
      setPendingRequests(prev => prev.filter(req => req.id !== requestId));

      return hash;
    },
    onMutate: async ({ requestId, role, userAddress }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.requests });

      // Snapshot previous value
      const previousRequests = [...pendingRequests];

      // Optimistically remove the request
      setPendingRequests(prev => prev.filter(req => req.id !== requestId));

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