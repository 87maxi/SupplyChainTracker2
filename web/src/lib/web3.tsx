import { ethers } from 'ethers';

// Get provider from window.ethereum
export const getProvider = async (): Promise<ethers.BrowserProvider> => {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    throw new Error('Ethereum provider not found. Please install MetaMask or another wallet.');
  }
  return new ethers.BrowserProvider((window as any).ethereum);
};

// Get signer from provider
export const getSigner = async (): Promise<ethers.Signer> => {
  const provider = await getProvider();
  return await provider.getSigner();
};

// Get address from signer
export const getAddress = async (): Promise<string> => {
  const signer = await getSigner();
  return await signer.getAddress();
};

// Check if wallet is connected
export const isConnected = async (): Promise<boolean> => {
  try {
    const address = localStorage.getItem('walletAddress');
    if (!address) return false;
    
    const provider = await getProvider();
    const accounts = await provider.send('eth_accounts', []);
    return accounts.includes(address);
  } catch (error) {
    console.error('Error checking wallet connection:', error);
    return false;
  }
};

// Connect wallet and return signer
export const connectWallet = async (): Promise<ethers.Signer> => {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    throw new Error('Please install MetaMask or another Ethereum wallet');
  }

  try {
    const provider = await getProvider();
    const accounts = await provider.send('eth_requestAccounts', []);
    const signer = await provider.getSigner();
    const address = accounts[0];
    
    // Save to localStorage
    localStorage.setItem('walletAddress', address);
    
    return signer;
  } catch (error) {
    console.error('Error connecting to wallet:', error);
    throw error;
  }
};