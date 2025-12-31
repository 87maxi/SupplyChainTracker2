"use strict";
// web/src/components/layout/Header.tsx
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Header = void 0;
const rainbowkit_1 = require("@rainbow-me/rainbowkit");
const Navigation_1 = require("./Navigation");
const useUserRoles_1 = require("@/hooks/useUserRoles");
const badge_1 = require("@/components/ui/badge");
const button_1 = require("@/components/ui/button");
const RoleRequestModal_1 = require("@/components/contracts/RoleRequestModal");
const react_1 = require("react");
const useWeb3_1 = require("@/hooks/useWeb3");
const lucide_react_1 = require("lucide-react");
const link_1 = __importDefault(require("next/link"));
const Header = () => {
    const { activeRoleNames, isLoading: rolesLoading } = (0, useUserRoles_1.useUserRoles)();
    const { isConnected } = (0, useWeb3_1.useWeb3)();
    const [isRequestModalOpen, setIsRequestModalOpen] = (0, react_1.useState)(false);
    const [mounted, setMounted] = (0, react_1.useState)(false);
    // Evitar error de hidratación
    (0, react_1.useEffect)(() => {
        setMounted(true);
    }, []);
    // Función para formatear el nombre del rol para mostrar en la UI
    const formatRoleNameForDisplay = (roleName) => {
        if (roleName === "DEFAULT_ADMIN_ROLE")
            return "Admin";
        return roleName.replace(/_ROLE/g, '').replace(/_/g, ' ').toLowerCase()
            .split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };
    // Determinar el color del badge según el rol
    const getRoleBadgeVariant = (roleName) => {
        switch (roleName) {
            case "DEFAULT_ADMIN_ROLE": return "destructive";
            case "FABRICANTE_ROLE": return "default";
            case "AUDITOR_HW_ROLE": return "success";
            case "TECNICO_SW_ROLE": return "warning";
            case "ESCUELA_ROLE": return "secondary";
            default: return "outline";
        }
    };
    return (<header className="sticky top-0 z-50 w-full border-b bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-8">
          {/* Logo - Siempre visible, lleva a inicio */}
          <link_1.default href="/" className="flex items-center space-x-2 group">
            <h1 className="text-2xl font-bold tracking-tighter text-gradient glow-text group-hover:opacity-80 transition-opacity">
              SupplyChainTracker
            </h1>
          </link_1.default>

          {/* Navegación - Solo visible si está conectado y mounting completado */}
          {mounted && isConnected && <Navigation_1.Navigation />}
        </div>

        <div className="flex items-center space-x-4">
          {/* Sección de roles y acciones - Solo si está conectado */}
          {mounted && isConnected && (<>
              {/* Botón solicitar rol - Solo si no tiene roles */}
              {!rolesLoading && activeRoleNames.length === 0 && (<button_1.Button variant="gradient" size="sm" onClick={() => setIsRequestModalOpen(true)} className="hidden sm:flex">
                  <lucide_react_1.User className="h-4 w-4 mr-1"/>
                  Solicitar Rol
                </button_1.Button>)}

              {/* Badges de roles - Solo en desktop */}
              {!rolesLoading && activeRoleNames.length > 0 && (<div className="hidden lg:flex items-center space-x-2">
                  {activeRoleNames.slice(0, 2).map((roleName) => (<badge_1.Badge key={roleName} variant={getRoleBadgeVariant(roleName)} className="px-2.5 py-1 text-xs gap-1">
                      <lucide_react_1.User className="h-3 w-3"/>
                      {formatRoleNameForDisplay(roleName)}
                    </badge_1.Badge>))}
                  {activeRoleNames.length > 2 && (<badge_1.Badge variant="outline" className="px-2 py-1 text-xs">
                      +{activeRoleNames.length - 2}
                    </badge_1.Badge>)}
                </div>)}
            </>)}

          {/* Indicador de estado de conexión - Solo en mobile cuando no conectado */}
          {mounted && !isConnected && (<div className="flex sm:hidden items-center text-xs text-muted-foreground">
              <lucide_react_1.Wallet className="h-3.5 w-3.5 mr-1"/>
              Sin wallet
            </div>)}

          {/* Botón de conexión - Siempre visible */}
          <rainbowkit_1.ConnectButton showBalance={false} chainStatus="icon" accountStatus={{
            smallScreen: 'avatar',
            largeScreen: 'full',
        }}/>
        </div>
      </div>

      {/* Modal de solicitud de rol */}
      <RoleRequestModal_1.RoleRequestModal isOpen={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}/>
    </header>);
};
exports.Header = Header;
