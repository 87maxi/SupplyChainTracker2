"use strict";
'use client';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRoleRedirect = void 0;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const wagmi_1 = require("wagmi");
const react_query_1 = require("@tanstack/react-query");
const events_1 = require("@/lib/events");
/**
 * Hook para redirigir automáticamente al dashboard cuando el usuario tiene roles asignados
 */
const useRoleRedirect = () => {
    const router = (0, navigation_1.useRouter)();
    const { address, isConnected } = (0, wagmi_1.useAccount)();
    const queryClient = (0, react_query_1.useQueryClient)();
    (0, react_1.useEffect)(() => {
        const checkUserRolesAndRedirect = () => __awaiter(void 0, void 0, void 0, function* () {
            if (!isConnected || !address)
                return;
            try {
                // Obtener datos cacheados de roles del usuario
                const cachedData = queryClient.getQueryData(['userRoles', address]);
                if (cachedData && Array.isArray(cachedData) && cachedData.length > 0) {
                    // Usuario tiene roles, redirigir al dashboard
                    router.push('/dashboard');
                    return;
                }
                // Si no hay datos cacheados, intentar obtener roles frescos
                const rolesSummary = queryClient.getQueryData(['rolesSummary']);
                if (rolesSummary && typeof rolesSummary === 'object') {
                    const userHasRoles = Object.values(rolesSummary).some((roleInfo) => { var _a; return (_a = roleInfo === null || roleInfo === void 0 ? void 0 : roleInfo.members) === null || _a === void 0 ? void 0 : _a.includes(address.toLowerCase()); });
                    if (userHasRoles) {
                        router.push('/dashboard');
                    }
                }
            }
            catch (error) {
                console.error('Error checking user roles for redirect:', error);
            }
        });
        checkUserRolesAndRedirect();
        // Escuchar eventos de actualización de roles a través del event bus
        const unsubscribe = events_1.eventBus.on(events_1.EVENTS.ROLE_UPDATED, (data) => {
            // Si el evento es para el usuario actual, verificar roles
            if (data.address && address && data.address.toLowerCase() === address.toLowerCase()) {
                setTimeout(checkUserRolesAndRedirect, 1500); // Delay para permitir que se actualice la cache
            }
        });
        return () => {
            unsubscribe();
        };
    }, [isConnected, address, router, queryClient]);
    return null;
};
exports.useRoleRedirect = useRoleRedirect;
