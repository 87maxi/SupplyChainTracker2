// web/src/services/contracts/role.service.ts
// Servicio para manejar operaciones de roles de acceso en SupplyChainTracker

import { BaseContractService } from './base-contract.service';
import { ROLE_HASHES } from '@/lib/constants/roles';
import { PublicClient, WalletClient, formatEther, parseEther } from 'viem';
import { Config, usePublicClient, useWalletClient, useAccount } from 'wagmi';
import { useEffect, useState } from 'react';
import { CacheService } from '@/lib/cache/cache-service';
import { ErrorHandler } from '@/lib/errors/error-handler';
import { ActivityLogger } from '@/lib/activity-logger';
import { serverRpc } from '@/lib/api/serverRpc';

// Tipos para los roles
export type Role = 
  | 'FABRICANTE'
  | 'AUDITOR_HW'
  | 'TECNICO_SW'
  | 'ESCUELA'
  | 'ADMIN';

// Enumeración para los estados de procesamiento
export enum ProcessingState {
  IDLE = 'idle',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  ERROR = 'error'
}

// Interfaz para los resultados de procesamiento
export interface ProcessingResult {
  success: boolean;
  message: string;
  txHash?: string;
}

/**
 * Servicio para manejar roles de acceso
 */
export class RoleService extends BaseContractService {
  private config: Config;
  private publicClient: PublicClient | null = null;
  private walletClient: WalletClient | null = null;
  private readonly ROLE_NAMES = [
    'FABRICANTE',
    'AUDITOR_HW',
    'TECNICO_SW',
    'ESCUELA'
  ];

  // Estado para seguimiento
  private processingState: ProcessingState = ProcessingState.IDLE;
  private processingMessage: string = '';

  constructor(
    contractAddress: `0x${string}`,
    abi: any,
    config: Config
  ) {
    super(contractAddress, abi);
    this.config = config;
    this.initializeClients();
  }

  private initializeClients() {
    try {
      // Obtener clientes de Wagmi
      this.publicClient = usePublicClient({ config: this.config });
      const walletClientResult = useWalletClient({ config: this.config });
      
      if (walletClientResult.data) {
        this.walletClient = walletClientResult.data;
      }
      
      console.log('[RoleService] Clientes inicializados:', {
        hasPublicClient: !!this.publicClient,
        hasWalletClient: !!this.walletClient
      });
    } catch (error) {
      console.error('[RoleService] Error al inicializar clientes:', error);
    }
  }

  /**
   * Verifica si el usuario actual es administrador
   */
  async isAdmin(): Promise<boolean> {
    try {
      const { address } = useAccount({ config: this.config });
      if (!address) return false;

      const adminRole = ROLE_HASHES.ADMIN as `0x${string}`;
      const result = await this.read<boolean>(
        'hasRole',
        [adminRole, address]
      );
      return result;
    } catch (error) {
      console.error('Error verificando rol de administrador:', error);
      return false;
    }
  }

  /**
   * Verifica si una cuenta tiene un rol específico
   */
  async hasRole(address: `0x${string}`, role: Role): Promise<boolean> {
    try {
      const roleHash = ROLE_HASHES[role] as `0x${string}`;
      const result = await this.read<boolean>(
        'hasRole',
        [roleHash, address]
      );
      return result;
    } catch (error) {
      throw ErrorHandler.handleWeb3Error(error);
    }
  }

  /**
   * Obtiene todos los miembros de un rol
   */
  async getRoleMembers(role: Role): Promise<string[]> {
    try {
      const roleHash = ROLE_HASHES[role] as `0x${string}`;
      const result = await this.read<string[]>(
        'getAllMembers',
        [roleHash]
      );
      return result;
    } catch (error) {
      throw ErrorHandler.handleWeb3Error(error);
    }
  }

  /**
   * Asigna un rol a una cuenta
   */
  async grantRole(role: Role, account: `0x${string}`): Promise<ProcessingResult> {
    try {
      this.setProcessingState(ProcessingState.PROCESSING, `Asignando rol ${role}...`);

      const roleHash = ROLE_HASHES[role] as `0x${string}`;
      
      const { hash } = await this.write(
        'grantRole',
        [roleHash, account],
        {
          role,
          account,
          action: 'grantRole'
        }
      );

      this.setProcessingState(ProcessingState.SUCCESS, `Rol ${role} asignado exitosamente`);
      
      // Registrar actividad
      await ActivityLogger.logActivity({
        type: 'role_grant',
        details: {
          role,
          account
        }
      });

      return {
        success: true,
        message: `Rol ${role} asignado exitosamente`,
        txHash: hash
      };
    } catch (error) {
      const errorMessage = ErrorHandler.handleWeb3Error(error);
      this.setProcessingState(ProcessingState.ERROR, `Error: ${errorMessage}`);
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  /**
   * Revoca un rol de una cuenta
   */
  async revokeRole(role: Role, account: `0x${string}`): Promise<ProcessingResult> {
    try {
      this.setProcessingState(ProcessingState.PROCESSING, `Revocando rol ${role}...`);

      const roleHash = ROLE_HASHES[role] as `0x${string}`;
      
      const { hash } = await this.write(
        'revokeRole',
        [roleHash, account],
        {
          role,
          account,
          action: 'revokeRole'
        }
      );

      this.setProcessingState(ProcessingState.SUCCESS, `Rol ${role} revocado exitosamente`);
      
      // Registrar actividad
      await ActivityLogger.logActivity({
        type: 'role_revoke',
        details: {
          role,
          account
        }
      });

      return {
        success: true,
        message: `Rol ${role} revocado exitosamente`,
        txHash: hash
      };
    } catch (error) {
      const errorMessage = ErrorHandler.handleWeb3Error(error);
      this.setProcessingState(ProcessingState.ERROR, `Error: ${errorMessage}`);
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  /**
   * Establece el estado de procesamiento
   */
  private setProcessingState(state: ProcessingState, message: string) {
    this.processingState = state;
    this.processingMessage = message;
  }

  /**
   * Obtiene el estado actual de procesamiento
   */
  getProcessingState() {
    return {
      state: this.processingState,
      message: this.processingMessage
    };
  }

  /**
   * Reinicia el estado de procesamiento
   */
  resetProcessing() {
    this.setProcessingState(ProcessingState.IDLE, '');
  }

  // Implementaciones necesarias de BaseContractService
  
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
    if (!this.publicClient) {
      throw new Error('Public client no disponible');
    }
    
    return await this.publicClient.readContract({
      address,
      abi,
      functionName,
      args
    });
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
    if (!this.walletClient) {
      throw new Error('Wallet client no disponible');
    }
    
    const { hash } = await this.walletClient.writeContract({
      address,
      abi,
      functionName,
      args
    });
    
    return hash;
  }

  protected async waitForTransactionReceipt({
    hash,
    timeout
  }: {
    hash: `0x${string}`;
    timeout: number;
  }) {
    if (!this.publicClient) {
      throw new Error('Public client no disponible');
    }
    
    return await this.publicClient.waitForTransactionReceipt({
      hash,
      timeout
    });
  }

  protected async getAddress(): Promise<string> {
    const { address } = useAccount({ config: this.config });
    if (!address) {
      throw new Error('No hay cuenta conectada');
    }
    return address;
  }

  // Métodos adicionales específicos del servicio de roles
}