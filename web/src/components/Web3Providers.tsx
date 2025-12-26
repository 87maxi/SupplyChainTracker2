"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { createConfig, http } from 'wagmi';
import { mainnet, polygon, bscTestnet } from 'wagmi/chains';
import { useState } from 'react';
import { Web3Provider } from '@/contexts/Web3Context';

// Define Anvil chain
const anvilChain = {
  id: 31337,
  name: 'Anvil Local',
  network: 'anvil',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_ANVIL_RPC_URL || 'http://127.0.0.1:8545'],
    },
    public: {
      http: [process.env.NEXT_PUBLIC_ANVIL_RPC_URL || 'http://127.0.0.1:8545'],
    },
  },
  testnet: true,
} as const;

// Create wagmi config
export const config = createConfig({
  chains: [anvilChain, mainnet, polygon, bscTestnet],
  transports: {
    [anvilChain.id]: http(),
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [bscTestnet.id]: http(),
  },
});

interface Web3ProvidersProps {
  children: React.ReactNode;
}

export function Web3Providers({ children }: Web3ProvidersProps) {
  // Create query client once
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <RainbowKitProvider>
          <Web3Provider>
            {children}
          </Web3Provider>
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}

