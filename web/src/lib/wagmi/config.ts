// web/src/lib/wagmi/config.ts
import { createConfig, http } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors';

// Define Anvil chain
const anvilChain = {
  id: 31337,
  name: 'Anvil Local',
  network: 'anvil',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_ANVIL_RPC_URL || 'http://127.0.0.1:8545'],
    },
    public: {
      http: [process.env.NEXT_PUBLIC_ANVIL_RPC_URL || 'http://127.0.0.1:8545'],
    },
  },
  testnet: true,
} as const;

// Validar projectId de WalletConnect
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

// Configuración para desarrollo local con soporte para Rabby Wallet
export const config = createConfig({
  chains: [anvilChain],
  connectors: [
    injected({ target: 'metaMask' }),
    injected({ target: 'rabby' }),
    coinbaseWallet(),
    walletConnect({ projectId: projectId || 'local-development' }),
  ],
  transports: {
    [anvilChain.id]: http(),
  },
  ssr: true,
});