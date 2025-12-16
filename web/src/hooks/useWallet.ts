import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export const useWallet = () => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [network, setNetwork] = useState<ethers.Network | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        
        try {
          // Check if already connected
          const accounts = await provider.send('eth_accounts', []);
          if (accounts.length > 0) {
            const signer = await provider.getSigner();
            const network = await provider.getNetwork();
            
            setProvider(provider);
            setSigner(signer);
            setAddress(accounts[0]);
            setNetwork(network);
            setIsConnected(true);
          }
        } catch (error) {
          console.error('Error checking connection:', error);
        }
      }
    };

    checkConnection();
  }, []);

  const connect = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const accounts = await provider.send('eth_requestAccounts', []);
        const signer = await provider.getSigner();
        const network = await provider.getNetwork();
        
        setProvider(provider);
        setSigner(signer);
        setAddress(accounts[0]);
        setNetwork(network);
        setIsConnected(true);
        
        return { provider, signer, address: accounts[0], network };
      } catch (error) {
        console.error('Error connecting to wallet:', error);
        throw error;
      }
    } else {
      throw new Error('Ethereum provider not detected');
    }
  };

  const disconnect = () => {
    setProvider(null);
    setSigner(null);
    setAddress(null);
    setNetwork(null);
    setIsConnected(false);
  };

  return {
    provider,
    signer,
    address,
    isConnected,
    network,
    connect,
    disconnect,
  };
};