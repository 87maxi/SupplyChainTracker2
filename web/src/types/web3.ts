export interface Web3State {
  address: `0x${string}` | null;
  isConnected: boolean;
  isConnecting: boolean;
  chain: { id: number; name: string } | null;
  connect: (connectorId?: string) => Promise<void>;
  disconnect: () => void;
  switchNetwork: (chainId: number) => void;
}