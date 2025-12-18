"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { createWagmiConfig } from '@/lib/wagmi/config';
import { createConfig, useAccount, useConnect, useDisconnect } from 'wagmi';
import { useSwitchChain } from 'wagmi';
import { mainnet, polygon, bscTestnet } from 'wagmi/chains';

// Types
interface Web3ContextType {
  address: string | null;
  isConnected: boolean;
  provider: ethers.BrowserProvider | null;
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

  // Initialize provider
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      setProvider(new ethers.BrowserProvider(window.ethereum));
    }
  }, []);

  // Connect wallet
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
    provider,
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