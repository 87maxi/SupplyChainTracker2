// web/src/services/contracts/base-contract.service.ts

import { PublicClient, WalletClient } from 'viem';
import { publicClient, getWalletClient, checkBlockchainConnection } from '@/lib/blockchain/client';
import { CacheService } from '@/lib/cache/cache-service';
import { ErrorHandler, AppError } from '@/lib/errors/error-handler';

/**
 * Clase base para servicios de contratos inteligentes
 * Proporciona funcionalidad común para todos los servicios de contratos
 */
export abstract class BaseContractService {
  protected walletClient: WalletClient | undefined;
  protected transactionTimeouts: Map<string, NodeJS.Timeout> = new Map();

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
      // Usar el cliente público unificado
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
    // Obtener walletClient usando nuestro cliente unificado
    try {
      const walletClient = await getWalletClient();
      
      // Para desarrollo, usar una cuenta por defecto de Anvil
      const account = (walletClient as any).account || {
        address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
      };

      const hash = await walletClient.writeContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName,
        args,
        account: account.address as `0x${string}`,
        chain: null // Chain es opcional en este contexto
      });

      return { hash };
    } catch (error) {
      throw ErrorHandler.handleWeb3Error(error);
    }
  }

  /**
   * Espera a que una transacción sea confirmada
   * @param hash Hash de la transacción
   * @param timeout Tiempo máximo de espera en segundos (por defecto: 60 para desarrollo, 120 para producción)
   * @param maxRetries Número máximo de reintentos (por defecto: 2)
   * @returns Recibo de la transacción
   */
  protected async waitForTransaction(
    hash: `0x${string}`,
    timeout: number = process.env.NODE_ENV === 'development' ? 60 : 120,
    maxRetries: number = 2
  ) {
    let retries = 0;
    
    const attemptWait = async (): Promise<any> => {
      try {
        // Usar el cliente público unificado con timeout extendido para desarrollo
        const receipt = await publicClient.waitForTransactionReceipt({
          hash,
          timeout: process.env.NODE_ENV === 'development' ? 120_000 : timeout * 1000, // 120 segundos para desarrollo
          pollingInterval: 1000 // Poll cada 1 segundo
        });

        return receipt;
      } catch (error) {
        // Si es un error de timeout y tenemos reintentos disponibles, reintentar
        if ((error instanceof Error && error.name === 'AbortError') || 
            (error instanceof Error && error.message.includes('timeout'))) {
          
          if (retries < maxRetries) {
            retries++;
            console.warn(`Reintentando transacción ${hash} (intento ${retries}/${maxRetries})`);
            
            // Backoff exponencial: 1s, 2s, 4s, etc.
            const backoffDelay = Math.pow(2, retries) * 1000;
            await new Promise(resolve => setTimeout(resolve, backoffDelay));
            
            return attemptWait();
          }
        }
        
        throw ErrorHandler.handleWeb3Error(error);
      }
    };

    return attemptWait();
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

  /**
   * Cancela todas las transacciones pendientes
   */
  public cancelAllPendingTransactions(): void {
    this.transactionTimeouts.forEach((timeoutId, hash) => {
      clearTimeout(timeoutId);
      this.transactionTimeouts.delete(hash);
    });
  }

  /**
   * Verifica el estado de la conexión con la blockchain
   */
  public async checkConnection(): Promise<boolean> {
    return await checkBlockchainConnection();
  }
}