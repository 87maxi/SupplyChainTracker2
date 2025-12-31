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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemHealth = SystemHealth;
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const badge_1 = require("@/components/ui/badge");
const wagmi_1 = require("wagmi");
const SupplyChainTracker_json_1 = __importDefault(require("@/contracts/abi/SupplyChainTracker.json"));
const env_1 = require("@/lib/env");
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const roleUtils_1 = require("@/lib/roleUtils");
const useSupplyChainService_1 = require("@/hooks/useSupplyChainService");
const skeleton_1 = require("@/components/ui/skeleton");
const input_1 = require("@/components/ui/input");
const contractAddress = env_1.NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS;
// Helper para determinar el badge
const getBadgeVariant = (status) => {
    switch (status) {
        case 'success': return 'default';
        case 'warning': return 'warning';
        case 'error': return 'destructive';
        default: return 'outline';
    }
};
// Helper para determinar el color de texto
const getTextColor = (status) => {
    switch (status) {
        case 'success': return 'text-green-500';
        case 'warning': return 'text-yellow-500';
        case 'error': return 'text-red-500';
        default: return 'text-muted-foreground';
    }
};
/**
 * Componente de Diagnóstico del Sistema
 *
 * Proporciona un panel de control para el administrador que verifica
 * el estado de la red, el contrato y los permisos. Incluye una herramienta
 * para verificar roles de cualquier dirección.
 */
function SystemHealth() {
    const { address, chainId } = (0, wagmi_1.useAccount)();
    const { hasRole } = (0, useSupplyChainService_1.useSupplyChainService)();
    const [panels, setPanels] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [username, setUsername] = (0, react_1.useState)('');
    const [userAddress, setUserAddress] = (0, react_1.useState)('');
    const [verifyingAddress, setVerifyingAddress] = (0, react_1.useState)(false);
    const [verificationResult, setVerificationResult] = (0, react_1.useState)(null);
    // Estado de los datos
    const [contractName, setContractName] = (0, react_1.useState)(null);
    const [isContractError, setIsContractError] = (0, react_1.useState)(false);
    const [isAdmin, setIsAdmin] = (0, react_1.useState)(false);
    const [localHashes, setLocalHashes] = (0, react_1.useState)(null);
    const [contractFabricanteHash, setContractFabricanteHash] = (0, react_1.useState)(null);
    // Ref para el estado inicial
    const initialFetchRef = (0, react_1.useRef)(true);
    // Hooks para verificar datos del contrato
    const { data: defaultAdminRole } = (0, wagmi_1.useReadContract)({
        address: contractAddress,
        abi: SupplyChainTracker_json_1.default,
        functionName: 'DEFAULT_ADMIN_ROLE',
    });
    const { data: isAddressAdmin, refetch: refetchAdmin } = (0, wagmi_1.useReadContract)({
        address: contractAddress,
        abi: SupplyChainTracker_json_1.default,
        functionName: 'hasRole',
        args: [defaultAdminRole, address],
        query: {
            enabled: !!address && !!defaultAdminRole,
        }
    });
    const { data: contractFabricanteHashData, refetch: refetchFabricante } = (0, wagmi_1.useReadContract)({
        address: contractAddress,
        abi: SupplyChainTracker_json_1.default,
        functionName: 'FABRICANTE_ROLE',
        query: {
            enabled: false
        }
    });
    const { data: contractNameData, refetch: refetchName } = (0, wagmi_1.useReadContract)({
        address: contractAddress,
        abi: SupplyChainTracker_json_1.default,
        functionName: 'name',
        query: {
            enabled: false,
            retry: 1
        }
    });
    // Función para generar un reporte detallado
    const generateDetailedReport = () => {
        const reportData = {
            timestamp: new Date().toISOString(),
            network: {
                chainId,
                isExpected: chainId === 31337
            },
            contract: {
                address: contractAddress,
                name: contractName,
                isConnected: !isContractError && !!contractName
            },
            user: {
                address,
                isSystemAdmin: isAdmin
            },
            roles: {
                localHashes,
                contractFabricanteHash,
                isConsistent: (localHashes === null || localHashes === void 0 ? void 0 : localHashes.FABRICANTE) === contractFabricanteHashData
            },
            verificationResult
        };
        // Export data as JSON file
        const jsonData = JSON.stringify(reportData, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `system_health_report_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        // Clean up
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };
    // Función central para verificar el estado del sistema
    const checkHealth = (...args_1) => __awaiter(this, [...args_1], void 0, function* (silent = false) {
        if (!silent)
            setLoading(true);
        try {
            // Refetch all contract data
            yield refetchName();
            yield refetchAdmin();
            yield refetchFabricante();
            // Update local state immediately from refetch result
            setContractName(contractNameData ? String(contractNameData) : null);
            setIsAdmin(Boolean(isAddressAdmin));
            setContractFabricanteHash(contractFabricanteHashData ? String(contractFabricanteHashData) : null);
            // Get local hashes
            const hashes = yield (0, roleUtils_1.getRoleHashes)();
            setLocalHashes(hashes);
            // Determine panel status
            const networkCorrect = chainId === 31337;
            const contractConnected = !isContractError && !!contractName;
            const rolesConsistent = (hashes === null || hashes === void 0 ? void 0 : hashes.FABRICANTE) === contractFabricanteHashData;
            setPanels([
                {
                    title: 'Red',
                    value: chainId ? `Chain ID: ${chainId}` : 'Desconectado',
                    status: networkCorrect ? 'success' : 'error',
                    icon: <lucide_react_1.CheckCircle2 className="h-4 w-4"/>, action: !networkCorrect && <badge_1.Badge variant="destructive">31337</badge_1.Badge>
                },
                {
                    title: 'Contrato',
                    value: contractConnected ? contractName : 'Error',
                    status: contractConnected ? 'success' : 'error', icon: contractConnected ? <lucide_react_1.CheckCircle2 className="h-4 w-4"/> : <lucide_react_1.XCircle className="h-4 w-4"/>
                },
                {
                    title: 'Permiso Admin',
                    value: isAdmin ? 'Verificado' : 'No es Admin',
                    status: isAdmin ? 'success' : 'warning',
                    icon: isAdmin ? <lucide_react_1.CheckCircle2 className="h-4 w-4"/> : <lucide_react_1.AlertTriangle className="h-4 w-4"/>
                },
                {
                    title: 'Consistencia de Roles',
                    value: rolesConsistent ? 'Correcto' : 'Mismatch',
                    status: rolesConsistent ? 'success' : 'warning',
                    icon: rolesConsistent ? <lucide_react_1.CheckCircle2 className="h-4 w-4"/> : <lucide_react_1.AlertTriangle className="h-4 w-4"/>
                }
            ]);
        }
        catch (e) {
            console.error(e);
            setPanels([
                {
                    title: 'Red',
                    value: 'Error',
                    status: 'error',
                    icon: <lucide_react_1.XCircle className="h-4 w-4"/>
                },
                {
                    title: 'Contrato',
                    value: 'Error',
                    status: 'error',
                    icon: <lucide_react_1.XCircle className="h-4 w-4"/>
                },
                {
                    title: 'Permiso Admin',
                    value: 'Error',
                    status: 'error',
                    icon: <lucide_react_1.XCircle className="h-4 w-4"/>
                },
                {
                    title: 'Consistencia de Roles',
                    value: 'Error',
                    status: 'error',
                    icon: <lucide_react_1.XCircle className="h-4 w-4"/>
                }
            ]);
        }
        finally {
            setLoading(false);
        }
    });
    // Check health on mount and when address changes
    (0, react_1.useEffect)(() => {
        if (initialFetchRef.current) {
            initialFetchRef.current = false;
            checkHealth(true); // Silent first check
        }
        else {
            checkHealth();
        }
    }, [address]);
    // Función para verificar roles de cualquier dirección
    const handleVerifyRole = () => __awaiter(this, void 0, void 0, function* () {
        if (!userAddress.trim()) {
            alert('Por favor, ingresa una dirección de Ethereum.');
            return;
        }
        // Validar el formato de la dirección
        if (!userAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
            alert('La dirección ingresada no tiene un formato válido (debe ser 0x seguido de 40 caracteres hexadecimales).');
            return;
        }
        setVerifyingAddress(true);
        try {
            // Obtén los hashes de todos los roles
            const roleHashes = yield (0, roleUtils_1.getRoleHashes)();
            // Arreglo de promesas para leer los roles concurrentemente
            const roleChecks = Object.entries(roleHashes).map((_a) => __awaiter(this, [_a], void 0, function* ([roleName, hash]) {
                const { data: hasRole } = yield (0, wagmi_1.useReadContract)({
                    address: contractAddress,
                    abi: SupplyChainTracker_json_1.default,
                    functionName: 'hasRole',
                    args: [hash, userAddress],
                });
                return {
                    role: roleName,
                    has: !!hasRole
                };
            }));
            // Ejecutar todas las verificaciones de roles en paralelo
            const roles = yield Promise.all(roleChecks);
            // Verificar si es admin
            const isAdminRole = yield hasRole('DEFAULT_ADMIN_ROLE', userAddress);
            setVerificationResult({
                address: userAddress,
                isAdmin: isAdminRole,
                roles
            });
        }
        catch (error) {
            console.error('Error al verificar roles:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            alert(`Ocurrió un error al verificar los roles. Por favor, intenta nuevamente.\nError: ${errorMessage}`);
        }
        finally {
            setVerifyingAddress(false);
        }
    });
    return (<card_1.Card className="mb-6 border-l-4 border-l-blue-500">
      <card_1.CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <card_1.CardTitle>🏥 Diagnóstico del Sistema</card_1.CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <button_1.Button variant="outline" size="sm" onClick={generateDetailedReport} disabled={loading}>
            Generar Reporte
          </button_1.Button>
          <button_1.Button variant="ghost" size="sm" onClick={() => checkHealth()} disabled={loading}>
            <lucide_react_1.RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}/>
          </button_1.Button>
        </div>
      </card_1.CardHeader>
      <card_1.CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {panels.length > 0 ? (panels.map((panel) => (<div key={panel.title} className="p-3 bg-muted/20 rounded-lg border">
                <div className="text-xs text-muted-foreground mb-1">{panel.title}</div>
                <div className={`flex items-center gap-2 font-mono text-sm ${getTextColor(panel.status)}`}>
                  {panel.icon}
                  {panel.value}
                  {panel.action && <span> {panel.action}</span>}
                </div>
              </div>))) : (
        // Loading skeleton
        Array.from({ length: 4 }).map((_, i) => (<div key={i} className="p-3 bg-muted/20 rounded-lg border">
                <div className="text-xs text-muted-foreground mb-1">
                  <skeleton_1.Skeleton className="h-4 w-16"/>
                </div>
                <div className="flex items-center gap-2">
                  <skeleton_1.Skeleton className="h-4 w-20"/>
                </div>
              </div>)))}
        </div>

        {/* Manual Role Checker */}
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">Verificación de Roles</h4>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-grow">
              <input_1.Input type="text" placeholder="Nombre de usuario (opcional)" value={username} onChange={(e) => setUsername(e.target.value)} className="h-8 text-sm"/>
            </div>
            <div className="flex-grow">
              <input_1.Input type="text" placeholder="Dirección de Ethereum (0x...)," id="verify-address-input" value={userAddress} onChange={(e) => setUserAddress(e.target.value)} className="h-8 text-sm" disabled={verifyingAddress}/>
            </div>
            <button_1.Button onClick={handleVerifyRole} disabled={verifyingAddress} className="h-8 whitespace-nowrap">
              {verifyingAddress ? 'Verificando...' : 'Verificar'}
            </button_1.Button>
          </div>

          {/* Resultado de la verificación */}
          {verificationResult && (<div className="mt-3 rounded-md border p-3 bg-muted">
              <h5 className="text-sm font-medium mb-2">Resultado para <span className="font-mono">{verificationResult.address}</span></h5>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Admin:</span>
                  <badge_1.Badge variant={verificationResult.isAdmin ? 'default' : 'secondary'} className="text-xs">
                    {verificationResult.isAdmin ? '✅ Sí' : '❌ No'}
                  </badge_1.Badge>
                </div>
                <div className="mt-2">
                  <h6 className="font-medium text-xs text-muted-foreground">Roles Asignados:</h6>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {verificationResult.roles.map(({ role, has }) => (<badge_1.Badge key={role} variant={has ? 'default' : 'secondary'} className={`text-xs ${!has ? 'opacity-50' : ''}`}>
                        {has ? '✅' : '❌'} {role}
                      </badge_1.Badge>))}
                  </div>
                </div>
              </div>
            </div>)}
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
exports.default = SystemHealth;
