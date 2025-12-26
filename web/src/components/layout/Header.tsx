// web/src/components/layout/Header.tsx
"use client";

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Navigation } from './Navigation';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Badge } from '@/components/ui/badge';
// import { ROLE_LABELS } from '@/lib/constants'; // Ya no es necesario
import { Button } from '@/components/ui/button';
import { RoleRequestModal } from '@/components/contracts/RoleRequestModal';
import { useState } from 'react';
import { useWeb3 } from '@/contexts/Web3Context'; // Updated import
import { User } from 'lucide-react'; // Icono para los roles

export const Header = () => {
  const { activeRoleNames, isLoading: rolesLoading } = useUserRoles(); // Usar activeRoleNames
  const { isConnected } = useWeb3();
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  // Función para formatear el nombre del rol para mostrar en la UI
  const formatRoleNameForDisplay = (roleName: string) => {
    if (roleName === "DEFAULT_ADMIN_ROLE") return "Administrador"; // Nombre especial para el admin
    return roleName.replace(/_/g, ' ').toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

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
          {isConnected && !rolesLoading && activeRoleNames.length === 0 && (
            <Button
              variant="gradient"
              size="sm"
              onClick={() => setIsRequestModalOpen(true)}
            >
              Solicitar Rol
            </Button>
          )}

          {isConnected && !rolesLoading && activeRoleNames.length > 0 && (
            <div className="hidden lg:flex items-center space-x-3 text-sm">
              <span className="text-muted-foreground font-medium">Roles:</span>
              <div className="flex gap-2">
                {activeRoleNames.map((roleName) => (
                  <Badge
                    key={roleName}
                    variant="outline-glow"
                    className="capitalize px-3 py-1 text-xs gap-1"
                  >
                    <User className="h-3 w-3" /> {formatRoleNameForDisplay(roleName)}
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
