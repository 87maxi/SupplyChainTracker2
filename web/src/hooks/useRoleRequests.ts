import { useState, useEffect } from 'react';
import { RoleRequest } from '@/types/role-request';
import { getRoleRequests, updateRoleRequestStatus } from '@/services/RoleRequestService';

export function useRoleRequests() {
  const [requests, setRequests] = useState<RoleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const allRequests = await getRoleRequests();
      setRequests(allRequests);
    } catch (err) {
      console.error('Error fetching role requests:', err);
      setError('No se pudieron cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async (id: string) => {
    try {
      await updateRoleRequestStatus(id, 'approved');
      setRequests(prev => prev.map(req => 
        req.id === id ? { ...req, status: 'approved' } : req
      ));
      return { success: true };
    } catch (err) {
      console.error('Error approving request:', err);
      return { success: false, error: 'No se pudo aprobar la solicitud' };
    }
  };

  const rejectRequest = async (id: string) => {
    try {
      await updateRoleRequestStatus(id, 'rejected');
      setRequests(prev => prev.map(req => 
        req.id === id ? { ...req, status: 'rejected' } : req
      ));
      return { success: true };
    } catch (err) {
      console.error('Error rejecting request:', err);
      return { success: false, error: 'No se pudo rechazar la solicitud' };
    }
  };

  const getPendingRequests = () => {
    return requests.filter(req => req.status === 'pending');
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return {
    requests,
    loading,
    error,
    fetchRequests,
    approveRequest,
    rejectRequest,
    getPendingRequests
  };
}