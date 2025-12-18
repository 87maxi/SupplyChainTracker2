"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProviderWrapper } from '@/components/RainbowKitProviderWrapper';
import { createWagmiConfig } from '@/lib/wagmi';
import { WagmiProvider } from 'wagmi';

interface Web3ProvidersProps {
  children: React.ReactNode;
}

export function Web3Providers({ children }: Web3ProvidersProps) {
  // Create wagmi config inside client component
  const config = createWagmiConfig();
  
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={new QueryClient()}>
        <RainbowKitProviderWrapper>
          {children}
        </RainbowKitProviderWrapper>
      </QueryClientProvider>
    </WagmiProvider>
  );
}