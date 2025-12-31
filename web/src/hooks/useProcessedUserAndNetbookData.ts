import { useState, useEffect } from 'react';
import { Netbook } from '@/types/supply-chain-types';

interface ProcessedData {
  users: Array<{
    _id: string;
    address: string;
    role: string;
    status: string;
    approvedAt?: string;
    requestedOn: string;
    eventName?: string;
    timestamp?: string;
  }>;
  netbooks: Netbook[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook para obtener y procesar datos combinados de usuarios y netbooks desde MongoDB
 */
export const useProcessedUserAndNetbookData = (): ProcessedData => {
  const [users, setUsers] = useState<ProcessedData['users']>([]);
  const [netbooks, setNetbooks] = useState<Netbook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Obtener datos de usuarios y netbooks
      const [usersResponse, netbooksResponse] = await Promise.all([
        fetch('/api/fetch-users?limit=1000'), // Aumentar límite para obtener todos
        fetch('/api/fetch-netbooks?limit=1000')
      ]);

      if (!usersResponse.ok) {
        throw new Error(`Error ${usersResponse.status}: ${usersResponse.statusText}`);
      }

      if (!netbooksResponse.ok) {
        throw new Error(`Error ${netbooksResponse.status}: ${netbooksResponse.statusText}`);
      }

      const usersData = await usersResponse.json();
      const netbooksData = await netbooksResponse.json();

      if (!usersData.success) {
        throw new Error(usersData.error || 'Failed to fetch users');
      }

      if (!netbooksData.success) {
        throw new Error(netbooksData.error || 'Failed to fetch netbooks');
      }

      // Procesar netbooks para mapear al tipo Netbook esperado
      const processedNetbooks: Netbook[] = netbooksData.data.map((netbook) => {
        // Mapear estados de MongoDB a los estados del contrato
        const stateMapping: Record<string, string> = {
          'production': 'FABRICADA',
          'distribution': 'HW_APROBADO', 
          'retail': 'SW_VALIDADO',
          'sold': 'DISTRIBUIDA',
          'FABRICADA': 'FABRICADA',
          'HW_APROBADO': 'HW_APROBADO',
          'SW_VALIDADO': 'SW_VALIDADO',
          'DISTRIBUIDA': 'DISTRIBUIDA'
        };
        
        const currentState = stateMapping[netbook.status] || 'FABRICADA';
        
        return {
          serialNumber: netbook.serialNumber || '',
          currentState,
          manufacturer: netbook.manufacturer || '',
          model: netbook.model || '',
          hardwareSpecs: netbook.hardwareSpecs || {},
          softwareVersion: netbook.softwareVersion || '',
          distributionTimestamp: netbook.distributionTimestamp 
            ? Math.floor(new Date(netbook.distributionTimestamp).getTime() / 1000)
            : undefined,
          assignedTo: netbook.assignedTo || '',
          auditResults: netbook.auditResults || {},
          validationResults: netbook.validationResults || {}
        };
      });

      setUsers(usersData.data);
      setNetbooks(processedNetbooks);

    } catch (err) {
      console.error('Error fetching processed data:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    users,
    netbooks,
    isLoading,
    error,
    refetch: fetchData
  };
};