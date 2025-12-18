import { createConfig, http } from 'wagmi';
import { metaMask } from 'wagmi/connectors';
import { mainnet, polygon, bscTestnet } from 'wagmi/chains';
import { NEXT_PUBLIC_RPC_URL, NEXT_PUBLIC_NETWORK_ID } from '@/lib/env';

// Define Anvil chain
const anvilChain = {
  id: parseInt(NEXT_PUBLIC_NETWORK_ID),
  name: 'Anvil Local',
  network: 'anvil',
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
};

export function createWagmiConfig() {
  // Create MetaMask connector only in client side
  const connectors = [];

  if (typeof window !== 'undefined') {
    connectors.push(metaMask());
  }

  return createConfig({
    chains: [anvilChain, mainnet, polygon, bscTestnet],
    transports: {
      [anvilChain.id]: http(),
      [mainnet.id]: http(),
      [polygon.id]: http(),
      [bscTestnet.id]: http(),
    },
    connectors,
  });
}

export const config = createWagmiConfig();