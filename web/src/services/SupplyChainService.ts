import { BaseContractService } from './contracts/base-contract.service';
import SupplyChainTrackerABI from '@/lib/contracts/abi/SupplyChainTracker.json';
import { NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS } from '@/lib/env';

// Tipos de retorno
interface TransactionResult {
  success: boolean;
  hash?: `0x${string}`;
  error?: string;
}

// Interface para el reporte de netbook
export interface Netbook {
  serialNumber: string;
  batchId: string;
  initialModelSpecs: string;
  hwAuditor: string;
  hwIntegrityPassed: boolean;
  hwReportHash: string;
  swTechnician: string;
  osVersion: string;
  swValidationPassed: boolean;
  destinationSchoolHash: string;
  studentIdHash: string;
  distributionTimestamp: string;
  currentState: string;
}

/**
 * Servicio principal para operaciones de la cadena de suministro
 */
export class SupplyChainService extends BaseContractService {
  static instance: SupplyChainService | null = null;
  // Servicio singleton
  static supplyChainService = SupplyChainService.getInstance();
  
  // Obtener instancia singleton
  static getInstance(): SupplyChainService {
    if (!SupplyChainService.instance) {
      SupplyChainService.instance = new SupplyChainService();
    }
    return SupplyChainService.instance;
  }
  
  constructor() {
    super(
      NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS as `0x${string}`,
      SupplyChainTrackerABI,
      'supply-chain'
    );
  }
  
  // Implementación de métodos abstractos
  protected async readContract({ address, abi, functionName, args }: {
    address: `0x${string}`;
    abi: any;
    functionName: string;
    args: any[];
  }) {
    const { publicClient } = await import('@/lib/blockchain/client');
    try {
      return await publicClient.readContract({
        address,
        abi,
        functionName,
        args
      });
    } catch (error) {
      throw new Error(`Error en readContract: ${error}`);
    }
  }
  
  protected async writeContract({ address, abi, functionName, args }: {
    address: `0x${string}`;
    abi: any;
    functionName: string;
    args: any[];
  }) {
    const { getWalletClient } = await import('@/lib/blockchain/client');
    try {
      const walletClient = await getWalletClient();
      const hash = await walletClient.writeContract({
        address,
        abi,
        functionName,
        args
      });
      return hash;
    } catch (error) {
      throw new Error(`Error en writeContract: ${error}`);
    }
  }
  
  protected async waitForTransactionReceipt({ hash, timeout }: {
    hash: `0x${string}`;
    timeout: number;
  }) {
    const { publicClient } = await import('@/lib/blockchain/client');
    try {
      return await publicClient.waitForTransactionReceipt({
        hash,
        timeout
      });
    } catch (error) {
      throw new Error(`Error en waitForTransactionReceipt: ${error}`);
    }
  }
  
  protected async getAddress(): Promise<string> {
    // En desarrollo, podríamos usar una cuenta predeterminada
    // En producción, esto vendría de la wallet conectada
    return '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'; // Cuenta 0 de Anvil
  }

  // Operaciones de netbooks
  
  /**
   * Registra una o múltiples netbooks
   * @param serials Números de serie
   * @param batches IDs de lote
   * @param specs Especificaciones del modelo
   * @returns Resultado de la transacción
   */
  registerNetbooks = async (serials: string[], batches: string[], specs: string[]): Promise<TransactionResult> => {
    try {
      const { hash } = await this.write('registerNetbooks', [serials, batches, specs]);
      
      // Esperar confirmación
      const receipt = await this.waitForTransaction(hash);
      
      // Invalidar caché
      this.invalidateCache('getAllSerialNumbers');
      this.invalidateCache('getNetbookState');
      
      return {
        success: true,
        hash
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  };

  /**
   * Realiza auditoría de hardware
   * @param serial Número de serie
   * @param passed Si pasó la auditoría
   * @param reportHash Hash del informe
   * @returns Resultado de la transacción
   */
  auditHardware = async (serial: string, passed: boolean, reportHash: string): Promise<TransactionResult> => {
    try {
      const { hash } = await this.write('auditHardware', [serial, passed, reportHash]);
      
      // Esperar confirmación
      const receipt = await this.waitForTransaction(hash);
      
      // Invalidar caché
      this.invalidateCache(`getNetbookState:${serial}`);
      this.invalidateCache(`getNetbookReport:${serial}`);
      
      return {
        success: true,
        hash
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  };

  /**
   * Valida software
   * @param serial Número de serie
   * @param osVersion Versión del sistema
   * @param passed Si pasó la validación
   * @returns Resultado de la transacción
   */
  validateSoftware = async (serial: string, osVersion: string, passed: boolean): Promise<TransactionResult> => {
    try {
      const { hash } = await this.write('validateSoftware', [serial, osVersion, passed]);
      
      // Esperar confirmación
      const receipt = await this.waitForTransaction(hash);
      
      // Invalidar caché
      this.invalidateCache(`getNetbookState:${serial}`);
      this.invalidateCache(`getNetbookReport:${serial}`);
      
      return {
        success: true,
        hash
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  };

  /**
   * Asigna netbook a estudiante
   * @param serial Número de serie
   * @param schoolHash Hash de la escuela
   * @param studentHash Hash del estudiante
   * @returns Resultado de la transacción
   */
  assignToStudent = async (serial: string, schoolHash: string, studentHash: string): Promise<TransactionResult> => {
    try {
      const { hash } = await this.write('assignToStudent', [serial, schoolHash, studentHash]);
      
      // Esperar confirmación
      const receipt = await this.waitForTransaction(hash);
      
      // Invalidar caché
      this.invalidateCache(`getNetbookState:${serial}`);
      this.invalidateCache(`getNetbookReport:${serial}`);
      
      return {
        success: true,
        hash
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  };

  // Operaciones de roles
  
  /**
   * Otorga un rol a una dirección
   * @param roleHash Hash del rol
   * @param userAddress Dirección del usuario
   * @returns Resultado de la transacción
   */
  grantRole = async (roleHash: `0x${string}`, userAddress: `0x${string}`): Promise<TransactionResult> => {
    try {
      const { hash } = await this.write('grantRole', [roleHash, userAddress]);
      
      // Esperar confirmación
      const receipt = await this.waitForTransaction(hash);
      
      // Invalidar caché
      this.invalidateCache(`hasRole:${roleHash}:${userAddress}`);
      this.invalidateCache('getAllRolesSummary');
      
      return {
        success: true,
        hash
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  };

  /**
   * Revoca un rol de una dirección
   * @param roleHash Hash del rol
   * @param userAddress Dirección del usuario
   * @returns Resultado de la transacción
   */
  revokeRole = async (roleHash: `0x${string}`, userAddress: `0x${string}`): Promise<TransactionResult> => {
    try {
      const { hash } = await this.write('revokeRole', [roleHash, userAddress]);
      
      // Esperar confirmación
      const receipt = await this.waitForTransaction(hash);
      
      // Invalidar caché
      this.invalidateCache(`hasRole:${roleHash}:${userAddress}`);
      this.invalidateCache('getAllRolesSummary');
      
      return {
        success: true,
        hash
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  };

  // Operaciones de lectura
  
  /**
   * Verifica si una cuenta tiene un rol específico
   * @param roleHash Hash del rol
   * @param userAddress Dirección del usuario
   * @returns True si la cuenta tiene el rol
   */
  hasRole = async (roleHash: `0x${string}`, userAddress: `0x${string}`): Promise<boolean> => {
    try {
      return await this.read<boolean>('hasRole', [roleHash, userAddress]);
    } catch (error) {
      console.error('Error checking role:', error);
      return false;
    }
  };

  /**
   * Obtiene el estado actual de una netbook
   * @param serial Número de serie
        * @returns Estado de la netbook
   */
  getNetbookReport = async (serial: string): Promise<Netbook> => {
    return await this.readCacheable(`getNetbookReport:${serial}`, () => 
      this.read('getNetbookReport', [serial])
    );
  }
}