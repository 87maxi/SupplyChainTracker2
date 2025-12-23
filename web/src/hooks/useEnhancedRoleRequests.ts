import { useState, useEffect } from 'react';
import { RoleRequest } from '@/types/role-request';
import { getRoleRequests, updateRoleRequestStatus } from '@/services/RoleRequestService';

export function useEnhancedRoleRequests() {
  const [requests, setRequests] = useState<RoleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const allRequests = await getRoleRequests();
      setRequests(allRequests);
      setLastUpdated(Date.now());
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

  const getPendingRequestsCount = () => {
    return requests.filter(req => req.status === 'pending').length;
  };

  const getApprovedRequests = () => {
    return requests.filter(req => req.status === 'approved');
  };

  const getRejectedRequests = () => {
    return requests.filter(req => req.status === 'rejected');
  };

  const getRequestById = (id: string) => {
    return requests.find(req => req.id === id);
  };

  const refreshRequests = async () => {
    await fetchRequests();
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchRequests();
    
    const interval = setInterval(() => {
      fetchRequests();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    requests,
    loading,
    error,
    lastUpdated,
    fetchRequests,
    approveRequest,
    rejectRequest,
    getPendingRequests,
    getPendingRequestsCount,
    getApprovedRequests,
    getRejectedRequests,
    getRequestById,
    refreshRequests
  };
}