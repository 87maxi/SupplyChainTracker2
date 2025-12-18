"use client";

import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { PropsWithChildren } from 'react';
import { useEffect, useState } from 'react';

export function RainbowKitProviderWrapper({ children }: PropsWithChildren) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // No renderizar nada en el servidor
  if (!isClient) {
    return null;
  }

  return (
    <RainbowKitProvider>
      {children}
    </RainbowKitProvider>
  );
}