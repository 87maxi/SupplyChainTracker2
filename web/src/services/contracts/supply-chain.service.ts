// web/src/services/contracts/supply-chain.service.ts

import { BaseContractService } from './base-contract.service';
import SupplyChainTrackerABI from '@/contracts/abi/SupplyChainTracker.json';
import { NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS } from '@/lib/env';
import { 
  Netbook, 
  NetbookState, 
  ContractRoles 
} from '@/types/supply-chain-types';
// Import MongoDB service
import { RoleDataService } from "@/services/RoleDataService";
import { 
  RegisterNetbooksSchema, 
  AuditHardwareSchema,
  ValidateSoftwareSchema,
  AssignToStudentSchema
} from '@/lib/validation/schemas';
import { z } from 'zod';
import { Address } from 'viem';

// Validaciones
const validateRegisterInput = z.object({
  serials: z.array(z.string()).min(1),
  batches: z.array(z.string()),
  specs: z.array(z.string())
}).refine(data => 
  data.serials.length === data.batches.length && 
  data.serials.length === data.specs.length,
  {
    message: 'Los arrays deben tener la misma longitud'
  }
);

// Tipos de retorno
interface TransactionResult {
  success: boolean;
  hash?: `0x${string}`;
  error?: string;
}

interface RoleMembersResult {
  role: ContractRoles;
  members: string[];
  count: number;
}

/**
 * Servicio para interactuar con el contrato SupplyChainTracker
 */
export class SupplyChainService extends BaseContractService {
  constructor() {
    super(
      NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS as `0x${string}`,
      SupplyChainTrackerABI,
      'supplychain'
    );
  }

  /**
   * Registra múltiples netbooks en el contrato
   * @param serials Array de números de serie
   * @param batches Array de IDs de lote
   * @param specs Array de especificaciones del modelo
   * @param userAddress Dirección del usuario
   * @returns Resultado de la transacción
   */
  async registerNetbooks(
    serials: string[], 
    batches: string[], 
    specs: string[],
    userAddress: string
  ): Promise<TransactionResult> {
    try {
      // Validar entrada
      validateRegisterInput.parse({ serials, batches, specs });
      
      // Realizar transacción
      const { hash } = await this.write('registerNetbooks', [serials, batches, specs]);
      
      // Esperar confirmación
      const receipt = await this.waitForTransaction(hash);
      
      // Save to MongoDB
      try {
        await RoleDataService.saveNetbookData({
          serialNumber: serials[0], // Using first serial as reference
          transactionHash: hash,
          role: 'FABRICANTE_ROLE' as ContractRoles,
          userAddress,
          data: { serials, batches, specs },
          timestamp: new Date()
        });
      } catch (mongoError) {
        console.error('Error saving to MongoDB:', mongoError);
      }
      
      // Invalidar caché relacionada
      this.invalidateCache('getNetbook');
      this.invalidateCache('getAllSerialNumbers');
      
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
  }

  /**
   * Auditoría del hardware de una netbook
   * @param serial Número de serie
   * @param passed Si el hardware pasó la auditoría
   * @param reportHash Hash del informe de auditoría
   * @param userAddress Dirección del usuario
   * @returns Resultado de la transacción
   */
  async auditHardware(
    serial: string,
    passed: boolean,
    reportHash: string,
    userAddress: string
  ): Promise<TransactionResult> {
    try {
      // Validar entrada
      AuditHardwareSchema.parse({ serial, passed, reportHash });
      
      // Realizar transacción
      const { hash } = await this.write('auditHardware', [serial, passed, reportHash]);
      
      // Esperar confirmación
      const receipt = await this.waitForTransaction(hash);
      
      // Save to MongoDB
      try {
        await RoleDataService.saveNetbookData({
          serialNumber: serial,
          transactionHash: hash,
          role: 'AUDITOR_HW_ROLE' as ContractRoles,
          userAddress,
          data: { passed, reportHash },
          timestamp: new Date()
        });
      } catch (mongoError) {
        console.error('Error saving to MongoDB:', mongoError);
      }
      
      // Invalidar caché
      this.invalidateCache(`getNetbook:${serial}`);
      
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
  }

  /**
   * Validación del software de una netbook
   * @param serial Número de serie
   * @param osVersion Versión del sistema operativo
   * @param passed Si el software pasó la validación
   * @param userAddress Dirección del usuario
   * @returns Resultado de la transacción
   */
  async validateSoftware(
    serial: string,
    osVersion: string,
    passed: boolean,
    userAddress: string
  ): Promise<TransactionResult> {
    try {
      // Validar entrada
      ValidateSoftwareSchema.parse({ serial, osVersion, passed });
      
      // Realizar transacción
      const { hash } = await this.write('validateSoftware', [serial, osVersion, passed]);
      
      // Esperar confirmación
      const receipt = await this.waitForTransaction(hash);
      
      // Save to MongoDB
      try {
        await RoleDataService.saveNetbookData({
          serialNumber: serial,
          transactionHash: hash,
          role: 'TECNICO_SW_ROLE' as ContractRoles,
          userAddress,
          data: { osVersion, passed },
          timestamp: new Date()
        });
      } catch (mongoError) {
        console.error('Error saving to MongoDB:', mongoError);
      }
      
      // Invalidar caché
      this.invalidateCache(`getNetbook:${serial}`);
      
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
  }

  /**
   * Asignación de una netbook a un estudiante
   * @param serial Número de serie
   * @param schoolHash Hash de la escuela
   * @param studentHash Hash del estudiante
   * @param userAddress Dirección del usuario
   * @returns Resultado de la transacción
   */
  async assignToStudent(
    serial: string,
    schoolHash: string,
    studentHash: string,
    userAddress: string
  ): Promise<TransactionResult> {
    try {
      // Validar entrada
      AssignToStudentSchema.parse({ serial, schoolHash, studentHash });
      
      // Realizar transacción
      const { hash } = await this.write('assignToStudent', [serial, schoolHash, studentHash]);
      
      // Esperar confirmación
      const receipt = await this.waitForTransaction(hash);
      
      // Save to MongoDB
      try {
        await RoleDataService.saveNetbookData({
          serialNumber: serial,
          transactionHash: hash,
          role: 'ESCUELA_ROLE' as ContractRoles,
          userAddress,
          data: { schoolHash, studentHash },
          timestamp: new Date()
        });
      } catch (mongoError) {
        console.error('Error saving to MongoDB:', mongoError);
      }
      
      // Invalidar caché
      this.invalidateCache(`getNetbook:${serial}`);
      
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
  }

  /**
   * Obtiene el estado actual de una netbook
   * @param serial Número de serie
   * @returns Estado de la netbook
   */
  async getNetbookState(serial: string): Promise<NetbookState> {
    // Validar entrada
    z.string().min(1).parse(serial);
    
    // Leer estado
    const result = await this.read<number>('getNetbookState', [serial]);
    
    // Mapear número a estado
    const states: NetbookState[] = ['FABRICADA', 'HW_APROBADO', 'SW_VALIDADO', 'DISTRIBUIDA'];
    return states[result];
  }

  /**
   * Obtiene el reporte completo de una netbook
   * @param serial Número de serie
   * @returns Reporte completo de la netbook
   */
  async getNetbookReport(serial: string): Promise<Netbook> {
    // Validar entrada
    z.string().min(1).parse(serial);
    
    // Leer reporte
    const result = await this.read<Record<string, unknown>>('getNetbookReport', [serial]);
    
    // Transformar datos
    const states: NetbookState[] = ['FABRICADA', 'HW_APROBADO', 'SW_VALIDADO', 'DISTRIBUIDA'];
    
    return {
      serialNumber: result.serialNumber,
      batchId: result.batchId,
      initialModelSpecs: result.initialModelSpecs,
      hwAuditor: result.hwAuditor,
      hwIntegrityPassed: result.hwIntegrityPassed,
      hwReportHash: result.hwReportHash,
      swTechnician: result.swTechnician,
      osVersion: result.osVersion,
      swValidationPassed: result.swValidationPassed,
      destinationSchoolHash: result.destinationSchoolHash,
      studentIdHash: result.studentIdHash,
      distributionTimestamp: result.distributionTimestamp.toString(),
      currentState: states[result.currentState]
    };
  }

  /**
   * Obtiene todos los números de serie registrados
   * @returns Array de números de serie
   */
  async getAllSerialNumbers(): Promise<string[]> {
    // Leer todos los números de serie
    const result = await this.read<string[]>('getAllSerialNumbers', []);
    return result;
  }

  /**
   * Obtiene todas las netbooks por estado
   * @param state Estado de las netbooks a obtener
   * @returns Array de números de serie
   */
  async getNetbooksByState(state: number): Promise<string[]> {
    // Leer netbooks por estado
    const result = await this.read<string[]>('getNetbooksByState', [state]);
    return result;
  }

  /**
   * Obtiene todos los miembros de un rol
   * @param roleHash Hash del rol
   * @returns Array de direcciones de miembros
   */
  async getAllMembers(roleHash: string): Promise<string[]> {
    // Leer todos los miembros del rol
    const result = await this.read<string[]>('getAllMembers', [roleHash]);
    return result;
  }

  /**
   * Obtiene los miembros de un rol
   * @param roleHash Hash del rol
   * @returns Array de direcciones de miembros
   */
  async getRoleMembers(roleHash: string): Promise<string[]> {
    // Leer miembros del rol
    const result = await this.read<string[]>('getRoleMembers', [roleHash]);
    return result;
  }
}
