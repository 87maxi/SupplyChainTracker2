import { useState, useEffect, useCallback } from 'react';
import { Netbook } from '@/types/supply-chain-types';
import { SupplyChainService } from '@/services/SupplyChainService';

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
 * Hook para obtener y procesar datos combinados de usuarios y netbooks desde la Blockchain
 */
export const useProcessedUserAndNetbookData = (): ProcessedData => {
  const [users, setUsers] = useState<ProcessedData['users']>([]);
  const [netbooks, setNetbooks] = useState<Netbook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const service = SupplyChainService.getInstance();

      // 1. Obtener todos los números de serie
      const serials = await service.getAllSerialNumbers();

      // 2. Obtener detalles de cada netbook
      const netbookPromises = serials.map(async (serial) => {
        try {
          // Obtenemos el reporte crudo del contrato
          const report: any = await service.getNetbookReport(serial);

          // Mapeo de estados (enum a string)
          const states = ['FABRICADA', 'HW_APROBADO', 'SW_VALIDADO', 'DISTRIBUIDA'];
          const currentStateStr = states[Number(report.currentState)] || 'UNKNOWN';

          // Mapeo al tipo Netbook de la UI
          return {
            serialNumber: report.serialNumber,
            batchId: report.batchId,
            initialModelSpecs: report.initialModelSpecs,
            hwAuditor: report.hwAuditor,
            hwIntegrityPassed: report.hwIntegrityPassed,
            hwReportHash: report.hwReportHash,
            swTechnician: report.swTechnician,
            osVersion: report.osVersion,
            swValidationPassed: report.swValidationPassed,
            destinationSchoolHash: report.destinationSchoolHash,
            studentIdHash: report.studentIdHash,
            distributionTimestamp: report.distributionTimestamp.toString(),
            currentState: currentStateStr
          } as Netbook;
        } catch (e) {
          console.error(`Error fetching report for ${serial}:`, e);
          return null;
        }
      });

      const fetchedNetbooks = (await Promise.all(netbookPromises)).filter((n): n is Netbook => n !== null);

      // Ordenar por timestamp descendente (más recientes primero)
      fetchedNetbooks.sort((a, b) => {
        const timeA = Number(a.distributionTimestamp);
        const timeB = Number(b.distributionTimestamp);
        return timeB - timeA;
      });

      setNetbooks(fetchedNetbooks);

      // Por ahora mantenemos usuarios vacíos o podríamos obtenerlos de los eventos de roles si fuera necesario
      setUsers([]);

    } catch (err) {
      console.error('Error fetching blockchain data:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    users,
    netbooks,
    isLoading,
    error,
    refetch: fetchData
  };
};