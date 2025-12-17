"use client";

import { useWeb3 } from '@/lib/web3';
import { Button } from '@/components/ui/button';

export function WalletConnectButton() {
  const { isConnected, address, connect, disconnect } = useWeb3();

  return (
    <div>
      {isConnected ? (
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur-sm">
          <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
          <span className="text-sm font-mono text-muted-foreground">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={disconnect}
            className="h-7 px-2 text-xs hover:bg-white/10 hover:text-red-400"
          >
            Disconnect
          </Button>
        </div>
      ) : (
        <Button
          size="sm"
          onClick={connect}
          className="bg-gradient-to-r from-indigo-500 to-purple-500 font-medium text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 hover:from-indigo-600 hover:to-purple-600 hover:shadow-indigo-500/40"
        >
          Connect Wallet
        </Button>
      )}
    </div>
  );
}