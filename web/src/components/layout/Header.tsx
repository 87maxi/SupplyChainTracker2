"use client";

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Navigation } from './Navigation';
import { useUserRoles } from '@/hooks/useUserRoles';
import { ROLE_NAMES } from '@/lib/constants';

export const Header = () => {
  const { roles } = useUserRoles();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center space-x-6">
          <h1 className="text-xl font-bold">SupplyChainTracker</h1>
          <Navigation />
        </div>
        
        <div className="flex items-center space-x-4">
          {roles.length > 0 && (
            <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Roles:</span>
              <div className="flex space-x-1">
                {roles.map((roleHash) => (
                  <span
                    key={roleHash}
                    className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
                  >
                    {ROLE_NAMES[roleHash] || 'Unknown Role'}
                  </span>
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