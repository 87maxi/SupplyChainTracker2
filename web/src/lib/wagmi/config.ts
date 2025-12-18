import { createConfig, http } from 'wagmi';
import { metaMask } from 'wagmi/connectors';
import { mainnet, polygon, bscTestnet } from 'wagmi/chains';

export function createWagmiConfig() {
  // Create MetaMask connector only in client side
  const connectors = [];
  
  if (typeof window !== 'undefined') {
    connectors.push(metaMask());
  }

  return createConfig({
    chains: [mainnet, polygon, bscTestnet],
    transports: {
      [mainnet.id]: http(),
      [polygon.id]: http(),
      [bscTestnet.id]: http(),
    },
    connectors,
  });
}