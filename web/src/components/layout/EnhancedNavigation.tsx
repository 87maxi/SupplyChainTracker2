"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useRoleRequests } from '@/hooks/useRoleRequests';
import { ROLES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  Laptop,
  Settings,
  User,
  Bell,
  Users
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const navigationItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: BarChart3,
    description: 'Resumen del sistema',
    roles: Object.values(ROLES).map(role => role.hash),
  },
  {
    href: '/tokens',
    label: 'Netbooks',
    icon: Laptop,
    description: 'Gestión de tokens',
    roles: [ROLES.FABRICANTE.hash, ROLES.AUDITOR_HW.hash, ROLES.TECNICO_SW.hash, ROLES.ESCUELA.hash],
  },
  {
    href: '/admin',
    label: 'Administración',
    icon: Settings,
    description: 'Gestión de roles',
    roles: [ROLES.ADMIN.hash],
  },
  {
    href: '/profile',
    label: 'Perfil',
    icon: User,
    description: 'Información del usuario',
    roles: Object.values(ROLES).map(role => role.hash),
  },
];

export const EnhancedNavigation = () => {
  const pathname = usePathname();
  const { roles, isLoading: rolesLoading } = useUserRoles();
  const { getPendingRequests } = useRoleRequests();
  const pendingRequests = getPendingRequests();
  const pendingCount = pendingRequests.length;

  if (rolesLoading) {
    return (
      <nav className="flex space-x-4">
        <div className="h-8 w-20 bg-muted rounded-md animate-pulse"></div>
        <div className="h-8 w-20 bg-muted rounded-md animate-pulse"></div>
        <div className="h-8 w-20 bg-muted rounded-md animate-pulse"></div>
      </nav>
    );
  }

  const filteredItems = navigationItems.filter(item =>
    item.roles.some(role => roles.includes(role))
  );

  return (
    <nav className="flex space-x-2">
      {filteredItems.map((item) => {
        const isActive = pathname === item.href;
        const IconComponent = item.icon;
        
        // Special handling for admin section to show pending requests count
        const showBadge = item.href === '/admin' && pendingCount > 0;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
              "h-10 px-4 gap-2.5",
              isActive
                ? "bg-primary/10 text-primary shadow-[0_0_20px_rgba(59,130,246,0.1)] after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:bg-primary after:rounded-full"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}
            title={item.description}
          >
            <IconComponent className="h-4 w-4" />
            <span>{item.label}</span>
            {showBadge && (
              <Badge variant="destructive" className="ml-2 h-5 text-xs px-1.5">
                {pendingCount}
              </Badge>
            )}
          </Link>
        );
      })}
    </nav>
  );
};