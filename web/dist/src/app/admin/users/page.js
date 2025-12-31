"use strict";
// web/src/app/admin/users/page.tsx
"use client";
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
exports.default = AdminUsersPage;
const useWeb3_1 = require("@/hooks/useWeb3");
const useSupplyChainService_1 = require("@/hooks/useSupplyChainService");
const roleUtils_1 = require("@/lib/roleUtils");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const table_1 = require("@/components/ui/table");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const select_1 = require("@/components/ui/select");
const badge_1 = require("@/components/ui/badge");
const react_1 = require("react");
const use_toast_1 = require("@/hooks/use-toast");
const navigation_1 = require("next/navigation");
const lucide_react_1 = require("lucide-react");
const react_hook_form_1 = require("react-hook-form");
const zod_1 = require("zod");
const zod_2 = require("@hookform/resolvers/zod");
// Zod Schema para el formulario de gestión de roles
// Contraseña para presets que requieren autorización
const AUTH_PASSWORD = "admin123";
const roleManagementSchema = zod_1.z.object({
    userAddress: zod_1.z.string().min(1, 'La dirección del usuario es requerida.').startsWith('0x', 'Debe ser una dirección hexadecimal válida (0x...).').length(42, 'Debe tener 42 caracteres.'),
    role: zod_1.z.string().min(1, 'Rol requerido'), // Validación básica, se verificará contra roles reales
});
function AdminUsersPage() {
    const { address, isConnected, connectWallet, defaultAdminAddress } = (0, useWeb3_1.useWeb3)();
    const { hasRole, hasRoleByHash, getAllRolesSummary, grantRole, revokeRole } = (0, useSupplyChainService_1.useSupplyChainService)();
    const { toast } = (0, use_toast_1.useToast)();
    const router = (0, navigation_1.useRouter)();
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [isAdmin, setIsAdmin] = (0, react_1.useState)(false);
    const [usersWithRoles, setUsersWithRoles] = (0, react_1.useState)([]);
    const [isSubmittingGrant, setIsSubmittingGrant] = (0, react_1.useState)(false);
    const [isSubmittingRevoke, setIsSubmittingRevoke] = (0, react_1.useState)(false);
    const [roleHashes, setRoleHashes] = (0, react_1.useState)({});
    const [availableRoles, setAvailableRoles] = (0, react_1.useState)([]);
    // Helper to get role label from hash
    const getRoleLabel = (roleHash) => {
        const roleEntry = Object.entries(roleHashes).find(([_, hash]) => hash.toLowerCase() === roleHash.toLowerCase());
        if (roleEntry) {
            return roleEntry[0];
        }
        const roleLabels = {
            DEFAULT_ADMIN_ROLE: 'Administrador',
            FABRICANTE_ROLE: 'Fabricante',
            AUDITOR_HW_ROLE: 'Auditor Hardware',
            AUDITOR_SW_ROLE: 'Auditor Software',
            GESTOR_INVENTARIO_ROLE: 'Gestor de Inventario',
            AUDITOR_CADENA_ROLE: 'Auditor de Cadena',
            SUPERVISOR_REDES_ROLE: 'Supervisor de Redes',
            PROVEEDOR_COMPONENTES_ROLE: 'Proveedor de Componentes',
            TECNICO_MANTENIMIENTO_ROLE: 'Técnico de Mantenimiento',
        };
        return roleLabels[roleHash] || roleHash.substring(0, 8);
    };
    const form = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_2.zodResolver)(roleManagementSchema),
        defaultValues: {
            userAddress: '',
            role: 'FABRICANTE_ROLE', // Rol por defecto en el select
        },
    });
    const fetchUsersAndRoles = (0, react_1.useCallback)(() => __awaiter(this, void 0, void 0, function* () {
        if (!isConnected || !address) {
            setLoading(false);
            setIsAdmin(false);
            return;
        }
        setLoading(true);
        try {
            // Get role hashes from contract
            const hashes = yield (0, roleUtils_1.getRoleHashes)();
            setRoleHashes(hashes);
            // Create available roles list for the form (excluding DEFAULT_ADMIN_ROLE for safety)
            const available = Object.entries(hashes)
                .filter(([key, _]) => key !== "ADMIN")
                .map(([key, hash]) => ({
                key,
                label: key.replace(/_/g, ' '),
                hash
            }));
            setAvailableRoles(available);
            const userIsAdmin = yield hasRoleByHash(hashes.ADMIN, address);
            setIsAdmin(userIsAdmin);
            if (userIsAdmin) {
                // Here we'd want to use getAllRolesSummary but it needs updating
                // For now, this handles displaying users
                const summary = yield getAllRolesSummary();
                const consolidatedUsers = {};
                for (const roleNameKey in summary) {
                    if (Object.prototype.hasOwnProperty.call(summary, roleNameKey)) {
                        const roleName = roleNameKey;
                        if (summary[roleName] && Array.isArray(summary[roleName].members)) {
                            summary[roleName].members.forEach((memberAddress) => {
                                const address = memberAddress;
                                if (!consolidatedUsers[address]) {
                                    consolidatedUsers[address] = [];
                                }
                                // Only add the role if it's not already present
                                if (!consolidatedUsers[address].includes(roleName)) {
                                    consolidatedUsers[address].push(roleName);
                                }
                            });
                        }
                    }
                }
                // Only add default admin role if address is known and not already present
                if (defaultAdminAddress && !consolidatedUsers[defaultAdminAddress]) {
                    consolidatedUsers[defaultAdminAddress] = ["DEFAULT_ADMIN_ROLE"];
                }
                else if (defaultAdminAddress && consolidatedUsers[defaultAdminAddress] && !consolidatedUsers[defaultAdminAddress].includes("DEFAULT_ADMIN_ROLE")) {
                    consolidatedUsers[defaultAdminAddress].push("DEFAULT_ADMIN_ROLE");
                }
                const formattedUsers = Object.entries(consolidatedUsers)
                    .map(([addr, roles]) => ({
                    address: addr,
                    roles: roles.sort()
                }));
                setUsersWithRoles(formattedUsers);
            }
        }
        catch (err) {
            console.error('Error fetching users and roles:', err);
            toast({
                title: "Error al cargar usuarios y roles",
                description: err.message || "No se pudieron cargar los datos",
                variant: "destructive",
            });
        }
        finally {
            setLoading(false);
        }
    }), [address, defaultAdminAddress, getAllRolesSummary, hasRole, isConnected, toast]);
    (0, react_1.useEffect)(() => {
        fetchUsersAndRoles();
    }, [fetchUsersAndRoles]);
    const onGrantRoleSubmit = (data) => __awaiter(this, void 0, void 0, function* () {
        setIsSubmittingGrant(true);
        try {
            // Strip _ROLE suffix from the selected role value before passing to grantRole
            const baseRoleName = data.role.replace('_ROLE', '');
            const result = yield grantRole(baseRoleName, data.userAddress);
            if (result.success) {
                toast({
                    title: "Rol Otorgado",
                    description: `Se otorgó el rol ${data.role} a ${data.userAddress}.${result.hash ? ' Tx: ' + result.hash : ''}`,
                });
            }
            else {
                toast({
                    title: "Error al otorgar rol",
                    description: result.error || "Desconocido",
                    variant: "destructive"
                });
                return;
            }
            form.reset({ userAddress: '', role: 'FABRICANTE_ROLE' });
            yield fetchUsersAndRoles(); // Refrescar la lista de usuarios
        }
        catch (err) {
            console.error('Error granting role:', err);
            toast({
                title: "Error al otorgar rol",
                description: err.message || "Ocurrió un error inesperado.",
                variant: "destructive",
            });
        }
        finally {
            setIsSubmittingGrant(false);
        }
    });
    const onRevokeRoleSubmit = (data) => __awaiter(this, void 0, void 0, function* () {
        setIsSubmittingRevoke(true);
        try {
            const result = yield revokeRole(data.role, data.userAddress);
            // revokeRole only returns hash if successful
            toast({
                title: "Rol Revocado",
                description: `Se revocó el rol ${data.role} a ${data.userAddress}.${result ? ' Tx: ' + result : ''}`,
            });
            form.reset({ userAddress: '', role: 'FABRICANTE_ROLE' });
            yield fetchUsersAndRoles(); // Refrescar la lista de usuarios
        }
        catch (err) {
            console.error('Error revoking role:', err);
            toast({
                title: "Error al revocar rol",
                description: err.message || "Ocurrió un error inesperado.",
                variant: "destructive",
            });
        }
        finally {
            setIsSubmittingRevoke(false);
        }
    });
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copiado al portapapeles", description: text });
    };
    if (!isConnected) {
        return (<div className="container mx-auto px-4 py-12">
        <card_1.Card className="border-dashed border-2">
          <card_1.CardContent className="flex flex-col items-center justify-center py-16 space-y-6">
            <h3 className="text-xl font-medium text-foreground mb-2">Acceso Restringido</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Por favor, conecta tu wallet para acceder a la gestión de usuarios.
            </p>
            <button_1.Button size="lg" variant="gradient" onClick={() => connectWallet()} className="h-12 px-8">
              Conectar Wallet
            </button_1.Button>
          </card_1.CardContent>
        </card_1.Card>
      </div>);
    }
    if (loading) {
        return (<div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <lucide_react_1.Loader2 className="h-12 w-12 text-primary animate-spin"/>
          <p className="text-lg text-muted-foreground animate-pulse">Cargando usuarios y roles...</p>
        </div>
      </div>);
    }
    if (!isAdmin) {
        return (<div className="container mx-auto px-4 py-12">
        <card_1.Card className="border-dashed border-2">
          <card_1.CardContent className="flex flex-col items-center justify-center py-16 space-y-6">
            <lucide_react_1.ShieldAlert className="h-12 w-12 text-red-500/50 mb-4"/>
            <h3 className="text-xl font-medium text-red-500 mb-2">Acceso Denegado</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Solo los administradores pueden gestionar los roles de los usuarios.
            </p>
            <button_1.Button onClick={() => router.push('/admin')} className="gap-2">
              <lucide_react_1.ArrowLeft className="h-4 w-4"/> Volver al Panel Admin
            </button_1.Button>
          </card_1.CardContent>
        </card_1.Card>
      </div>);
    }
    return (<div className="container mx-auto px-4 py-12 space-y-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios y Roles</h1>
        <button_1.Button onClick={() => router.push('/admin')} variant="outline" className="gap-2">
          <lucide_react_1.ArrowLeft className="h-4 w-4"/> Volver al Panel Admin
        </button_1.Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario para asignar/revocar roles */}
        <card_1.Card className="lg:col-span-1"> 
          <card_1.CardHeader>
            <card_1.CardTitle>Asignar/Revocar Rol</card_1.CardTitle>
            <card_1.CardDescription>Otorga o quita un rol a una dirección específica.</card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <form onSubmit={form.handleSubmit(onGrantRoleSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label_1.Label htmlFor="userAddress">Dirección del Usuario</label_1.Label>
                <input_1.Input id="userAddress" placeholder="0x..." {...form.register("userAddress")}/>
                {form.formState.errors.userAddress && (<p className="text-sm text-red-500">{form.formState.errors.userAddress.message}</p>)}
              </div>
              <div className="space-y-2">
                <label_1.Label htmlFor="roleSelect">Seleccionar Rol</label_1.Label>
                <select_1.Select onValueChange={(value) => form.setValue("role", value)} value={form.watch("role")}>
                  <select_1.SelectTrigger id="roleSelect">
                    <select_1.SelectValue placeholder="Selecciona un rol"/>
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    {availableRoles.map((role) => (<select_1.SelectItem key={role.key} value={role.key}> 
                        {role.label} 
                      </select_1.SelectItem>))}
                  </select_1.SelectContent>
                </select_1.Select>
                {form.formState.errors.role && (<p className="text-sm text-red-500">{form.formState.errors.role.message}</p>)}
              </div>
              <div className="flex gap-2">
                <button_1.Button type="submit" className="flex-1 gap-2" disabled={isSubmittingGrant}>
                  {isSubmittingGrant ? (<lucide_react_1.Loader2 className="h-4 w-4 animate-spin"/>) : (<lucide_react_1.UserPlus className="h-4 w-4"/>)}
                  Otorgar Rol
                </button_1.Button>
                <button_1.Button type="button" variant="destructive" className="flex-1 gap-2" onClick={form.handleSubmit(onRevokeRoleSubmit)} disabled={isSubmittingRevoke}>
                  {isSubmittingRevoke ? (<lucide_react_1.Loader2 className="h-4 w-4 animate-spin"/>) : (<lucide_react_1.UserMinus className="h-4 w-4"/>)}
                  Revocar Rol
                </button_1.Button>
              </div>
            </form>
          </card_1.CardContent>
        </card_1.Card>

        {/* Listado de Usuarios y Roles */}
        <card_1.Card className="lg:col-span-2">
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Users className="h-5 w-5 text-primary"/>
              Roles Asignados
            </card_1.CardTitle>
            <card_1.CardDescription>Visualiza todos los usuarios y los roles que tienen asignados.</card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="p-0">
            {usersWithRoles.length > 0 ? (<div className="overflow-x-auto">
                <table_1.Table>
                  <table_1.TableHeader>
                    <table_1.TableRow>
                      <table_1.TableHead className="min-w-[150px]">Dirección</table_1.TableHead>
                      <table_1.TableHead>Roles</table_1.TableHead>
                      <table_1.TableHead className="text-right">Acciones</table_1.TableHead>
                    </table_1.TableRow>
                  </table_1.TableHeader>
                  <table_1.TableBody>
                    {usersWithRoles.map((user) => (<table_1.TableRow key={user.address}>
                        <table_1.TableCell className="font-mono text-xs flex items-center gap-1">
                          {user.address.substring(0, 6) + '...' + user.address.substring(38)}
                          <button_1.Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(user.address)}>
                            <lucide_react_1.ClipboardCopy className="h-4 w-4"/>
                          </button_1.Button>
                        </table_1.TableCell>
                        <table_1.TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.roles.map((role, roleIndex) => (<badge_1.Badge key={roleIndex} variant="secondary" className="px-2 py-0.5 text-xs">
                                {role.replace(/_/g, ' ')}
                              </badge_1.Badge>))}
                          </div>
                        </table_1.TableCell>
                        <table_1.TableCell className="text-right">
                          <button_1.Button variant="outline" size="sm" onClick={() => form.setValue("userAddress", user.address)}>
                            Editar
                          </button_1.Button>
                        </table_1.TableCell>
                      </table_1.TableRow>))}
                  </table_1.TableBody>
                </table_1.Table>
              </div>) : (<div className="text-center py-12 text-muted-foreground">
                <lucide_react_1.Users className="mx-auto h-12 w-12 mb-4 opacity-20"/>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No hay usuarios con roles asignados
                </h3>
                <p className="mb-6">
                  Usa el formulario para empezar a asignar roles a los participantes del sistema.
                </p>
              </div>)}
          </card_1.CardContent>
        </card_1.Card>
      </div>
    </div>);
}
