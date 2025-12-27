'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { RoleRequest } from '@/types/role-request';
import { eventBus, EVENTS } from '@/lib/events';
import { useSupplyChainService } from '@/hooks/useSupplyChainService';
import { useState, useEffect } from 'react';

// Keys for React Query
const QUERY_KEYS = {
  requests: ['roleRequests'],
};

export function useRoleRequests() {
  const { toast } = useToast();
  const { grantRole } = useSupplyChainService();
  const queryClient = useQueryClient();

  // Local state for processed IDs to persist across reloads
  const [processedIds, setProcessedIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('processed_request_ids');
      if (stored) {
        setProcessedIds(JSON.parse(stored));
      }
    } catch {
      // Ignore error
    }
  }, []);

  const addProcessedId = (id: string) => {
    setProcessedIds(prev => {
      if (prev.includes(id)) return prev;
      const updated = [...prev, id];
      localStorage.setItem('processed_request_ids', JSON.stringify(updated));
      return updated;
    });
  };

  // 1. Fetch Requests (Source of Truth + Local Filter)
  const { data: rawRequests = [], isLoading: loading, refetch } = useQuery({
    queryKey: QUERY_KEYS.requests,
    queryFn: async () => {
      const response = await fetch('/api/role-requests', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Failed to fetch role requests');
      }
      return response.json() as Promise<RoleRequest[]>;
    },
    staleTime: 1000 * 60, // Cache for 1 minute
  });

  // Filter out locally processed requests
  const requests = rawRequests.filter(req => !processedIds.includes(req.id));

  // 2. Approve Mutation (Direct Transaction + Silent Cleanup + Local Persistence)
  const approveMutation = useMutation({
    mutationFn: async ({ requestId, role, userAddress }: { requestId: string, role: string, userAddress: string }) => {
      console.log(`[useRoleRequests] Approving request ${requestId}...`);

      // Mark as processed locally IMMEDIATELY
      addProcessedId(requestId);

      // Normalize role name (remove _ROLE suffix if present) to match roleUtils keys
      const normalizedRole = role.replace('_ROLE', '');
      console.log(`[useRoleRequests] Normalized role: ${role} -> ${normalizedRole}`);

      // A. Blockchain Transaction (The ONLY thing that matters for success)
      // useSupplyChainService.grantRole handles the hash lookup internally
      const result = await grantRole(normalizedRole, userAddress as `0x${string}`);
      if (!result.success || !result.hash) {
        throw new Error(result.error || 'Transaction failed');
      }
      const hash = result.hash;
      console.log('[useRoleRequests] Transaction submitted:', hash);

      // Fire-and-forget waiter for user feedback
      (async () => {
        try {
          const { waitForTransactionReceipt } = await import('@wagmi/core');
          const { config } = await import('@/lib/wagmi/config');
          await waitForTransactionReceipt(config, { hash });
          toast({
            title: 'Confirmado en Blockchain',
            description: 'La asignación de rol ha sido confirmada.',
            variant: 'default'
          });
        } catch (e) {
          console.error('Background receipt wait failed:', e);
        }
      })();

      // B. Server Cleanup (Silent Side Effect)
      // We try to delete the request from the pending list.
      // If this fails, we DO NOT fail the mutation, because the TX was sent.
      try {
        await fetch(`/api/role-requests/${requestId}`, {
          method: 'DELETE',
        });
      } catch (error) {
        console.warn('[useRoleRequests] Failed to clean up request from server, but TX was sent:', error);
      }

      return hash;
    },
    onMutate: async ({ requestId, role, userAddress }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.requests });

      // Snapshot previous value
      const previousRequests = queryClient.getQueryData<RoleRequest[]>(QUERY_KEYS.requests);

      // Optimistically update: Remove the request from the list immediately
      queryClient.setQueryData<RoleRequest[]>(QUERY_KEYS.requests, (old = []) =>
        old.filter(req => req.id !== requestId)
      );

      // Notify UI immediately
      toast({
        title: 'Transacción Enviada',
        description: `La asignación de rol se está procesando en la blockchain.`,
      });

      // Normalize role name for event emission
      const normalizedRole = role.replace('_ROLE', '');

      // Emit event for other components with details
      eventBus.emit(EVENTS.ROLE_UPDATED, {
        action: 'approved',
        address: userAddress,
        role: normalizedRole // Use normalized role (e.g. AUDITOR_HW)
      });

      return { previousRequests };
    },
    onError: (err, variables, context) => {
      console.error('[useRoleRequests] Approval failed:', err);
      // Only rollback if the BLOCKCHAIN transaction failed.
      if (context?.previousRequests) {
        queryClient.setQueryData(QUERY_KEYS.requests, context.previousRequests);
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
    onSettled: () => {
      // Do NOT invalidate queries immediately to preserve optimistic state
    },
  });

  // 3. Reject Mutation
  const rejectMutation = useMutation({
    mutationFn: async (requestId: string) => {
      // Mark as processed locally
      addProcessedId(requestId);

      const response = await fetch(`/api/role-requests/${requestId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' }),
      });
      if (!response.ok) throw new Error('Error al rechazar en el servidor');
    },
    onMutate: async (requestId) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.requests });
      const previousRequests = queryClient.getQueryData<RoleRequest[]>(QUERY_KEYS.requests);

      queryClient.setQueryData<RoleRequest[]>(QUERY_KEYS.requests, (old = []) =>
        old.filter(req => req.id !== requestId)
      );

      toast({
        title: 'Solicitud rechazada',
        description: 'La solicitud ha sido eliminada de la lista.',
      });

      return { previousRequests };
    },
    onError: (err, variables, context) => {
      if (context?.previousRequests) {
        queryClient.setQueryData(QUERY_KEYS.requests, context.previousRequests);
      }
      toast({
        title: 'Error al rechazar',
        description: 'No se pudo rechazar la solicitud.',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.requests });
    },
  });

  // 4. Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      addProcessedId(id);
      const response = await fetch(`/api/role-requests/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete request');
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.requests });
      const previousRequests = queryClient.getQueryData<RoleRequest[]>(QUERY_KEYS.requests);

      queryClient.setQueryData<RoleRequest[]>(QUERY_KEYS.requests, (old = []) =>
        old.filter(req => req.id !== id)
      );

      toast({
        title: 'Éxito',
        description: 'Solicitud eliminada correctamente',
      });

      return { previousRequests };
    },
    onError: (err, variables, context) => {
      if (context?.previousRequests) {
        queryClient.setQueryData(QUERY_KEYS.requests, context.previousRequests);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.requests });
    },
  });

  // Wrapper functions to match original interface
  const approveRequest = async (requestId: string, role: string, userAddress: string) => {
    console.log('⚡ approveRequest wrapper called', { requestId, role, userAddress });
    try {
      await approveMutation.mutateAsync({ requestId, role, userAddress });
      return true;
    } catch (e) {
      console.error('❌ approveRequest wrapper failed:', e);
      return false;
    }
  };

  const rejectRequest = async (requestId: string) => {
    try {
      await rejectMutation.mutateAsync(requestId);
      return true;
    } catch {
      return false;
    }
  };

  const deleteRequest = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      return true;
    } catch {
      return false;
    }
  };

  return {
    requests,
    loading,
    reload: () => refetch(),
    approveRequest,
    rejectRequest,
    deleteRequest,
  };
}