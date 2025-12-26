// web/src/contexts/Web3Context.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Address } from 'viem';

// Define the context type
interface Web3ContextType {
  address: Address | undefined;
  isConnected: boolean;
  isConnecting: boolean;
  disconnect: () => void;
  connectWallet: (connectorId?: string) => void;
  defaultAdminAddress: Address | undefined;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const connectWallet = (connectorId?: string) => {
    if (connectorId) {
      const selectedConnector = connectors.find(c => c.id === connectorId);
      if (selectedConnector) {
        connect({ connector: selectedConnector });
      } else {
        console.warn(`Connector with ID ${connectorId} not found.`);
        // Fallback to default if a specific connector isn't found
        if (connectors.length > 0) {
          connect({ connector: connectors[0] });
        }
      }
    } else if (connectors.length > 0) {
      connect({ connector: connectors[0] }); // Connect with the first available connector by default
    }
  };

  // In Next.js, environment variables are available directly in process.env on both server and client
  const defaultAdminAddress = process.env.NEXT_PUBLIC_DEFAULT_ADMIN_ADDRESS as Address | undefined;

  const value = {
    address,
    isConnected,
    isConnecting,
    disconnect,
    connectWallet,
    defaultAdminAddress,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};