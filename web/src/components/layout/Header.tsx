"use client";

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Navigation } from './Navigation';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Badge } from '@/components/ui/badge';
import { ROLE_LABELS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { RoleRequestModal } from '@/components/contract/RoleRequestModal';
import { useState } from 'react';
import { useWeb3 } from '@/hooks/useWeb3';

export const Header = () => {
  const { roles } = useUserRoles();
  const { isConnected } = useWeb3();
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-8">
          <h1 className="text-2xl font-bold tracking-tighter text-gradient glow-text">
            SupplyChainTracker
          </h1>
          <Navigation />
        </div>

        <div className="flex items-center space-x-6">
          {isConnected && roles.length === 0 && (
            <Button
              variant="gradient"
              size="sm"
              onClick={() => setIsRequestModalOpen(true)}
            >
              Solicitar Rol
            </Button>
          )}

          {roles.length > 0 && (
            <div className="hidden lg:flex items-center space-x-3 text-sm">
              <span className="text-muted-foreground font-medium">Roles:</span>
              <div className="flex gap-2">
                {roles.map((roleHash) => (
                  <Badge
                    key={roleHash}
                    variant="outline-glow"
                    className="capitalize"
                  >
                    {ROLE_LABELS[roleHash as keyof typeof ROLE_LABELS]?.toLowerCase() || 'Unknown Role'}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          <ConnectButton />
        </div>
      </div>
      <RoleRequestModal
        isOpen={isRequestModalOpen}
        onOpenChange={setIsRequestModalOpen}
      />
    </header>
  );
};
