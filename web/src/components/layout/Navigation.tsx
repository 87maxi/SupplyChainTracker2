"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUserRoles } from '@/hooks/useUserRoles';
import { ROLES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  Laptop, 
  Settings, 
  User 
} from 'lucide-react';

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

export const Navigation = () => {
  const pathname = usePathname();
  const { roles, isLoading } = useUserRoles();

  if (isLoading) {
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
    <nav className="flex space-x-4">
      {filteredItems.map((item) => {
        const isActive = pathname === item.href;
        const IconComponent = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
              "h-9 px-3 gap-2",
              isActive
                ? "bg-primary text-primary-foreground shadow hover:bg-primary/90"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
            title={item.description}
          >
            <IconComponent className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};