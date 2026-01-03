"use client";

import { BaseContractService } from './contracts/base-contract.service';
import SupplyChainTrackerABI from '@/lib/contracts/abi/SupplyChainTracker.json';
import { NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS } from '@/lib/env';
import { anvil } from 'viem/chains';
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

    // Aseguramos que el ABI esté en formato de array
    const abi = Array.isArray(SupplyChainTrackerABI) ? SupplyChainTrackerABI : Object.values(SupplyChainTrackerABI).flat();

    super(
      NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS as `0x${string}`,
      abi,
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
        args,
        chain: anvil,
        account: (await this.getAddress()) as `0x${string}`
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
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && Array.isArray(accounts) && accounts.length > 0) {
          return accounts[0];
        }
      } catch (error) {
        console.error('Error requesting accounts:', error);
      }
    }
    throw new Error('No se encontró una cuenta conectada. Por favor conecta tu wallet.');
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

      // Mapeo de nombres de roles comunes a sus hashes, incluyendo variantes con y sin _ROLE
      const roleMap: Record<string, `0x${string}`> = {
        // Formas completas con _ROLE
        'FABRICANTE_ROLE': '0xbe0c84bfff967b2deb88bd0540d4a796d0ebfdcb72262ced26f1892b419e6457',
        'AUDITOR_HW_ROLE': '0xce753e7c853089350e34b8434ff812f399831b374f4519b7b881d82a3cf1b057',
        'TECNICO_SW_ROLE': '0xeeb4ddf6a0e2f06cb86713282a0b88ee789709e92a08b9e9b4ce816bbb13fcaf',
        'ESCUELA_ROLE': '0xa8f5858ea94a9ede7bc5dd04119dcc24b3b02a20be15d673993d8b6c2a901ef9',
        'ADMIN': '0x0000000000000000000000000000000000000000000000000000000000000000',

        // Formas abreviadas sin _ROLE (para compatibilidad)
        'FABRICANTE': '0xbe0c84bfff967b2deb88bd0540d4a796d0ebfdcb72262ced26f1892b419e6457',
        'AUDITOR_HW': '0xce753e7c853089350e34b8434ff812f399831b374f4519b7b881d82a3cf1b057',
        'TECNICO_SW': '0xeeb4ddf6a0e2f06cb86713282a0b88ee789709e92a08b9e9b4ce816bbb13fcaf',
        'ESCUELA': '0xa8f5858ea94a9ede7bc5dd04119dcc24b3b02a20be15d673993d8b6c2a901ef9'
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