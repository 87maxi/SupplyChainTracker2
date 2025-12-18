"use client";

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Navigation } from './Navigation';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Badge } from '@/components/ui/badge';
import { ROLE_LABELS } from '@/lib/constants';

export const Header = () => {
  const { roles } = useUserRoles();

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
    </header>
  );
};
