import { useAccount, useConnect, useDisconnect } from 'wagmi';

// Hook personalizado para manejar la cuenta y la conexión
export const useWeb3 = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  return {
    address,
    isConnected,
    connect,
    connectors,
    disconnect,
  };
};