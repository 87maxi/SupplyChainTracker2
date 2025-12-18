import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { bscTestnet, mainnet, polygon } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'SupplyChainTracker',
  projectId: 'YOUR_PROJECT_ID', // Replace with your actual WalletConnect project ID
  chains: [mainnet, polygon, bscTestnet],
  ssr: true,
});
