import { AuditLog } from '@/types/audit';

// Servicio para gestionar eventos y logs de auditoría
export const getEventService = async () => {
  return {
    getAuditLogs: async (): Promise<AuditLog[]> => {
      try {
        const response = await fetch('/api/admin/audit-logs');
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch audit logs');
        }
        
        return data.data || [];
      } catch (error) {
        console.error('Error fetching audit logs:', error);
        return [];
      }
    }
  };
};