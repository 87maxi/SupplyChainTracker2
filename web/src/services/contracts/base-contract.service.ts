// web/src/services/contracts/base-contract.service.ts

import { PublicClient, WalletClient, HttpTransport, Chain } from 'viem';
import { getPublicClient, getWalletClient } from '@wagmi/core';
import { config } from '@/lib/wagmi/config';
import { CacheService } from '@/lib/cache/cache-service';
import { ErrorHandler, AppError } from '@/lib/errors/error-handler';

/**
 * Clase base para servicios de contratos inteligentes
 * Proporciona funcionalidad común para todos los servicios de contratos
 */
export abstract class BaseContractService {
  protected walletClient: WalletClient | undefined;

  constructor(
    protected contractAddress: `0x${string}`,
    protected abi: any,
    protected cachePrefix: string
  ) {
    // walletClient se obtiene de forma lazy cuando se necesita
  }

  /**
   * Realiza una llamada de lectura al contrato
   * @param functionName Nombre de la función del contrato
   * @param args Argumentos para la función
   * @param useCache Si se debe usar caché (por defecto: true)
   * @returns Resultado de la llamada
   */
  protected async read<T>(
    functionName: string,
    args: any[] = [],
    useCache: boolean = true
  ): Promise<T> {
    const cacheKey = `${this.cachePrefix}:${functionName}:${JSON.stringify(args)}`;

    // Intentar obtener de caché si está habilitado
    if (useCache) {
      const cached = CacheService.get(cacheKey);
      if (cached !== null) {
        return cached;
      }
    }

    try {
      // Obtener el public client de forma lazy
      const publicClient = getPublicClient(config);
      if (!publicClient) {
        throw new AppError('No se pudo obtener el cliente público', 'PUBLIC_CLIENT_ERROR');
      }
      
      const result = await publicClient.readContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName,
        args
      });

      // Almacenar en caché si está habilitado
      if (useCache) {
        CacheService.set(cacheKey, result);
      }

      return result as T;
    } catch (error) {
      throw ErrorHandler.handleWeb3Error(error);
    }
  }

  /**
   * Realiza una llamada de escritura al contrato
   * @param functionName Nombre de la función del contrato
   * @param args Argumentos para la función
   * @returns Hash de la transacción
   */
  protected async write(
    functionName: string,
    args: any[] = []
  ): Promise<{ hash: `0x${string}` }> {
    // Obtener walletClient de forma lazy si no existe
    if (!this.walletClient) {
      try {
        this.walletClient = await getWalletClient(config);
      } catch (error) {
        throw new AppError('No hay conexión con la wallet', 'WALLET_NOT_CONNECTED');
      }
    }

    if (!this.walletClient) {
      throw new AppError('No hay conexión con la wallet', 'WALLET_NOT_CONNECTED');
    }

    try {
      const hash = await this.walletClient.writeContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName,
        args,
        chain: this.walletClient.chain,
        account: this.walletClient.account!
      });

      return { hash };
    } catch (error) {
      throw ErrorHandler.handleWeb3Error(error);
    }
  }

  /**
   * Espera a que una transacción sea confirmada
   * @param hash Hash de la transacción
   * @param timeout Tiempo máximo de espera en segundos (por defecto: 120)
   * @returns Recibo de la transacción
   */
  protected async waitForTransaction(
    hash: `0x${string}`,
    timeout: number = 120
  ) {
    try {
      // Obtener el public client de forma lazy
      const publicClient = getPublicClient(config);
      if (!publicClient) {
        throw new AppError('No se pudo obtener el cliente público', 'PUBLIC_CLIENT_ERROR');
      }
      
      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
        timeout
      });

      return receipt;
    } catch (error) {
      throw ErrorHandler.handleWeb3Error(error);
    }
  }

  /**
   * Invalida la caché para una clave específica
   * @param keyPart Parte de la clave a invalidar
   */
  protected invalidateCache(keyPart: string): void {
    if (typeof window !== 'undefined') {
      try {
        Object.keys(localStorage)
          .filter(key => key.includes(this.cachePrefix) && key.includes(keyPart))
          .forEach(key => CacheService.remove(key));
      } catch (error) {
        console.warn('Error al invalidar caché:', error);
      }
    }
  }

  /**
   * Invalida toda la caché relacionada con este servicio
   */
  protected invalidateAllCache(): void {
    if (typeof window !== 'undefined') {
      try {
        Object.keys(localStorage)
          .filter(key => key.includes(this.cachePrefix))
          .forEach(key => CacheService.remove(key));
      } catch (error) {
        console.warn('Error al invalidar caché completa:', error);
      }
    }
  }
}