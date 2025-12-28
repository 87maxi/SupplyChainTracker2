// web/src/services/contracts/role.service.ts

import { BaseContractService } from './base-contract.service';
import SupplyChainTrackerABI from '@/contracts/abi/SupplyChainTracker.json';
import { NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS } from '@/lib/env';
import { CacheService } from '@/lib/cache/cache-service';
import { ContractRoles } from '@/types/contract';
import { getRoleHashes } from '@/lib/roleUtils';
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
  constructor() {
    super(
      NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS as `0x${string}`,
      SupplyChainTrackerABI,
      'role'
    );
  }

  /**
   * Verifica si una dirección tiene un rol específico
   * @param roleName Nombre del rol
   * @param userAddress Dirección del usuario
   * @returns True si tiene el rol, false en caso contrario
   */
  async hasRole(roleName: ContractRoles, userAddress: Address): Promise<boolean> {
    try {
      // Obtener hash del rol
      const roleHashes = await getRoleHashes();
      
      // Mapeo directo de nombres de roles a sus keys en roleHashes
      const roleKeyMap: Record<ContractRoles, keyof typeof roleHashes> = {
        'DEFAULT_ADMIN_ROLE': 'ADMIN',
        'FABRICANTE_ROLE': 'FABRICANTE',
        'AUDITOR_HW_ROLE': 'AUDITOR_HW',
        'TECNICO_SW_ROLE': 'TECNICO_SW',
        'ESCUELA_ROLE': 'ESCUELA'
      };
      
      const roleKey = roleKeyMap[roleName];
      const roleHash = roleHashes[roleKey];
      if (!roleHash) {
        throw new Error(`Rol ${roleName} no encontrado: ${roleKey}`);
      }
      
      // Leer del contrato
      const result = await this.read<boolean>('hasRole', [roleHash, userAddress]);
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Otorga un rol a una dirección
   * @param roleName Nombre del rol
   * @param userAddress Dirección del usuario
   * @returns Resultado de la transacción
   */
  async grantRole(roleName: ContractRoles, userAddress: Address): Promise<TransactionResult> {
    try {
      // Obtener hash del rol
      const roleHashes = await getRoleHashes();
      
      // Mapeo directo de nombres de roles a sus keys en roleHashes
      const roleKeyMap: Record<ContractRoles, keyof typeof roleHashes> = {
        'DEFAULT_ADMIN_ROLE': 'ADMIN',
        'FABRICANTE_ROLE': 'FABRICANTE',
        'AUDITOR_HW_ROLE': 'AUDITOR_HW',
        'TECNICO_SW_ROLE': 'TECNICO_SW',
        'ESCUELA_ROLE': 'ESCUELA'
      };
      
      const roleKey = roleKeyMap[roleName];
      const roleHash = roleHashes[roleKey];
      
      if (!roleHash) {
        throw new Error(`Rol ${roleName} no encontrado. Role key: ${roleKey}`);
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
  async revokeRole(roleName: ContractRoles, userAddress: Address): Promise<TransactionResult> {
    try {
      // Obtener hash del rol
      const roleHashes = await getRoleHashes();
      
      // Mapeo directo de nombres de roles a sus keys en roleHashes
      const roleKeyMap: Record<ContractRoles, keyof typeof roleHashes> = {
        'DEFAULT_ADMIN_ROLE': 'ADMIN',
        'FABRICANTE_ROLE': 'FABRICANTE',
        'AUDITOR_HW_ROLE': 'AUDITOR_HW',
        'TECNICO_SW_ROLE': 'TECNICO_SW',
        'ESCUELA_ROLE': 'ESCUELA'
      };
      
      const roleKey = roleKeyMap[roleName];
      const roleHash = roleHashes[roleKey];
      if (!roleHash) {
        throw new Error(`Rol ${roleName} no encontrado: ${roleKey}`);
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
  async getRoleMembers(roleName: ContractRoles): Promise<RoleMembersResult> {
    try {
      // Intentar obtener de caché primero
      const cacheKey = `getRoleMembers:${roleName}`;
      const cached = CacheService.get(cacheKey);
      if (cached) {
        return cached;
      }
      
      // Obtener hash del rol
      const roleHashes = await getRoleHashes();
      
      // Mapeo directo de nombres de roles a sus keys en roleHashes
      const roleKeyMap: Record<ContractRoles, keyof typeof roleHashes> = {
        'DEFAULT_ADMIN_ROLE': 'ADMIN',
        'FABRICANTE_ROLE': 'FABRICANTE',
        'AUDITOR_HW_ROLE': 'AUDITOR_HW',
        'TECNICO_SW_ROLE': 'TECNICO_SW',
        'ESCUELA_ROLE': 'ESCUELA'
      };
      
      const roleKey = roleKeyMap[roleName];
      const roleHash = roleHashes[roleKey];
      if (!roleHash) {
        throw new Error(`Rol ${roleName} no encontrado: ${roleKey}`);
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
  }

  /**
   * Obtiene todos los miembros de todos los roles
   * @returns Mapa de roles con sus miembros
   */
  async getAllRolesSummary(): Promise<Record<ContractRoles, RoleMembersResult>> {
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
  }
}