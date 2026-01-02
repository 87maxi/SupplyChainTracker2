"use client";

import { BaseContractService } from './contracts/base-contract.service';
import SupplyChainTrackerABI from '@/lib/contracts/abi/SupplyChainTracker.json';
import { NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS } from '@/lib/env';
import { contractRegistry, ContractConfig } from './contract-registry.service';

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
  // Obtener instancia singleton
  static getInstance(): SupplyChainService {
    if (!SupplyChainService.instance) {
      SupplyChainService.instance = new SupplyChainService();
    }
    return SupplyChainService.instance;
  }
  
  // Servicio singleton - now using a getter to ensure proper initialization
  static get supplyChainService(): SupplyChainService {
    return SupplyChainService.getInstance();
  }
  
  constructor() {
    // Validar que la dirección del contrato esté disponible
    if (!NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS) {
      console.error('❌ NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS no está configurado');
      throw new Error('La dirección del contrato no está configurada. Verifique el archivo .env.local');
    }

    super(
      NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS as `0x${string}`,
      SupplyChainTrackerABI,
      'supply-chain'
    );

    console.log('✅ SupplyChainService inicializado con dirección:', this.contractAddress);
    
    // Registrar este contrato en el registro
    const config: ContractConfig = {
      address: this.contractAddress,
      abi: this.abi,
      version: '1.0.0'
    };
    contractRegistry.register('SupplyChainTracker', this, config);
  }
  
  // Reemplazo de métodos abstractos de BaseContractService
  protected async readContract({
    address,
    abi,
    functionName,
    args
  }: {
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
      console.error('Error en readContract:', error);
      throw error;
    }
  }
  
  protected async writeContract({
    address,
    abi,
    functionName,
    args
  }: {
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
      console.error('Error en writeContract:', error);
      throw error;
    }
  }
  
  protected async waitForTransactionReceipt({
    hash,
    timeout
  }: {
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
      console.error('Error en waitForTransactionReceipt:', error);
      throw error;
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
  registerNetbooks = async (serials: string[], batches: string[], specs: string[], metadata: string[]): Promise<TransactionResult> => {
    try {
      const { hash } = await this.write('registerNetbooks', [serials, batches, specs, metadata]);
      
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
  auditHardware = async (serial: string, passed: boolean, reportHash: string, metadata: string): Promise<TransactionResult> => {
    try {
      const { hash } = await this.write('auditHardware', [serial, passed, reportHash, metadata]);
      
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
  validateSoftware = async (serial: string, osVersion: string, passed: boolean, metadata: string): Promise<TransactionResult> => {
    try {
      const { hash } = await this.write('validateSoftware', [serial, osVersion, passed, metadata]);
      
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
  assignToStudent = async (serial: string, schoolHash: string, studentHash: string, metadata: string): Promise<TransactionResult> => {
    try {
      const { hash } = await this.write('assignToStudent', [serial, schoolHash, studentHash, metadata]);
      
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
  };

  /**
   * Obtiene el hash del rol por nombre
   * @param roleType Tipo de rol
   * @returns Hash del rol
   */
  getRoleByName = async (roleType: string): Promise<`0x${string}`> => {
    try {
      // En lugar de consultar al contrato, usamos las constantes predefinidas
      const roleTypeUpper = roleType.toUpperCase();
      
      // Mapeo de nombres de roles comunes a sus hashes
      const roleMap: Record<string, `0x${string}`> = {
        'FABRICANTE': '0xdf8b4c520affe6d5bd668f8a16ff439b2b3fe20527c8a5d5d7cd0f17c3aa9c5d',
        'AUDITOR_HW': '0xed8e002819d8cf1a851ca1db7d19c6848d2559e61bf51cf90a464bd116556c00',
        'TECNICO_SW': '0x2ed8949af5557e2edaec784b826d9da85a22565588342ae7b736d3e8ebd76bfe',
        'ESCUELA': '0x88a49b04486bc479c925034ad3947fb7a1dc63c11a4fc29c186b7efde141b141',
        'ADMIN': '0x0000000000000000000000000000000000000000000000000000000000000000'
      };
      
      const hash = roleMap[roleTypeUpper];
      if (!hash) {
        throw new Error(`Role type not found: ${roleType}`);
      }
      
      return hash;
    } catch (error) {
      console.error('Error getting role by name:', error);
      throw error;
    }
  };

  /**
   * Verifica si una cuenta tiene un rol específico por nombre
   * @param roleName Nombre del rol
   * @param userAddress Dirección del usuario
   * @returns True si la cuenta tiene el rol
   */
  hasRoleByName = async (roleName: string, userAddress: `0x${string}`): Promise<boolean> => {
    try {
      const roleHash = await this.getRoleByName(roleName);
      return await this.hasRole(roleHash, userAddress);
    } catch (error) {
      console.error('Error checking role by name:', error);
      return false;
    }
  };

  /**
   * Otorga un rol a una dirección por nombre
   * @param roleName Nombre del rol
   * @param userAddress Dirección del usuario
   * @returns Resultado de la transacción
   */
  grantRoleByName = async (roleName: string, userAddress: `0x${string}`): Promise<TransactionResult> => {
    try {
      const roleHash = await this.getRoleByName(roleName);
      return await this.grantRole(roleHash, userAddress);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  };

  /**
   * Revoca un rol de una dirección por nombre
   * @param roleName Nombre del rol
   * @param userAddress Dirección del usuario
   * @returns Resultado de la transacción
   */
  revokeRoleByName = async (roleName: string, userAddress: `0x${string}`): Promise<TransactionResult> => {
    try {
      const roleHash = await this.getRoleByName(roleName);
      return await this.revokeRole(roleHash, userAddress);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}