// web/src/lib/wagmi/config.ts
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { mainnet, polygon, bscTestnet } from 'wagmi/chains';
// import { NEXT_PUBLIC_RPC_URL, NEXT_PUBLIC_NETWORK_ID, NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID } from '@/lib/env'; // Eliminar o ajustar la importación

// Define Anvil chain
const anvilChain = {
  id: 31337, // Anvil siempre usa chain ID 31337 por defecto
  name: 'Anvil Local',
  network: 'anvil',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_ANVIL_RPC_URL || 'http://127.0.0.1:8545'], // Unificar el nombre de la variable
    },
    public: {
      http: [process.env.NEXT_PUBLIC_ANVIL_RPC_URL || 'http://127.0.0.1:8545'], // Unificar el nombre de la variable
    },
  },
  testnet: true,
} as const;

export const config = getDefaultConfig({
  appName: 'Supply Chain Tracker',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '', // Usar directamente process.env
  chains: [anvilChain, mainnet, polygon, bscTestnet],
  transports: {
    [anvilChain.id]: http(),
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [bscTestnet.id]: http(),
  },
  ssr: true,
});

export function createWagmiConfig() {
  return config;
}