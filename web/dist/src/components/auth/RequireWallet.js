"use strict";
// web/src/components/auth/RequireWallet.tsx
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequireWallet = void 0;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const useWeb3_1 = require("@/hooks/useWeb3");
const lucide_react_1 = require("lucide-react");
/**
 * Componente que protege las rutas que requieren conexión de wallet.
 * Si el usuario no está conectado, redirige a la página de inicio.
 */
const RequireWallet = ({ children }) => {
    const { isConnected } = (0, useWeb3_1.useWeb3)();
    const router = (0, navigation_1.useRouter)();
    const pathname = (0, navigation_1.usePathname)();
    const [mounted, setMounted] = (0, react_1.useState)(false);
    // Rutas públicas que no requieren wallet conectada
    const publicRoutes = ['/'];
    (0, react_1.useEffect)(() => {
        setMounted(true);
    }, []);
    (0, react_1.useEffect)(() => {
        // Solo ejecutar en cliente y después del mount
        if (!mounted)
            return;
        // Si no está conectado y no es una ruta pública, redirigir
        if (!isConnected && !publicRoutes.includes(pathname)) {
            router.push('/');
        }
    }, [isConnected, pathname, router, mounted]);
    // Durante SSR o antes del mount, mostrar loading
    if (!mounted) {
        return (<div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <lucide_react_1.Loader2 className="h-8 w-8 text-primary animate-spin"/>
                <p className="text-muted-foreground animate-pulse">Verificando conexión...</p>
            </div>);
    }
    // Si no está conectado y no es ruta pública, mostrar loading mientras redirige
    if (!isConnected && !publicRoutes.includes(pathname)) {
        return (<div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <lucide_react_1.Loader2 className="h-8 w-8 text-primary animate-spin"/>
                <p className="text-muted-foreground animate-pulse">Redirigiendo...</p>
            </div>);
    }
    return <>{children}</>;
};
exports.RequireWallet = RequireWallet;
