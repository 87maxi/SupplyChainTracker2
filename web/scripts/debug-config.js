/**
 * Script de depuración para verificar la configuración de la aplicación
 */
import { config } from '@/lib/wagmi/config';
import { publicClient } from '@/lib/blockchain/client';
import { NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS } from '@/lib/env';
import { SupplyChainTrackerABI } from '@/lib/contracts/abi/SupplyChainTracker.json';

async function debugConfig() {
  console.log("=== Debugging Configuration ===");
  
  // Verificar variables de entorno
  console.log("Environment Variables:");
  console.log("- NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS:", NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS);
  console.log("- NEXT_PUBLIC_RPC_URL:", process.env.NEXT_PUBLIC_RPC_URL);
  console.log("- NEXT_PUBLIC_NETWORK_ID:", process.env.NEXT_PUBLIC_NETWORK_ID);
  
  // Verificar cliente público
  console.log("\nPublic Client:");
  console.log("- Is defined:", !!publicClient);
  if (publicClient) {
    console.log("- Chain ID:", publicClient.chain.id);
    console.log("- Transport:", publicClient.transport);
  }
  
  // Verificar configuración de Wagmi
  console.log("\nWagmi Config:");
  console.log("- Is defined:", !!config);
  if (config) {
    console.log("- Chains:", config.chains.map(c => c.name));
    console.log("- Connectors:", config.connectors.length);
  }
  
  // Verificar dirección del contrato
  console.log("\nContract:");
  console.log("- Address is defined:", !!NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS);
  if (NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS) {
    console.log("- Address:", NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS);
    
    // Intentar obtener el código del contrato
    try {
      const code = await publicClient.getBytecode({
        address: NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS
      });
      console.log("- Contract deployed:", code ? "Yes" : "No");
    } catch (error) {
      console.log("- Contract error:", error.message);
    }
  }
  
  // Verificar ABI
  console.log("\nABI:");
  console.log("- ABI has functions:", !!SupplyChainTrackerABI && SupplyChainTrackerABI.length > 0);
  if (SupplyChainTrackerABI) {
    const functions = SupplyChainTrackerABI.filter(item => item.type === 'function');
    console.log("- Number of functions:", functions.length);
    console.log("- Function names:", functions.map(f => f.name));
  }
}

debugConfig();