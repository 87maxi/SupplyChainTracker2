"use client";

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Web3State } from '@/types/web3';
import { metaMaskConnector } from '@/lib/wagmi/connectors';

export const useWeb3 = (): Web3State => {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  // Create a wrapper for connect that matches our expected signature
  const connectWallet = () => {
    connect({ connector: metaMaskConnector });
  };

  return {
    address: address as string | null,
    isConnected,
    connect: connectWallet,
    disconnect: disconnect,
  };
};