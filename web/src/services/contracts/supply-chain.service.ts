// web/src/services/contracts/supply-chain.service.ts

import { BaseContractService } from './base-contract.service';
import SupplyChainTrackerABI from '../../../contracts/abi/SupplyChainTracker.json';
import { NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS } from '@/lib/env';
import { 
  Netbook, 
  NetbookState, 
  ContractRoles 
} from '@/types/supply-chain-types';
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
   * Verifica si una dirección tiene un rol específico
   * @param roleHash Hash del rol
   * @param userAddress Dirección del usuario
   * @returns True si el usuario tiene el rol
   */
  hasRole = async (roleHash: `0x${string}`, userAddress: Address): Promise<boolean> => {
    try {
      return await this.read<boolean>('hasRole', [roleHash, userAddress]);
    } catch (error) {
      console.error('Error in hasRole:', error);
      return false;
    }
  }

  /**
   * Registra múltiples netbooks en el contrato
   * @param serials Array de números de serie
   * @param batches Array de IDs de lote
   * @param specs Array de especificaciones del modelo
   * @param userAddress Dirección del usuario
   * @returns Resultado de la transacción
   */
  registerNetbooks = async (
    serials: string[], 
    batches: string[], 
    specs: string[],
    userAddress: Address
  ): Promise<TransactionResult> => {
    try {
      // Validar entrada
      validateRegisterInput.parse({ serials, batches, specs });
      
      // Realizar transacción
      const { hash } = await this.write(
        'registerNetbooks', 
        [serials, batches, specs],
        {
          role: 'FABRICANTE_ROLE',
          userAddress: userAddress,
          relatedSerial: serials[0] // Usar el primer serial como referencia
        }
      );
      
      // Esperar confirmación
      const receipt = await this.waitForTransaction(hash);
      
      // Save to MongoDB via API route
      try {
        await fetch('/api/mongodb/supply-chain-actions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            serials,
            transactionHash: hash,
            role: 'FABRICANTE_ROLE',
            userAddress,
            data: { batches, specs }
          })
        });
      } catch (apiError) {
        console.error('Error saving to MongoDB via API:', apiError);
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
  auditHardware = async (
    serial: string,
    passed: boolean,
    reportHash: string,
    userAddress: Address
  ): Promise<TransactionResult> => {
    try {
      // Validar entrada
      AuditHardwareSchema.parse({ serial, passed, reportHash });
      
      // Realizar transacción
      const { hash } = await this.write(
        'auditHardware', 
        [serial, passed, reportHash],
        {
          role: 'AUDITOR_HW_ROLE',
          userAddress: userAddress,
          relatedSerial: serial
        }
      );
      
      // Esperar confirmación
      const receipt = await this.waitForTransaction(hash);
      
      // Save to MongoDB via API route
      try {
        await fetch('/api/mongodb/supply-chain-actions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            serialNumber: serial,
            transactionHash: hash,
            role: 'AUDITOR_HW_ROLE',
            userAddress,
            data: { passed, reportHash }
          })
        });
      } catch (apiError) {
        console.error('Error saving to MongoDB via API:', apiError);
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
  validateSoftware = async (
    serial: string,
    osVersion: string,
    passed: boolean,
    userAddress: Address
  ): Promise<TransactionResult> => {
    try {
      // Validar entrada
      ValidateSoftwareSchema.parse({ serial, osVersion, passed });
      
      // Realizar transacción
      const { hash } = await this.write(
        'validateSoftware', 
        [serial, osVersion, passed],
        {
          role: 'TECNICO_SW_ROLE',
          userAddress: userAddress,
          relatedSerial: serial
        }
      );
      
      // Esperar confirmación
      const receipt = await this.waitForTransaction(hash);
      
      // Save to MongoDB via API route
      try {
        await fetch('/api/mongodb/supply-chain-actions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            serialNumber: serial,
            transactionHash: hash,
            role: 'TECNICO_SW_ROLE',
            userAddress,
            data: { osVersion, passed }
          })
        });
      } catch (apiError) {
        console.error('Error saving to MongoDB via API:', apiError);
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
  assignToStudent = async (
    serial: string,
    schoolHash: string,
    studentHash: string,
    userAddress: Address
  ): Promise<TransactionResult> => {
    try {
      // Validar entrada
      AssignToStudentSchema.parse({ serial, schoolHash, studentHash });
      
      // Realizar transacción
      const { hash } = await this.write(
        'assignToStudent', 
        [serial, schoolHash, studentHash],
        {
          role: 'ESCUELA_ROLE',
          userAddress: userAddress,
          relatedSerial: serial
        }
      );
      
      // Esperar confirmación
      const receipt = await this.waitForTransaction(hash);
      
      // Save to MongoDB via API route
      try {
        await fetch('/api/mongodb/supply-chain-actions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            serialNumber: serial,
            transactionHash: hash,
            role: 'ESCUELA_ROLE',
            userAddress,
            data: { schoolHash, studentHash }
          })
        });
      } catch (apiError) {
        console.error('Error saving to MongoDB via API:', apiError);
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
  getNetbookState = async (serial: string): Promise<NetbookState> => {
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
  getNetbookReport = async (serial: string): Promise<Netbook> => {
    // Validar entrada
    z.string().min(1).parse(serial);
    
    // Leer reporte
    const result = await this.read<Netbook>('getNetbookReport', [serial]);
    
    // Asegurar que distributionTimestamp sea string
    const distributionTimestamp = typeof result.distributionTimestamp === 'string' 
      ? result.distributionTimestamp 
      : typeof result.distributionTimestamp === 'number' 
        ? result.distributionTimestamp.toString() 
        : '0';

    // Transformar datos
    const states: NetbookState[] = ['FABRICADA', 'HW_APROBADO', 'SW_VALIDADO', 'DISTRIBUIDA'];
    
    return {
      serialNumber: typeof result.serialNumber === 'string' ? result.serialNumber : '',
      batchId: typeof result.batchId === 'string' ? result.batchId : '',
      initialModelSpecs: typeof result.initialModelSpecs === 'string' ? result.initialModelSpecs : '',
      hwAuditor: typeof result.hwAuditor === 'string' ? result.hwAuditor : '',
      hwIntegrityPassed: typeof result.hwIntegrityPassed === 'boolean' ? result.hwIntegrityPassed : false,
      hwReportHash: typeof result.hwReportHash === 'string' ? result.hwReportHash : '',
      swTechnician: typeof result.swTechnician === 'string' ? result.swTechnician : '',
      osVersion: typeof result.osVersion === 'string' ? result.osVersion : '',
      swValidationPassed: typeof result.swValidationPassed === 'boolean' ? result.swValidationPassed : false,
      destinationSchoolHash: typeof result.destinationSchoolHash === 'string' ? result.destinationSchoolHash : '',
      studentIdHash: typeof result.studentIdHash === 'string' ? result.studentIdHash : '',
      distributionTimestamp,
      currentState: states[Number(result.currentState)] || 'FABRICADA'
    };
  }

  /**
   * Obtiene todos los números de serie registrados
   * @returns Array de números de serie
   */
  getAllSerialNumbers = async (): Promise<string[]> => {
    // Leer todos los números de serie
    const result = await this.read<string[]>('getAllSerialNumbers', []);
    return Array.isArray(result) ? result : [];
  }

  /**
   * Obtiene todas las netbooks por estado
   * @param state Estado de las netbooks a obtener
   * @returns Array de números de serie
   */
  getNetbooksByState = async (state: number): Promise<string[]> => {
    // Leer netbooks por estado
    const result = await this.read<string[]>('getNetbooksByState', [state]);
    return result;
  }

  /**
   * Obtiene todos los miembros de un rol
   * @param roleHash Hash del rol
   * @returns Array de direcciones de miembros
   */
  getAllMembers = async (roleHash: string): Promise<string[]> => {
    // Leer todos los miembros del rol
    const result = await this.read<string[]>('getAllMembers', [roleHash]);
    return result;
  }

  /**
   * Obtiene los miembros de un rol
   * @param roleHash Hash del rol
   * @returns Array de direcciones de miembros
   */
  getRoleMembers = async (roleHash: `0x${string}`): Promise<string[]> => {
    // Leer miembros del rol
    const result = await this.read<string[]>('getRoleMembers', [roleHash]);
    return Array.isArray(result) ? result : [];
  }

  getRoleCounts = async (): Promise<{[key in ContractRoles]: number}> => {
    const roleHashes = await import('@/lib/roleUtils').then(m => m.getRoleHashes());
    const counts: {[key in ContractRoles]: number} = {
      'FABRICANTE_ROLE': 0,
      'AUDITOR_HW_ROLE': 0,
      'TECNICO_SW_ROLE': 0,
      'ESCUELA_ROLE': 0,
      'DEFAULT_ADMIN_ROLE': 0
    };
    
    for (const [role, hash] of Object.entries(roleHashes) as [keyof typeof roleHashes, `0x${string}`][]) {
      const members = await this.getRoleMembers(hash);
      const contractRole = `${role}_ROLE` as ContractRoles;
      counts[contractRole] = members.length;
    }
    
    return counts;
  }

  getAccountBalance = async (userAddress: string): Promise<string> => {
    try {
      // Asumimos que el contrato tiene una función para obtener el balance
      // Si no existe, retornamos '0'
      return '0';
    } catch (error) {
      console.error('Error getting account balance:', error);
      return '0';
    }
  }

  /**
   * Otorga un rol a una dirección
   * @param roleHash Hash del rol
   * @param userAddress Dirección del usuario
   * @returns Resultado de la transacción
   */
  grantRole = async (roleHash: `0x${string}`, userAddress: Address): Promise<TransactionResult> => {
    try {
      const { hash } = await this.write(
        'grantRole', 
        [roleHash, userAddress],
        {
          role: 'DEFAULT_ADMIN_ROLE',
          userAddress: userAddress,
          relatedSerial: undefined
        }
      );
      const receipt = await this.waitForTransaction(hash);
      
      // Guardar en MongoDB
      try {
        await fetch('/api/mongodb/supply-chain-actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transactionHash: hash,
            role: 'DEFAULT_ADMIN_ROLE',
            userAddress,
            data: { roleHash }
          })
        });
      } catch (apiError) {
        console.error('Error saving to MongoDB via API:', apiError);
      }

      this.invalidateCache('getRoleMembers');
      this.invalidateCache('getAllRolesSummary');

      return { success: true, hash };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Revoca un rol de una dirección
   * @param roleHash Hash del rol
   * @param userAddress Dirección del usuario
   * @returns Resultado de la transacción
   */
  revokeRole = async (roleHash: `0x${string}`, userAddress: Address): Promise<TransactionResult> => {
    try {
      const { hash } = await this.write(
        'revokeRole', 
        [roleHash, userAddress],
        {
          role: 'DEFAULT_ADMIN_ROLE',
          userAddress: userAddress,
          relatedSerial: undefined
        }
      );
      const receipt = await this.waitForTransaction(hash);
      
      // Guardar en MongoDB
      try {
        await fetch('/api/mongodb/supply-chain-actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transactionHash: hash,
            role: 'DEFAULT_ADMIN_ROLE',
            userAddress,
            data: { roleHash }
          })
        });
      } catch (apiError) {
        console.error('Error saving to MongoDB via API:', apiError);
      }

      this.invalidateCache('getRoleMembers');
      this.invalidateCache('getAllRolesSummary');

      return { success: true, hash };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}
