// web/src/lib/blockchain/client.ts
// Cliente unificado para conexiones blockchain usando Viem

import { createPublicClient, createWalletClient, http, type PublicClient, type WalletClient } from 'viem';
import { localhost } from 'viem/chains';

// Configuración para desarrollo local con Anvil
const ANVIL_RPC_URL = 'http://localhost:8545';

/**
 * Cliente público para operaciones de lectura
 * No requiere conexión de wallet
 */
export const publicClient: PublicClient = createPublicClient({
  chain: localhost,
  transport: http(ANVIL_RPC_URL, {
    timeout: 30000, // 30 segundos timeout para desarrollo
    retryCount: 3,  // Reintentos automáticos
  }),
  batch: {
    multicall: true, // Habilitar multicall para optimización
  }
});

/**
 * Cliente de wallet para operaciones de escritura
 * Requiere conexión de wallet
 */
export const getWalletClient = async (): Promise<WalletClient> => {
  // En desarrollo, usamos el cliente básico
  // En producción, Wagmi se encargará de la conexión real
  return createWalletClient({
    chain: localhost,
    transport: http(ANVIL_RPC_URL)
  });
};

/**
 * Verifica la conexión con la blockchain
 * @returns True si la conexión es exitosa
 */
export const checkBlockchainConnection = async (): Promise<boolean> => {
  try {
    await publicClient.getBlockNumber();
    return true;
  } catch (error) {
    console.error('Error de conexión con la blockchain:', error);
    return false;
  }
};

/**
 * Obtiene el balance de una cuenta
 * @param address Dirección de la cuenta
 * @returns Balance en wei como string
 */
export const getBalance = async (address: `0x${string}`): Promise<string> => {
  try {
    const balance = await publicClient.getBalance({ address });
    return balance.toString();
  } catch (error) {
    console.error('Error obteniendo balance:', error);
    return '0';
  }
};

// Re-exportar tipos y utilidades comunes
export { http, type PublicClient, type WalletClient };