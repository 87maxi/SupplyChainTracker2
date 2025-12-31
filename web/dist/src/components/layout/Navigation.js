"use strict";
// web/src/components/layout/Navigation.tsx
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Navigation = void 0;
const link_1 = __importDefault(require("next/link"));
const navigation_1 = require("next/navigation");
const useUserRoles_1 = require("@/hooks/useUserRoles");
const utils_1 = require("@/lib/utils");
const lucide_react_1 = require("lucide-react");
const navigationItems = [
    {
        href: '/dashboard',
        label: 'Dashboard',
        icon: lucide_react_1.BarChart3,
        description: 'Resumen del sistema',
        roles: [
            "DEFAULT_ADMIN_ROLE",
            "FABRICANTE_ROLE",
            "AUDITOR_HW_ROLE",
            "TECNICO_SW_ROLE",
            "ESCUELA_ROLE",
        ], // Todos pueden ver el dashboard
    },
    {
        href: '/tokens',
        label: 'Netbooks',
        icon: lucide_react_1.Laptop,
        description: 'Gestión de netbooks por número de serie',
        roles: [
            "DEFAULT_ADMIN_ROLE",
            "FABRICANTE_ROLE",
            "AUDITOR_HW_ROLE",
            "TECNICO_SW_ROLE",
            "ESCUELA_ROLE",
        ], // Todos los roles de negocio pueden gestionar
    },
    {
        href: '/transfers',
        label: 'Trazabilidad',
        icon: lucide_react_1.History,
        description: 'Historial de transiciones de netbooks',
        roles: [
            "DEFAULT_ADMIN_ROLE",
            "FABRICANTE_ROLE",
            "AUDITOR_HW_ROLE",
            "TECNICO_SW_ROLE",
            "ESCUELA_ROLE",
        ], // Todos pueden ver la trazabilidad
    },
    {
        href: '/admin',
        label: 'Administración',
        icon: lucide_react_1.Settings,
        description: 'Gestión de roles y usuarios',
        roles: ["DEFAULT_ADMIN_ROLE"], // Solo el administrador
    },
    {
        href: '/profile',
        label: 'Perfil',
        icon: lucide_react_1.User,
        description: 'Información y roles de tu cuenta',
        roles: [
            "DEFAULT_ADMIN_ROLE",
            "FABRICANTE_ROLE",
            "AUDITOR_HW_ROLE",
            "TECNICO_SW_ROLE",
            "ESCUELA_ROLE",
        ], // Todos pueden ver su perfil
    },
];
const Navigation = () => {
    const pathname = (0, navigation_1.usePathname)();
    const { activeRoleNames, isLoading } = (0, useUserRoles_1.useUserRoles)(); // Usar activeRoleNames
    if (isLoading) {
        return (<nav className="flex space-x-4">
        <div className="h-8 w-20 bg-muted rounded-md animate-pulse"></div>
        <div className="h-8 w-20 bg-muted rounded-md animate-pulse"></div>
        <div className="h-8 w-20 bg-muted rounded-md animate-pulse"></div>
      </nav>);
    }
    // Filtrar ítems de navegación basados en los roles activos del usuario
    const filteredItems = navigationItems.filter(item => {
        const hasRequiredRole = item.roles.some(requiredRole => activeRoleNames.includes(requiredRole));
        console.log('Navigation item:', item.href, 'Required roles:', item.roles, 'User roles:', activeRoleNames, 'Has access:', hasRequiredRole);
        return hasRequiredRole;
    });
    return (<nav className="flex space-x-4">
      {filteredItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const IconComponent = item.icon;
            return (<link_1.default key={item.href} href={item.href} className={(0, utils_1.cn)("relative inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50", "h-10 px-4 gap-2.5", isActive
                    ? "bg-primary/10 text-primary shadow-[0_0_20px_rgba(59,130,246,0.1)] after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:bg-primary after:rounded-full"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5")} title={item.description}>
            <IconComponent className="h-4 w-4"/>
            <span>{item.label}</span>
          </link_1.default>);
        })}
    </nav>);
};
exports.Navigation = Navigation;
