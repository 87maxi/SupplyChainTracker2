import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ethers } from 'ethers';
import Web3Service from '@/services/Web3Service';

// Define the context type
interface Web3ContextType {
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  address: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

// Create the context with default values
const Web3Context = createContext<Web3ContextType>({
  provider: null,
  signer: null,
  address: null,
  isConnected: false,
  connect: async () => { },
  disconnect: () => { },
});

// Props interface for the provider component
interface Web3ProviderProps {
  children: ReactNode;
}

// Web3Provider component
export const Web3Provider = ({ children }: Web3ProviderProps) => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    const loadProvider = async () => {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const p = new ethers.BrowserProvider((window as any).ethereum);
        setProvider(p);

        // Try to restore previous connection from localStorage
        const savedAddress = localStorage.getItem('walletAddress');
        if (savedAddress) {
          try {
            const s = await p.getSigner();
            setSigner(s);
            setAddress(savedAddress);
            setIsConnected(true);

            // Sync with Web3Service (Note: Web3Service manages its own provider, but we can help it)
            // Ideally Web3Service should be the source of truth or just a helper.
            // For now, let's just ensure the service can connect if needed.
          } catch (error) {
            console.error('Failed to restore wallet connection:', error);
            localStorage.removeItem('walletAddress');
          }
        }
      }
    };
    loadProvider();
  }, []);

  const connect = async () => {
    if (!provider && typeof window !== 'undefined' && (window as any).ethereum) {
      // If provider is not set yet (e.g. first load), set it
      const p = new ethers.BrowserProvider((window as any).ethereum);
      setProvider(p);
      try {
        const accounts = await p.send('eth_requestAccounts', []);
        const acc = Array.isArray(accounts) ? accounts[0] : accounts;
        const s = await p.getSigner();
        setSigner(s);
        setAddress(acc);
        setIsConnected(true);
        localStorage.setItem('walletAddress', acc);
      } catch (error) {
        console.error('Wallet connection failed:', error);
      }
      return;
    }

    if (!provider) return;

    try {
      const accounts = await provider.send('eth_requestAccounts', []);
      const acc = Array.isArray(accounts) ? accounts[0] : accounts;
      const s = await provider.getSigner();
      setSigner(s);
      setAddress(acc);
      setIsConnected(true);
      localStorage.setItem('walletAddress', acc);
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };

  const disconnect = () => {
    setSigner(null);
    setAddress(null);
    setIsConnected(false);
    localStorage.removeItem('walletAddress');
  };

  return (
    <Web3Context.Provider value={{ provider, signer, address, isConnected, connect, disconnect }}>
      {children}
    </Web3Context.Provider>
  );
};

// Custom hook to use the web3 context
export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};