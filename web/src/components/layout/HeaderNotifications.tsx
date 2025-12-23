"use client";

import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRoleRequests } from '@/hooks/useRoleRequests';
import { useWeb3 } from '@/hooks/useWeb3';
import { truncateAddress } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';

export function HeaderNotifications() {
  const { getPendingRequests } = useRoleRequests();
  const pendingRequests = getPendingRequests();
  const pendingCount = pendingRequests.length;
  const { address, isConnected } = useWeb3();
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);

  // Check for new notifications
  useEffect(() => {
    if (pendingCount > 0) {
      setHasNewNotifications(true);
    }
  }, [pendingCount]);

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (pendingCount > 0) {
      setHasNewNotifications(false);
    }
  };

  if (!isConnected) return null;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative h-10 w-10 rounded-full"
        onClick={handleNotificationClick}
      >
        <Bell className="h-5 w-5" />
        {hasNewNotifications && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 justify-center rounded-full bg-red-500 text-white text-xs">
            {pendingCount}
          </Badge>
        )}
      </Button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-background border rounded-lg shadow-lg z-50">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Notificaciones</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setShowNotifications(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {pendingCount > 0 ? (
              <div className="p-4">
                <div className="mb-3">
                  <h4 className="font-medium text-sm mb-2">Solicitudes Pendientes</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Tienes {pendingCount} solicitud{pendingCount !== 1 ? 'es' : ''} de rol pendiente{pendingCount !== 1 ? 's' : ''} de aprobación
                  </p>
                  <Link href="/admin">
                    <Button className="w-full" size="sm" onClick={() => setShowNotifications(false)}>
                      Ver solicitudes
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <Bell className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No hay notificaciones</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}