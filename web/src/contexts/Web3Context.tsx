"use client";

import { createContext, useContext, ReactNode } from 'react';
import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';

// Types
interface Web3ContextType {
  address: string | null;
  isConnected: boolean;
  chain: { id: number; name: string } | null;
  connect: () => void;
  disconnect: () => void;
  switchNetwork: (chainId: number) => void;
  isConnecting: boolean;
}

interface Web3ProviderProps {
  children: ReactNode;
}

// Create context
const Web3Context = createContext<Web3ContextType | undefined>(undefined);

// Provider component
export function Web3Provider({ children }: Web3ProviderProps) {
  const { address, isConnected, isConnecting, chain } = useAccount();
  const { connect: wagmiConnect, connectors } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  // Connect wallet (MetaMask by default if available)
  const connect = () => {
    const connector = connectors[0];
    if (connector) {
      wagmiConnect({ connector });
    }
  };

  // Disconnect wallet
  const disconnect = () => {
    wagmiDisconnect();
  };

  // Switch network
  const switchNetwork = (chainId: number) => {
    switchChain?.({ chainId });
  };

  const value = {
    address: address || null,
    isConnected,
    chain: chain ? { id: chain.id, name: chain.name } : null,
    connect,
    disconnect,
    switchNetwork,
    isConnecting,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

// Custom hook to use the web3 context
export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}