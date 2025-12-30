import { ethers } from 'ethers';

// Initialize provider from window.ethereum
export const getProvider = async (): Promise<ethers.BrowserProvider> => {
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    return new ethers.BrowserProvider((window as any).ethereum);
  }
  throw new Error('No Ethereum provider found');
};

// Get signer from provider
export const getSigner = async (): Promise<ethers.Signer> => {
  const provider = await getProvider();
  return await provider.getSigner();
};

// Load contract instance
export const getContract = async (abi: ethers.InterfaceAbi, address: string) => {
  const signer = await getSigner();
  return new ethers.Contract(address, abi, signer);
};

