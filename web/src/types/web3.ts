export interface Web3State {
  address: string | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}