"use client";

import { useWeb3 } from '@/contexts/Web3Context';
import { Button } from '@/components/ui/button';

export function WalletConnectButton() {
  const { isConnected, address, connect, disconnect } = useWeb3();

  return (
    <div>
      {isConnected ? (
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
          <Button variant="outline" size="sm" onClick={disconnect}>
            Disconnect
          </Button>
        </div>
      ) : (
        <Button size="sm" onClick={connect}>
          Connect Wallet
        </Button>
      )}
    </div>
  );
}