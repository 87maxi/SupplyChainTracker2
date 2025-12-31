"use strict";
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
exports.default = ProfilePage;
const useWeb3_1 = require("@/hooks/useWeb3");
const useSupplyChainService_1 = require("@/hooks/useSupplyChainService");
const useRoleRequests_1 = require("@/hooks/useRoleRequests");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const label_1 = require("@/components/ui/label");
const select_1 = require("@/components/ui/select");
const react_1 = require("react");
const use_toast_1 = require("@/hooks/use-toast");
const lucide_react_1 = require("lucide-react");
const badge_1 = require("@/components/ui/badge");
const roleUtils_1 = require("@/lib/roleUtils");
function ProfilePage() {
    const { address, isConnected, disconnect, connectWallet } = (0, useWeb3_1.useWeb3)();
    const { hasRole, hasRoleByHash, getAccountBalance } = (0, useSupplyChainService_1.useSupplyChainService)();
    const { addRequest } = (0, useRoleRequests_1.useRoleRequests)();
    const { toast } = (0, use_toast_1.useToast)();
    const [balance, setBalance] = (0, react_1.useState)(null);
    const [userRoles, setUserRoles] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)('');
    const [selectedRole, setSelectedRole] = (0, react_1.useState)('');
    const fetchProfileData = (0, react_1.useCallback)(() => __awaiter(this, void 0, void 0, function* () {
        if (!isConnected || !address) {
            setLoading(false);
            setError('Wallet no conectada.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            // Fetch balance
            const fetchedBalance = yield getAccountBalance(address);
            setBalance(fetchedBalance);
            // Fetch user roles
            // First get all role hashes from the contract
            const roleHashes = yield (0, roleUtils_1.getRoleHashes)();
            // Define a mapping of our expected role keys to their actual hashes in the contract
            const roleKeysToCheck = ['FABRICANTE', 'AUDITOR_HW', 'TECNICO_SW', 'ESCUELA', 'ADMIN'];
            const rolesFound = [];
            // Check each role by its hash
            if (roleHashes.FABRICANTE && (yield hasRoleByHash(roleHashes.FABRICANTE, address))) {
                rolesFound.push('FABRICANTE_ROLE');
            }
            if (roleHashes.AUDITOR_HW && (yield hasRoleByHash(roleHashes.AUDITOR_HW, address))) {
                rolesFound.push('AUDITOR_HW_ROLE');
            }
            if (roleHashes.TECNICO_SW && (yield hasRoleByHash(roleHashes.TECNICO_SW, address))) {
                rolesFound.push('TECNICO_SW_ROLE');
            }
            if (roleHashes.ESCUELA && (yield hasRoleByHash(roleHashes.ESCUELA, address))) {
                rolesFound.push('ESCUELA_ROLE');
            }
            if (roleHashes.ADMIN && (yield hasRoleByHash(roleHashes.ADMIN, address))) {
                rolesFound.push('DEFAULT_ADMIN_ROLE');
            }
            setUserRoles(rolesFound.sort()); // Ordenar roles alfabéticamente
        }
        catch (err) {
            console.error('Error fetching profile data:', err);
            setError(`No se pudo cargar la información del perfil: ${err.message}`);
            setBalance(null);
            setUserRoles([]);
        }
        finally {
            setLoading(false);
        }
    }), [isConnected, address, getAccountBalance, hasRole]);
    (0, react_1.useEffect)(() => {
        fetchProfileData();
    }, [fetchProfileData]);
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copiado al portapapeles", description: text });
    };
    const submitRoleRequest = () => __awaiter(this, void 0, void 0, function* () {
        if (!selectedRole || !address) {
            toast({
                title: "Error",
                description: "Por favor selecciona un rol para solicitar",
                variant: "destructive",
            });
            return;
        }
        // Submit request through roleRequests hook
        try {
            addRequest({
                address,
                role: selectedRole
            });
            toast({
                title: "Solicitud enviada",
                description: `Tu solicitud para el rol ${selectedRole} ha sido registrada.`,
            });
            setSelectedRole('');
        }
        catch (error) {
            console.error('Error submitting role request:', error);
            toast({
                title: "Error",
                description: error.message || "No se pudo enviar la solicitud",
                variant: "destructive",
            });
        }
    });
    if (!isConnected) {
        return (<div className="container mx-auto px-4 py-12">
        <card_1.Card className="border-dashed border-2">
          <card_1.CardContent className="flex flex-col items-center justify-center py-16 space-y-6">
            <h3 className="text-xl font-medium text-foreground mb-2">Acceso Restringido</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Por favor, conecta tu wallet para ver la información de tu perfil.
            </p>
            <button_1.Button size="lg" variant="gradient" onClick={() => connectWallet()} className="h-12 px-8 gap-2">
              <lucide_react_1.Link className="h-4 w-4"/> Conectar Wallet
            </button_1.Button>
          </card_1.CardContent>
        </card_1.Card>
      </div>);
    }
    if (loading) {
        return (<div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <lucide_react_1.Loader2 className="h-12 w-12 text-primary animate-spin"/>
          <p className="text-lg text-muted-foreground animate-pulse">Cargando información del perfil...</p>
        </div>
      </div>);
    }
    return (<div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Mi Perfil</h1>

      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Información de la Cuenta</card_1.CardTitle>
          <card_1.CardDescription>Detalles de tu wallet y roles asignados en el sistema.</card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-6">
          {error && <div className="text-red-500 p-4 rounded-md bg-red-50 mb-4">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label_1.Label>Dirección de la Wallet</label_1.Label>
              <div className="p-3 bg-card-foreground/5 rounded-md font-mono text-sm flex items-center justify-between">
                <span>{address}</span>
                <button_1.Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => address && copyToClipboard(address)}>
                  <lucide_react_1.ClipboardCopy className="h-4 w-4"/>
                </button_1.Button>
              </div>
            </div>

            <div className="space-y-2">
              <label_1.Label>Saldo ETH</label_1.Label>
              <div className="p-3 bg-card-foreground/5 rounded-md flex items-center gap-2">
                <lucide_react_1.Wallet className="h-4 w-4 text-primary"/>
                <span className="font-semibold">{balance !== null ? `${parseFloat(balance).toFixed(4)} ETH` : 'Cargando...'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label_1.Label>Roles en el Sistema</label_1.Label>
            <div className="flex flex-wrap gap-2 p-3 bg-card-foreground/5 rounded-md">
              {userRoles.length > 0 ? (userRoles.map((role, index) => (<badge_1.Badge key={index} variant="secondary" className="px-3 py-1 text-sm">{role}</badge_1.Badge>))) : (<span className="text-muted-foreground">Sin roles asignados</span>)}
            </div>
          </div>

          <button_1.Button onClick={() => disconnect()} variant="outline" className="mt-4">
            Desconectar Wallet
          </button_1.Button>
        </card_1.CardContent>
      </card_1.Card>

      <card_1.Card className="mt-8">
        <card_1.CardHeader>
          <card_1.CardTitle>Solicitar Acceso</card_1.CardTitle>
          <card_1.CardDescription>Selecciona el rol al que deseas solicitar acceso.</card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          <div className="space-y-2">
            <label_1.Label htmlFor="role">Seleccionar Rol</label_1.Label>
            <select_1.Select value={selectedRole} onValueChange={setSelectedRole}>
              <select_1.SelectTrigger id="role">
                <select_1.SelectValue placeholder="Selecciona un rol"/>
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="FABRICANTE">Fabricante</select_1.SelectItem>
                <select_1.SelectItem value="AUDITOR_HW">Auditor Hardware</select_1.SelectItem>
                <select_1.SelectItem value="TECNICO_SW">Técnico Software</select_1.SelectItem>
                <select_1.SelectItem value="ESCUELA">Escuela</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>
          </div>
          <button_1.Button onClick={submitRoleRequest} disabled={!selectedRole || loading} className="w-full sm:w-auto">
            Solicitar Rol
          </button_1.Button>
        </card_1.CardContent>
      </card_1.Card>
    </div>);
}
