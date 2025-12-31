"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AdminDashboard;
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const link_1 = __importDefault(require("next/link"));
const lucide_react_1 = require("lucide-react");
const useUserRoles_1 = require("@/hooks/useUserRoles");
const navigation_1 = require("next/navigation");
const react_1 = require("react");
function AdminDashboard() {
    const { hasRole, isLoading } = (0, useUserRoles_1.useUserRoles)();
    const router = (0, navigation_1.useRouter)();
    // Redirect if not admin - now using correct role name
    (0, react_1.useEffect)(() => {
        console.log('AdminDashboard: Checking admin access - isLoading:', isLoading, 'hasRole(DEFAULT_ADMIN_ROLE):', hasRole('DEFAULT_ADMIN_ROLE'));
        if (!isLoading && !hasRole('DEFAULT_ADMIN_ROLE')) {
            console.log('AdminDashboard: Redirecting non-admin user to /');
            router.push('/');
        }
    }, [hasRole, isLoading, router]);
    // Show loading state
    if (isLoading) {
        return (<div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>);
    }
    // Redirect if not admin (fallback)
    if (!hasRole('DEFAULT_ADMIN_ROLE')) {
        return null;
    }
    const adminActions = [
        {
            title: 'User Management',
            description: 'Manage users, roles, and permissions',
            icon: lucide_react_1.Users,
            link: '/admin/users',
            color: 'bg-blue-500',
        },
        {
            title: 'Pending Role Requests',
            description: 'Review and approve pending role requests',
            icon: lucide_react_1.Shield,
            link: '/admin/roles/pending-requests',
            color: 'bg-green-500',
        },
        {
            title: 'System Settings',
            description: 'Configure application settings and parameters',
            icon: lucide_react_1.Settings,
            link: '/admin/settings',
            color: 'bg-purple-500',
        },
        {
            title: 'Analytics & Reporting',
            description: 'View system analytics and generate reports',
            icon: lucide_react_1.LayoutDashboard,
            link: '/admin/analytics',
            color: 'bg-orange-500',
        },
        {
            title: 'Audit Logs',
            description: 'Review system audit logs and security events',
            icon: lucide_react_1.AlertTriangle,
            link: '/admin/audit',
            color: 'bg-red-500',
        },
    ];
    return (<div className="container mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Manage your organization's access control and system configuration
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {adminActions.map((action) => {
            const Icon = action.icon;
            return (<link_1.default key={action.title} href={action.link}>
              <card_1.Card className="h-full transition-all hover:shadow-lg">
                <card_1.CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className={`rounded-lg p-3 text-white ${action.color}`}>
                      <Icon className="h-6 w-6"/>
                    </div>
                    <div>
                      <card_1.CardTitle>{action.title}</card_1.CardTitle>
                      <card_1.CardDescription className="mt-1">
                        {action.description}
                      </card_1.CardDescription>
                    </div>
                  </div>
                </card_1.CardHeader>
                <card_1.CardFooter>
                  <button_1.Button variant="outline" className="w-full">
                    Manage
                  </button_1.Button>
                </card_1.CardFooter>
              </card_1.Card>
            </link_1.default>);
        })}
      </div>

      <div className="mt-12">
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Quick Actions</card_1.CardTitle>
            <card_1.CardDescription>
              Perform common administrative tasks with a single click
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <button_1.Button className="h-16 text-lg">
                <lucide_react_1.Users className="mr-2 h-5 w-5"/>
                Manage Users
              </button_1.Button>
              <button_1.Button className="h-16 text-lg">
                <lucide_react_1.Shield className="mr-2 h-5 w-5"/>
                Review Roles
              </button_1.Button>
              <button_1.Button className="h-16 text-lg">
                <lucide_react_1.Settings className="mr-2 h-5 w-5"/>
                System Settings
              </button_1.Button>
              <button_1.Button className="h-16 text-lg">
                <lucide_react_1.LayoutDashboard className="mr-2 h-5 w-5"/>
                View Analytics
              </button_1.Button>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>
    </div>);
}
