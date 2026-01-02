// web/src/services/SupplyChainService.ts
// Servicio combinado para operaciones de cadena de suministro
// Combina funcionalidades de role.service y supply-chain.service

import { RoleService , TransactionResult } from './contracts/role.service';
import { BaseContractService } from './contracts/base-contract.service';
import SupplyChainTrackerABI from '@/lib/contracts/abi/SupplyChainTracker.json';

// Asegurar que el directorio y archivo existan en el path correcto
import { NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS } from '@/lib/env';
import { Address } from 'viem';
import { AllRolesSummary } from '@/types/supply-chain-types';

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

// Clase principal que combina todas las funcionalidades
export class SupplyChainService extends RoleService {
  private readonly logger = console;

  constructor() {
    super();
    this.initializeContract(
      NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS as `0x${string}`,
      SupplyChainTrackerABI
    );
  }

  // Operaciones de netbooks - heredadas de RoleService y extendidas
  
  // Registro de netbooks
  registerNetbooks = async (serials: string[], batches: string[], specs: string[], userAddress: Address): Promise<TransactionResult> => {
    try {
      const { hash } = await this.write('registerNetbooks', [serials, batches, specs]);
      const receipt = await this.waitForTransaction(hash);
      
      return {
        success: true,
        hash
      };
    } catch (error) {
      this.logger.error('[SupplyChainService] Error en registerNetbooks:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  };

  // Auditoría de hardware
  auditHardware = async (serial: string, passed: boolean, reportHash: string, userAddress: Address): Promise<TransactionResult> => {
    try {
      const { hash } = await this.write('auditHardware', [serial, passed, reportHash]);
      const receipt = await this.waitForTransaction(hash);
      
      return {
        success: true,
        hash
      };
    } catch (error) {
      this.logger.error('[SupplyChainService] Error en auditHardware:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  };

  // Validación de software
  validateSoftware = async (serial: string, osVersion: string, passed: boolean, userAddress: Address): Promise<TransactionResult> => {
    try {
      const { hash } = await this.write('validateSoftware', [serial, osVersion, passed]);
      const receipt = await this.waitForTransaction(hash);
      
      return {
        success: true,
        hash
      };
    } catch (error) {
      this.logger.error('[SupplyChainService] Error en validateSoftware:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  };

  // Asignación a estudiante
  assignToStudent = async (serial: string, schoolHash: string, studentHash: string, userAddress: Address): Promise<TransactionResult> => {
    try {
      const { hash } = await this.write('assignToStudent', [serial, schoolHash, studentHash]);
      const receipt = await this.waitForTransaction(hash);
      
      return {
        success: true,
        hash
      };
    } catch (error) {
      this.logger.error('[SupplyChainService] Error en assignToStudent:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  };

  // Operaciones de lectura - solo interfaz
  getAllSerialNumbers = async (): Promise<string[]> => {
    return await this.read('getAllSerialNumbers', []);
  };

  getNetbookState = async (serial: string): Promise<string> => {
    return await this.read('getNetbookState', [serial]);
  };

  getNetbookReport = async (serial: string): Promise<Netbook> => {
    return await this.read('getNetbookReport', [serial]);
  };
  
  getNetbooksByState = async (state: number): Promise<string[]> => {
    return await this.read('getNetbooksByState', [state]);
  };

  // Método combinado para obtener resumen de todos los roles
  getAllRolesSummary = async (): Promise<AllRolesSummary | null> => {
    try {
      return await super.getAllRolesSummary();
    } catch (error) {
      this.logger.error('[SupplyChainService] Error en getAllRolesSummary:', error);
      return null;
    }
  };
}

// Exportar servicio singleton
export const supplyChainService = new SupplyChainService();

// Mantener exportaciones individuales para compatibilidad hacia atrás
export const {
  hasRole,
  grantRole,
  revokeRole,
  registerNetbooks,
  auditHardware,
  validateSoftware,
  assignToStudent,
  getNetbookState,
  getNetbookReport,
  getAllSerialNumbers,
  getNetbooksByState,
  getAllRolesSummary
} = supplyChainService;