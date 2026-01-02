// web/src/services/contracts/role.service.ts

import { BaseContractService } from './base-contract.service';
import SupplyChainTrackerABI from '@/lib/contracts/abi/SupplyChainTracker.json';
import { NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS } from '@/lib/env';
import { CacheService } from '@/lib/cache/cache-service';
import { ContractRoles, ContractRoleName } from '@/types/contract';
import { getRoleHashes, fallbackHashes } from '@/lib/roleUtils';
import { Address } from 'viem';

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
 * Servicio para gestionar roles en el contrato inteligente
 */
export class RoleService extends BaseContractService {
  private readonly logger = console;
  constructor() {
    super(
      NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS as `0x${string}`,
      SupplyChainTrackerABI,
      'role'
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

  /**
   * Verifica si una dirección tiene un rol específico
   * @param roleName Nombre del rol
   * @param userAddress Dirección del usuario
   * @returns True si tiene el rol, false en caso contrario
   */
  hasRole = async (roleName: ContractRoles | `0x${string}`, userAddress: Address): Promise<boolean> => {
    try {
      // Obtener hash del rol
      const roleHashes = await getRoleHashes();
      
      // Si roleName es un hash de 66 caracteres (0x + 64 hex), usarlo directamente
      if (typeof roleName === 'string' && roleName.length === 66 && roleName.startsWith('0x')) {
        const result = await this.read<boolean>('hasRole', [roleName as `0x${string}`, userAddress]);
        console.log('[RoleService] Verificación de rol por hash:', { roleName, userAddress, result });
        return result;
      }
      
      // Convertir ContractRoles a ContractRoleName eliminando '_ROLE' del final
      const roleKey = (roleName as ContractRoles).replace('_ROLE', '') as ContractRoleName;
      if (!roleHashes[roleKey]) {
        throw new Error(`Nombre de rol inválido o no encontrado: ${roleName}. Conversión a clave: ${roleKey}`);
      }
      const roleHash = roleHashes[roleKey];
      if (!roleHash) {
        throw new Error(`Rol ${roleName} no encontrado: ${roleKey}. Hash no definido.`);
      }
      
      // Leer del contrato
      // Properties are initialized in constructor, so this check is redundant but kept as defensive programming
      if (!this.contractAddress || !this.abi) {
        throw new Error('Contract configuration is not initialized');
      }
      const result = await this.read<boolean>('hasRole', [roleHash, userAddress]);
      console.log('[RoleService] Verificación de rol:', { roleName, roleHash, userAddress, result });
      return result;
    } catch (error) {
      console.error('[RoleService] Error en hasRole:', error);
      throw error;
    }
  }

  /**
   * Otorga un rol a una dirección
   * @param roleName Nombre del rol
   * @param userAddress Dirección del usuario
   * @returns Resultado de la transacción
   */
  grantRole = async (roleName: ContractRoles | `0x${string}`, userAddress: Address): Promise<TransactionResult> => {
    try {
      // Si roleName es un hash de 66 caracteres (0x + 64 hex), usarlo directamente
      if (typeof roleName === 'string' && roleName.length === 66 && roleName.startsWith('0x')) {
        // Realizar transacción
        const { hash } = await this.write('grantRole', [roleName as `0x${string}`, userAddress]);
        
        // Esperar confirmación
        const receipt = await this.waitForTransaction(hash);
        
        // Invalidar caché
        this.invalidateCache(`hasRole:${userAddress}`);
        this.invalidateCache(`getAllMembers`);
        
        return {
          success: true,
          hash
        };
      }
      
      // Obtener hash del rol
      const roleHashes = await getRoleHashes();
      
      // Convertir ContractRoles a ContractRoleName eliminando '_ROLE' del final
      const roleKey = (roleName as ContractRoles).replace('_ROLE', '') as ContractRoleName;
      if (!roleHashes[roleKey]) {
        return { success: false, error: `Nombre de rol inválido o no encontrado: ${roleName}. Conversión a clave: ${roleKey}` };
      }
      const roleHash = roleHashes[roleKey];
      
      if (!roleHash) {
        return { success: false, error: `Hash no encontrado para el rol: ${roleName}` };
      }
      
      // Realizar transacción
      const { hash } = await this.write('grantRole', [roleHash, userAddress]);
      
      // Esperar confirmación
      const receipt = await this.waitForTransaction(hash);
      
      // Invalidar caché
      this.invalidateCache(`hasRole:${userAddress}`);
      this.invalidateCache(`getAllMembers`);
      
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
   * Revoca un rol de una dirección
   * @param roleName Nombre del rol
   * @param userAddress Dirección del usuario
   * @returns Resultado de la transacción
   */
  revokeRole = async (roleName: ContractRoles | `0x${string}`, userAddress: Address): Promise<TransactionResult> => {
    try {
      // Si roleName es un hash de 66 caracteres (0x + 64 hex), usarlo directamente
      if (typeof roleName === 'string' && roleName.length === 66 && roleName.startsWith('0x')) {
        // Realizar transacción
        const { hash } = await this.write('revokeRole', [roleName as `0x${string}`, userAddress]);
        
        // Esperar confirmación
        const receipt = await this.waitForTransaction(hash);
        
        // Invalidar caché
        this.invalidateCache(`hasRole:${userAddress}`);
        this.invalidateCache(`getAllMembers`);
        
        return {
          success: true,
          hash
        };
      }
      
      // Obtener hash del rol
      const roleHashes = await getRoleHashes();
      
      // Convertir ContractRoles a ContractRoleName eliminando '_ROLE' del final
      const roleKey = (roleName as ContractRoles).replace('_ROLE', '') as ContractRoleName;
      if (!roleHashes[roleKey]) {
        return { success: false, error: `Nombre de rol inválido o no encontrado: ${roleName}. Conversión a clave: ${roleKey}` };
      }
      const roleHash = roleHashes[roleKey];
      if (!roleHash) {
        return { success: false, error: `Hash no encontrado para el rol: ${roleName}` };
      }
      
      // Realizar transacción
      const { hash } = await this.write('revokeRole', [roleHash, userAddress]);
      
      // Esperar confirmación
      const receipt = await this.waitForTransaction(hash);
      
      // Invalidar caché
      this.invalidateCache(`hasRole:${userAddress}`);
      this.invalidateCache(`getAllMembers`);
      
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
   * Obtiene todos los miembros de un rol
   * @param roleName Nombre del rol
   * @returns Miembros del rol
   */
  getRoleMembers = async (roleName: ContractRoles | `0x${string}`): Promise<RoleMembersResult> => {
    try {
      // Si roleName es un hash de 66 caracteres (0x + 64 hex), usarlo directamente
      if (typeof roleName === 'string' && roleName.length === 66 && roleName.startsWith('0x')) {
        // Leer del contrato
        const members = await this.read<string[]>('getAllMembers', [roleName as `0x${string}`]);
        
        // Preparar resultado
        const result: RoleMembersResult = {
          role: 'DEFAULT_ADMIN_ROLE', // Default role when using hash directly
          members,
          count: members.length
        };
        
        return result;
      }
      
      // Intentar obtener de caché primero
      const cacheKey = `getRoleMembers:${roleName}`;
      const cached = CacheService.get(cacheKey);
      if (cached) {
        return cached;
      }
      
      // Obtener hash del rol
      const roleHashes = await getRoleHashes();
      
      // Convertir ContractRoles a ContractRoleName eliminando '_ROLE' del final
      const roleKey = (roleName as ContractRoles).replace('_ROLE', '') as ContractRoleName;
      if (!roleHashes[roleKey]) {
        throw new Error(`Nombre de rol inválido o no encontrado: ${roleName}. Conversión a clave: ${roleKey}`);
      }
      const roleHash = roleHashes[roleKey];
      if (!roleHash) {
        throw new Error(`Rol ${roleName} no encontrado: ${roleKey}. Hash no definido.`);
      }
      
      // Leer del contrato
      const members = await this.read<string[]>('getAllMembers', [roleHash]);
      
      // Preparar resultado
      const result: RoleMembersResult = {
        role: roleName,
        members,
        count: members.length
      };
      
      // Almacenar en caché
      CacheService.set(cacheKey, result);
      
      return result;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Obtiene todos los miembros de todos los roles
   * @returns Mapa de roles con sus miembros
   */
  getAllRolesSummary = async (): Promise<Record<ContractRoles, RoleMembersResult>> => {
    try {
      // Intentar obtener de caché primero
      const cacheKey = 'getAllRolesSummary';
      const cached = CacheService.get(cacheKey);
      if (cached) {
        return cached;
      }
      
      // Obtener todos los nombres de roles
      const roleNames: ContractRoles[] = [
        'DEFAULT_ADMIN_ROLE',
        'FABRICANTE_ROLE',
        'AUDITOR_HW_ROLE',
        'TECNICO_SW_ROLE',
        'ESCUELA_ROLE'
      ];
      
      // Obtener miembros de cada rol concurrentemente
      const results = await Promise.all(
        roleNames.map(async (roleName) => {
          try {
            const members = await this.getRoleMembers(roleName);
            return [roleName, members] as const;
          } catch (error) {
            console.error(`Error obteniendo miembros de ${roleName}:`, error);
            return [roleName, { role: roleName, members: [], count: 0 }] as const;
          }
        })
      );
      
      // Convertir a objeto
      const summary = Object.fromEntries(results) as Record<ContractRoles, RoleMembersResult>;
      
      // Almacenar en caché
      CacheService.set(cacheKey, summary);
      
      return summary;
    } catch (error) {
      throw error;
    }
  };
}