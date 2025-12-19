import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { mainnet, polygon, bscTestnet } from 'wagmi/chains';
import { NEXT_PUBLIC_RPC_URL, NEXT_PUBLIC_NETWORK_ID, NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID } from '@/lib/env';

// Define Anvil chain
const anvilChain = {
  id: parseInt(NEXT_PUBLIC_NETWORK_ID),
  name: 'Anvil Local',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: [NEXT_PUBLIC_RPC_URL],
    },
    public: {
      http: [NEXT_PUBLIC_RPC_URL],
    },
  },
} as const;

export const config = getDefaultConfig({
  appName: 'Supply Chain Tracker',
  projectId: NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
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