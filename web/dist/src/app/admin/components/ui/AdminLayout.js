"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AdminLayout;
const link_1 = __importDefault(require("next/link"));
const navigation_1 = require("next/navigation");
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/lib/utils");
const navigation = [
    { name: 'Dashboard', href: '/admin', icon: lucide_react_1.LayoutDashboard },
    { name: 'Gestión de Usuarios', href: '/admin/users', icon: lucide_react_1.Users },
    { name: 'Solicitudes de Rol', href: '/admin/roles/pending-requests', icon: lucide_react_1.Shield },
    { name: 'Configuración', href: '/admin/settings', icon: lucide_react_1.Settings },
    { name: 'Analytics & Reporting', href: '/admin/analytics', icon: lucide_react_1.ChartBar },
    { name: 'Registros de Auditoría', href: '/admin/audit', icon: lucide_react_1.AlertTriangle },
];
function AdminLayout({ children }) {
    const pathname = (0, navigation_1.usePathname)();
    return (<div className="min-h-screen bg-muted/50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-background border-r">
          <div className="flex h-16 items-center px-6 border-b">
            <link_1.default href="/admin" className="flex items-center space-x-2">
              <lucide_react_1.Shield className="h-6 w-6 text-primary"/>
              <span className="text-xl font-bold">Admin</span>
            </link_1.default>
          </div>
          <nav className="px-4 py-6 space-y-1">
            {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (<link_1.default key={item.name} href={item.href} className={(0, utils_1.cn)('group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors', isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground')}>
                  <Icon className={(0, utils_1.cn)("mr-3 h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")}/>
                  {item.name}
                </link_1.default>);
        })}
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1">
          <main className="min-h-screen">
            {children}
          </main>
        </div>
      </div>
    </div>);
}
