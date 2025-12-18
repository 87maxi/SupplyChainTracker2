import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to truncate wallet addresses
export function truncateAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Helper function to format large numbers with commas
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

// Helper function to format currency
export function formatCurrency(amount: number, decimals = 2): string {
  return amount.toFixed(decimals);
}

// Helper function to get Etherscan URL for a transaction hash
export function getEtherscanUrl(hash: string, network: string = 'ethereum'): string {
  const baseUrl = network === 'ethereum' ? 'https://etherscan.io' : 
                    network === 'polygon' ? 'https://polygonscan.com' :
                    network === 'sepolia' ? 'https://sepolianscan.io' : 'https://etherscan.io';
  return `${baseUrl}/tx/${hash}`;
}

// Helper function to get block explorer URL for an address
export function getAddressExplorerUrl(address: string, network: string = 'ethereum'): string {
  const baseUrl = network === 'ethereum' ? 'https://etherscan.io' : 
                    network === 'polygon' ? 'https://polygonscan.com' :
                    network === 'sepolia' ? 'https://sepolianscan.io' : 'https://etherscan.io';
  return `${baseUrl}/address/${address}`;
}

// Helper function to calculate gas cost in ETH
export function calculateGasCost(gasUsed: number, gasPrice: number): number {
  return (gasUsed * gasPrice) / 1e18; // Convert from wei to ETH
}

// Helper function to format date to local string
export function formatDate(date: string | number | Date): string {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
