'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { RoleRequest } from '@/types/role-request';

// Client-side hook to interact with the server-side role request service
export function useRoleRequests() {
  const [requests, setRequests] = useState<RoleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch all role requests
  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/role-requests');
      if (!response.ok) {
        throw new Error('Failed to fetch role requests');
      }
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching role requests:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las solicitudes de rol',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Update request status (approve/reject)
  const updateRequestStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`/api/role-requests/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update request status: ${status}`);
      }

      // Update local state
      setRequests(prev => 
        prev.map(req => 
          req.id === id ? { ...req, status } : req
        )
      );
      
      toast({
        title: 'Éxito',
        description: `Solicitud actualizada correctamente a ${status}`,
      });
      
      return true;
    } catch (error) {
      console.error('Error updating request status:', error);
      toast({
        title: 'Error',
        description: `No se pudo actualizar la solicitud a ${status}`,
        variant: 'destructive',
      });
      return false;
    }
  };

  // Delete a request
  const deleteRequest = async (id: string) => {
    try {
      const response = await fetch(`/api/role-requests/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete request');
      }

      // Update local state
      setRequests(prev => prev.filter(req => req.id !== id));
      
      toast({
        title: 'Éxito',
        description: 'Solicitud eliminada correctamente',
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting request:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la solicitud',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchRequests();
    
    // Set up polling to check for new requests every 30 seconds
    const interval = setInterval(() => {
      fetchRequests();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    requests,
    loading,
    reload: fetchRequests,
    updateRequestStatus,
    deleteRequest,
  };
}