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
exports.useRoleRequests = useRoleRequests;
const react_query_1 = require("@tanstack/react-query");
const use_toast_1 = require("@/hooks/use-toast");
const events_1 = require("@/lib/events");
const useSupplyChainService_1 = require("@/hooks/useSupplyChainService");
const react_1 = require("react");
const roleUtils_1 = require("@/lib/roleUtils");
// Keys for React Query
const QUERY_KEYS = {
    requests: ['roleRequests'],
};
function useRoleRequests() {
    const { toast } = (0, use_toast_1.useToast)();
    const supplyChainService = (0, useSupplyChainService_1.useSupplyChainService)();
    const queryClient = (0, react_query_1.useQueryClient)();
    // Local state for pending requests using localStorage as persistence
    const [pendingRequests, setPendingRequests] = (0, react_1.useState)([]);
    // Load requests from localStorage on component mount
    (0, react_1.useEffect)(() => {
        try {
            const stored = localStorage.getItem('role_requests');
            if (stored) {
                const requests = JSON.parse(stored);
                // Filter only pending requests
                const pending = requests.filter((req) => req.status === 'pending' || req.status === 'processing');
                setPendingRequests(pending);
            }
        }
        catch (error) {
            console.error('Error loading role requests from localStorage:', error);
            // Initialize with empty array if parsing fails
            setPendingRequests([]);
        }
    }, []);
    // Save requests to localStorage whenever they change
    (0, react_1.useEffect)(() => {
        try {
            // Get all requests (including non-pending) from localStorage
            const stored = localStorage.getItem('role_requests');
            const allRequests = stored ? JSON.parse(stored) : [];
            // Update pending requests
            const updatedRequests = allRequests.map((req) => pendingRequests.find(p => p.id === req.id) || req);
            // Add new pending requests
            pendingRequests.forEach(req => {
                if (!updatedRequests.find((r) => r.id === req.id)) {
                    updatedRequests.push(req);
                }
            });
            localStorage.setItem('role_requests', JSON.stringify(updatedRequests));
        }
        catch (error) {
            console.error('Error saving role requests to localStorage:', error);
        }
    }, [pendingRequests]);
    // Add a new role request
    const addRequest = (request) => {
        const newRequest = Object.assign(Object.assign({}, request), { id: Math.random().toString(36).substring(7), status: 'pending', timestamp: Date.now() });
        setPendingRequests(prev => [...prev, newRequest]);
        toast({
            title: "Solicitud enviada",
            description: `Tu solicitud para el rol ${request.role} ha sido registrada.`,
        });
        return newRequest;
    };
    // Update request status
    const updateRequestStatus = (requestId, status, transactionHash) => {
        setPendingRequests(prev => prev.map(req => req.id === requestId
            ? Object.assign(Object.assign({}, req), { status, transactionHash }) : req));
    };
    // Approve a role request
    const approveMutation = (0, react_query_1.useMutation)({
        mutationFn: (_a) => __awaiter(this, [_a], void 0, function* ({ requestId, role, userAddress }) {
            var _b;
            console.log(`[useRoleRequests] Approving request ${requestId}...`);
            // Update status to processing
            updateRequestStatus(requestId, 'processing');
            // Get role hashes
            const roleHashes = yield (0, roleUtils_1.getRoleHashes)();
            // Map role name to hash
            const roleKeyMap = {
                'FABRICANTE_ROLE': 'FABRICANTE',
                'AUDITOR_HW_ROLE': 'AUDITOR_HW',
                'TECNICO_SW_ROLE': 'TECNICO_SW',
                'ESCUELA_ROLE': 'ESCUELA',
                'DEFAULT_ADMIN_ROLE': 'ADMIN'
            };
            const roleKey = roleKeyMap[role];
            if (!roleKey) {
                throw new Error(`Rol desconocido: ${role}`);
            }
            const roleHash = roleHashes[roleKey];
            if (!roleHash) {
                throw new Error(`Hash no encontrado para el rol: ${role}`);
            }
            // Check blockchain connection first
            const isConnected = yield ((_b = supplyChainService.checkConnection) === null || _b === void 0 ? void 0 : _b.call(supplyChainService));
            if (!isConnected) {
                throw new Error('No hay conexión con la blockchain. Verifica que Anvil esté ejecutándose.');
            }
            // Blockchain Transaction - use grantRoleByHash since we have the role hash
            const result = yield supplyChainService.grantRoleByHash(roleHash, userAddress);
            if (!result.success || !result.hash) {
                throw new Error(result.error || 'Transaction failed');
            }
            const hash = result.hash;
            console.log('[useRoleRequests] Transaction submitted:', hash);
            // Update request with transaction hash
            updateRequestStatus(requestId, 'processing', hash);
            // Wait for transaction confirmation is now handled by SupplyChainService
            // with improved timeout handling and retries
            toast({
                title: 'Confirmado en Blockchain',
                description: 'La asignación de rol ha sido confirmada.',
                variant: 'default'
            });
            // Update request status to approved (removed from pending)
            setPendingRequests(prev => prev.filter(req => req.id !== requestId));
            // Invalidate cached role data to force refresh
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            queryClient.invalidateQueries({ queryKey: ['userRoles'] });
            queryClient.invalidateQueries({ queryKey: ['roleMembers'] });
            // Emit event through event bus to notify all components about role update
            events_1.eventBus.emit(events_1.EVENTS.ROLE_UPDATED, { address: userAddress, role });
            return hash;
        }),
        onMutate: (_a) => __awaiter(this, [_a], void 0, function* ({ requestId, role, userAddress }) {
            // Cancel any outgoing refetches
            yield queryClient.cancelQueries({ queryKey: QUERY_KEYS.requests });
            // Snapshot previous value
            const previousRequests = [...pendingRequests];
            // Optimistically update status to processing
            updateRequestStatus(requestId, 'processing');
            // Notify UI immediately
            toast({
                title: 'Transacción Enviada',
                description: `La asignación de rol se está procesando en la blockchain.`,
            });
            // Normalize role name for event emission
            const normalizedRole = role.replace('_ROLE', '');
            // Emit event for other components
            events_1.eventBus.emit(events_1.EVENTS.ROLE_UPDATED, {
                action: 'approved',
                address: userAddress,
                role: normalizedRole
            });
            return { previousRequests };
        }),
        onError: (err, variables, context) => {
            console.error('[useRoleRequests] Approval failed:', err);
            // Rollback to previous state if mutation fails
            if (context === null || context === void 0 ? void 0 : context.previousRequests) {
                setPendingRequests(context.previousRequests);
            }
            // Rollback optimistic update in ApprovedAccountsList
            events_1.eventBus.emit(events_1.EVENTS.ROLE_UPDATED, {
                action: 'rollback',
                address: variables.userAddress,
                role: variables.role.replace('_ROLE', '')
            });
            let errorMessage = 'La operación falló.';
            if (err instanceof Error) {
                if (err.message.includes('revert')) {
                    errorMessage = 'La transacción fue revertida. Verifica permisos.';
                }
                else if (err.message.includes('user rejected')) {
                    errorMessage = 'Transacción rechazada por el usuario.';
                }
                else if (err.message.includes('timeout')) {
                    errorMessage = 'La transacción tardó demasiado en confirmarse. Verifica que Anvil esté ejecutándose correctamente.';
                }
                else if (err.message.includes('conexión')) {
                    errorMessage = err.message;
                }
                else {
                    errorMessage = err.message;
                }
            }
            toast({
                title: 'Error al aprobar',
                description: errorMessage,
                variant: 'destructive',
            });
        },
    });
    // Reject a role request
    const rejectMutation = (0, react_query_1.useMutation)({
        mutationFn: (requestId) => __awaiter(this, void 0, void 0, function* () {
            // Update request status to rejected
            setPendingRequests(prev => prev.filter(req => req.id !== requestId));
            toast({
                title: 'Solicitud rechazada',
                description: 'La solicitud ha sido eliminada de la lista.',
            });
        }),
        onMutate: (requestId) => __awaiter(this, void 0, void 0, function* () {
            yield queryClient.cancelQueries({ queryKey: QUERY_KEYS.requests });
            const previousRequests = [...pendingRequests];
            setPendingRequests(prev => prev.filter(req => req.id !== requestId));
            return { previousRequests };
        }),
        onError: (err, variables, context) => {
            if (context === null || context === void 0 ? void 0 : context.previousRequests) {
                setPendingRequests(context.previousRequests);
            }
            toast({
                title: 'Error al rechazar',
                description: 'No se pudo rechazar la solicitud.',
                variant: 'destructive',
            });
        },
    });
    // Delete a role request
    const deleteMutation = (0, react_query_1.useMutation)({
        mutationFn: (id) => __awaiter(this, void 0, void 0, function* () {
            setPendingRequests(prev => prev.filter(req => req.id !== id));
            toast({
                title: 'Éxito',
                description: 'Solicitud eliminada correctamente',
            });
        }),
        onMutate: (id) => __awaiter(this, void 0, void 0, function* () {
            yield queryClient.cancelQueries({ queryKey: QUERY_KEYS.requests });
            const previousRequests = [...pendingRequests];
            setPendingRequests(prev => prev.filter(req => req.id !== id));
            return { previousRequests };
        }),
        onError: (err, variables, context) => {
            if (context === null || context === void 0 ? void 0 : context.previousRequests) {
                setPendingRequests(context.previousRequests);
            }
            toast({
                title: 'Error al eliminar',
                description: 'No se pudo eliminar la solicitud.',
                variant: 'destructive',
            });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.requests });
        }
    });
    return {
        requests: pendingRequests,
        addRequest,
        approveMutation,
        rejectMutation,
        deleteMutation
    };
}
