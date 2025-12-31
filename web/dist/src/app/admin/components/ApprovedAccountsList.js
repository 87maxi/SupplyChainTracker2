"use strict";
// web/src/app/admin/components/ApprovedAccountsList.tsx
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
exports.ApprovedAccountsList = ApprovedAccountsList;
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const select_1 = require("@/components/ui/select");
const table_1 = require("@/components/ui/table");
const badge_1 = require("@/components/ui/badge");
const use_toast_1 = require("@/hooks/use-toast");
const useSupplyChainService_1 = require("@/hooks/useSupplyChainService");
const react_1 = require("react");
const utils_1 = require("@/lib/utils");
const lucide_react_1 = require("lucide-react");
const events_1 = require("@/lib/events");
const roleMapping_1 = require("@/lib/roleMapping");
const availableRoles = [
    { value: 'ALL', label: 'Todos los Roles' },
    { value: 'FABRICANTE', label: 'Fabricante' },
    { value: 'AUDITOR_HW', label: 'Auditor de Hardware' },
    { value: 'TECNICO_SW', label: 'Técnico de Software' },
    { value: 'ESCUELA', label: 'Escuela' },
    { value: 'ADMIN', label: 'Administrador' }
];
function ApprovedAccountsList() {
    const { getAllRolesSummary, revokeRole } = (0, useSupplyChainService_1.useSupplyChainService)();
    const { toast } = (0, use_toast_1.useToast)();
    const [members, setMembers] = (0, react_1.useState)([]);
    const [optimisticMembers, setOptimisticMembers] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [filterRole, setFilterRole] = (0, react_1.useState)('ALL');
    const [searchQuery, setSearchQuery] = (0, react_1.useState)('');
    const [processingAddress, setProcessingAddress] = (0, react_1.useState)(null);
    const [isLoaded, setIsLoaded] = (0, react_1.useState)(false);
    // Load optimistic members from localStorage
    (0, react_1.useEffect)(() => {
        try {
            const stored = localStorage.getItem('optimistic_approvals');
            if (stored) {
                console.log('[ApprovedAccountsList] Loaded optimistic members:', stored);
                setOptimisticMembers(JSON.parse(stored));
            }
        }
        catch (e) {
            console.error('Error loading optimistic approvals:', e);
        }
        finally {
            setIsLoaded(true);
        }
    }, []);
    // Save optimistic members to localStorage whenever they change
    (0, react_1.useEffect)(() => {
        if (!isLoaded)
            return; // Prevent overwriting before load
        console.log('[ApprovedAccountsList] Saving optimistic members to localStorage:', optimisticMembers);
        localStorage.setItem('optimistic_approvals', JSON.stringify(optimisticMembers));
    }, [optimisticMembers, isLoaded]);
    const fetchMembers = (0, react_1.useCallback)((...args_1) => __awaiter(this, [...args_1], void 0, function* (force = false) {
        setLoading(true);
        try {
            const summary = yield getAllRolesSummary(force);
            const allMembers = [];
            if (summary) {
                Object.entries(summary).forEach(([roleKey, data]) => {
                    var _a;
                    if (data && data.members && Array.isArray(data.members)) {
                        const roleLabel = ((_a = availableRoles.find(r => r.value === roleKey)) === null || _a === void 0 ? void 0 : _a.label) || roleKey;
                        data.members.forEach((address) => {
                            allMembers.push({
                                address,
                                role: roleKey,
                                roleLabel
                            });
                        });
                    }
                });
                setMembers(allMembers);
            }
            // Clear optimistic members that are now in the real list
            setOptimisticMembers(prev => {
                const filtered = prev.filter(opt => !allMembers.some(real => real.address.toLowerCase() === opt.address.toLowerCase() && real.role === opt.role));
                return filtered;
            });
        }
        catch (error) {
            console.error('Error fetching members:', error);
            toast({
                title: "Error",
                description: "No se pudieron cargar los usuarios aprobados.",
                variant: "destructive"
            });
        }
        finally {
            setLoading(false);
        }
    }), [getAllRolesSummary, toast]);
    (0, react_1.useEffect)(() => {
        fetchMembers(false);
        const unsubscribe = events_1.eventBus.on(events_1.EVENTS.ROLE_UPDATED, (data) => {
            var _a;
            console.log('[ApprovedAccountsList] Role update received:', data);
            if (data && data.action === 'approved' && data.address && data.role) {
                // Optimistically add the new member
                const roleLabel = ((_a = availableRoles.find(r => r.value === data.role)) === null || _a === void 0 ? void 0 : _a.label) || data.role;
                const newMember = {
                    address: data.address,
                    role: data.role,
                    roleLabel: roleLabel
                };
                setOptimisticMembers(prev => {
                    // Avoid duplicates
                    if (prev.some(m => m.address === newMember.address && m.role === newMember.role))
                        return prev;
                    return [newMember, ...prev];
                });
            }
            // Also trigger a background fetch
            fetchMembers(true);
        });
        return () => unsubscribe();
    }, [fetchMembers]);
    const handleRevoke = (role, address) => __awaiter(this, void 0, void 0, function* () {
        if (!confirm('¿Estás seguro de que deseas revocar este rol?'))
            return;
        setProcessingAddress(address);
        try {
            // 1. Get the role hash using our centralized mapper
            const roleHash = yield roleMapping_1.roleMapper.getRoleHash(role);
            // 2. Send transaction with the proper role hash
            const hash = yield revokeRole(roleHash, address);
            console.log('[ApprovedAccountsList] Revoke TX submitted:', hash);
            toast({
                title: "Transacción Enviada",
                description: "La revocación se ha enviado a la blockchain.",
            });
            // 2. Optimistic Update: Remove from BOTH lists immediately
            setOptimisticMembers(prev => prev.filter(m => m.address !== address));
            setMembers(prev => prev.filter(m => m.address !== address));
            // 3. Trigger background refresh (non-blocking)
            // We don't wait for it here, just kick it off
            fetchMembers(true);
        }
        catch (error) {
            console.error('Error revoking role:', error);
            toast({
                title: "Error",
                description: error.message || "No se pudo revocar el rol",
                variant: "destructive"
            });
        }
        finally {
            setProcessingAddress(null);
        }
    });
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copiado",
            description: "Dirección copiada al portapapeles"
        });
    };
    // Merge real and optimistic members
    const allDisplayMembers = [...optimisticMembers, ...members];
    // Filter logic
    const filteredMembers = allDisplayMembers.filter((member, index, self) => {
        // Deduplicate based on address+role (prefer optimistic if it's newer, but here we just take the first one)
        const isDuplicate = self.findIndex(m => m.address === member.address && m.role === member.role) !== index;
        if (isDuplicate)
            return false;
        const matchesRole = filterRole === 'ALL' || member.role === filterRole;
        const matchesSearch = member.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.roleLabel.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesRole && matchesSearch;
    });
    return (<card_1.Card>
            <card_1.CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <card_1.CardTitle>Cuentas Aprobadas</card_1.CardTitle>
                        <card_1.CardDescription>Lista completa de usuarios con acceso al sistema</card_1.CardDescription>
                    </div>
                    <button_1.Button variant="outline" size="icon" onClick={() => fetchMembers(true)} disabled={loading}>
                        <lucide_react_1.RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}/>
                    </button_1.Button>
                </div>
            </card_1.CardHeader>
            <card_1.CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <lucide_react_1.Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/>
                        <input_1.Input placeholder="Buscar por dirección..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8"/>
                    </div>
                    <div className="w-full sm:w-[200px]">
                        <select_1.Select value={filterRole} onValueChange={(value) => setFilterRole(value)}>
                            <select_1.SelectTrigger>
                                <select_1.SelectValue placeholder="Filtrar por rol"/>
                            </select_1.SelectTrigger>
                            <select_1.SelectContent>
                                {availableRoles.map((role) => (<select_1.SelectItem key={role.value} value={role.value}>
                                        {role.label}
                                    </select_1.SelectItem>))}
                            </select_1.SelectContent>
                        </select_1.Select>
                    </div>
                </div>

                <div className="rounded-md border">
                    <table_1.Table>
                        <table_1.TableHeader>
                            <table_1.TableRow>
                                <table_1.TableHead>Usuario</table_1.TableHead>
                                <table_1.TableHead>Rol Asignado</table_1.TableHead>
                                <table_1.TableHead className="text-right">Acciones</table_1.TableHead>
                            </table_1.TableRow>
                        </table_1.TableHeader>
                        <table_1.TableBody>
                            {loading && members.length === 0 ? (<table_1.TableRow>
                                    <table_1.TableCell colSpan={3} className="h-24 text-center">
                                        Cargando usuarios...
                                    </table_1.TableCell>
                                </table_1.TableRow>) : filteredMembers.length > 0 ? (filteredMembers.map((member) => {
            const isOptimistic = optimisticMembers.some(m => m.address === member.address && m.role === member.role);
            return (<table_1.TableRow key={`${member.address}-${member.role}`} className={isOptimistic ? "bg-muted/30" : ""}>
                                            <table_1.TableCell className="font-mono text-sm">
                                                <div className="flex items-center gap-2">
                                                    {(0, utils_1.truncateAddress)(member.address)}
                                                    <button_1.Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(member.address)}>
                                                        <lucide_react_1.Copy className="h-3 w-3"/>
                                                    </button_1.Button>
                                                    {isOptimistic && (<badge_1.Badge variant="outline" className="text-xs border-yellow-500 text-yellow-600 bg-yellow-50">
                                                            Procesando
                                                        </badge_1.Badge>)}
                                                </div>
                                            </table_1.TableCell>
                                            <table_1.TableCell>
                                                <badge_1.Badge variant="secondary" className="font-normal">
                                                    {member.roleLabel}
                                                </badge_1.Badge>
                                            </table_1.TableCell>
                                            <table_1.TableCell className="text-right">
                                                <button_1.Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleRevoke(member.role, member.address)} disabled={processingAddress === member.address || member.role === 'DEFAULT_ADMIN_ROLE'}>
                                                    {processingAddress === member.address ? (<lucide_react_1.RefreshCw className="h-4 w-4 animate-spin"/>) : (<lucide_react_1.Trash2 className="h-4 w-4"/>)}
                                                    <span className="sr-only">Revocar</span>
                                                </button_1.Button>
                                            </table_1.TableCell>
                                        </table_1.TableRow>);
        })) : (<table_1.TableRow>
                                    <table_1.TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                        No se encontraron usuarios con los filtros actuales.
                                    </table_1.TableCell>
                                </table_1.TableRow>)}
                        </table_1.TableBody>
                    </table_1.Table>
                </div>
            </card_1.CardContent>
        </card_1.Card>);
}
