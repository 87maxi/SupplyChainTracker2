'use client';

import { Button } from '@/components/ui/button';
import { WalletConnectButton } from '@/components/WalletConnectButton';
import { useWeb3 } from '@/contexts/Web3Context';
import Link from 'next/link';

export default function HomePage() {
  const { address, isConnected } = useWeb3();

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex flex-col items-center text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            SupplyChainTracker
          </h1>
          <p className="text-xl text-muted-foreground">
            Sistema de trazabilidad para netbooks educativas
          </p>
        </div>

        <div className="w-full max-w-md">
          <WalletConnectButton />
        </div>

        {isConnected && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Conectado como: {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
            <div className="flex gap-4">
              <Button asChild>
                <Link href="/dashboard">Ir al Dashboard</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/audit">Auditar Netbook</Link>
              </Button>
            </div>
          </div>
        )}

        <div className="pt-8 border-t w-full">
          <p className="text-sm text-muted-foreground">
            Una plataforma descentralizada para garantizar la trazabilidad
            del ciclo de vida de las netbooks educativas.
          </p>
        </div>
      </div>
    </div>
  );
}