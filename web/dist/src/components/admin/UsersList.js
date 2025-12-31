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
exports.UsersList = UsersList;
const card_1 = require("@/components/ui/card");
const badge_1 = require("@/components/ui/badge");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const lucide_react_1 = require("lucide-react");
const serverRpc_1 = require("@/lib/api/serverRpc");
const roleUtils_1 = require("@/lib/roleUtils");
const useWeb3_1 = require("@/hooks/useWeb3");
const react_1 = require("react");
const use_toast_1 = require("@/hooks/use-toast");
const roleColors = {
    admin: 'bg-red-100 text-red-800 border-red-200',
    fabricante: 'bg-blue-100 text-blue-800 border-blue-200',
    auditor_hw: 'bg-green-100 text-green-800 border-green-200',
    tecnico_sw: 'bg-purple-100 text-purple-800 border-purple-200',
    escuela: 'bg-orange-100 text-orange-800 border-orange-200',
};
function UsersList() {
    const { isConnected } = (0, useWeb3_1.useWeb3)();
    const { toast } = (0, use_toast_1.useToast)();
    const [users, setUsers] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    // Fetch users when component mounts or connection changes
    (0, react_1.useEffect)(() => {
        if (isConnected) {
            fetchUsers();
        }
        else {
            setUsers([]);
            setIsLoading(false);
        }
    }, [isConnected]);
    const fetchUsers = () => __awaiter(this, void 0, void 0, function* () {
        try {
            setIsLoading(true);
            // Get role hashes from contract
            const roleHashes = yield (0, roleUtils_1.getRoleHashes)();
            // Fetch members for each role concurrently
            const [adminMembers, fabricanteMembers, auditorHwMembers, tecnicoSwMembers, escuelaMembers] = yield Promise.all([
                (0, serverRpc_1.getRoleMembers)(roleHashes.ADMIN).catch(() => []),
                (0, serverRpc_1.getRoleMembers)(roleHashes.FABRICANTE).catch(() => []),
                (0, serverRpc_1.getRoleMembers)(roleHashes.AUDITOR_HW).catch(() => []),
                (0, serverRpc_1.getRoleMembers)(roleHashes.TECNICO_SW).catch(() => []),
                (0, serverRpc_1.getRoleMembers)(roleHashes.ESCUELA).catch(() => [])
            ]);
            // Transform to UserRoleData format
            const allUsers = [];
            // Add admin members
            adminMembers.forEach((address, index) => {
                allUsers.push({
                    id: `admin-${index}`,
                    address,
                    role: 'admin',
                    since: new Date().toISOString().split('T')[0],
                    status: 'active'
                });
            });
            // Add fabricante members
            fabricanteMembers.forEach((address, index) => {
                allUsers.push({
                    id: `fabricante-${index}`,
                    address,
                    role: 'fabricante',
                    since: new Date().toISOString().split('T')[0],
                    status: 'active'
                });
            });
            // Add auditor_hw members
            auditorHwMembers.forEach((address, index) => {
                allUsers.push({
                    id: `auditor_hw-${index}`,
                    address,
                    role: 'auditor_hw',
                    since: new Date().toISOString().split('T')[0],
                    status: 'active'
                });
            });
            // Add tecnico_sw members
            tecnicoSwMembers.forEach((address, index) => {
                allUsers.push({
                    id: `tecnico_sw-${index}`,
                    address,
                    role: 'tecnico_sw',
                    since: new Date().toISOString().split('T')[0],
                    status: 'active'
                });
            });
            // Add escuela members
            escuelaMembers.forEach((address, index) => {
                allUsers.push({
                    id: `escuela-${index}`,
                    address,
                    role: 'escuela',
                    since: new Date().toISOString().split('T')[0],
                    status: 'active'
                });
            });
            setUsers(allUsers);
        }
        catch (error) {
            console.error('Error fetching users:', error);
            toast({
                title: "Error",
                description: "No se pudieron cargar los usuarios.",
                variant: "destructive"
            });
        }
        finally {
            setIsLoading(false);
        }
    });
    return (<card_1.Card>
      <card_1.CardHeader>
        <div className="flex justify-between items-center">
          <card_1.CardTitle>Gestión de Usuarios</card_1.CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <lucide_react_1.Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/>
              <input_1.Input placeholder="Buscar usuarios..." className="pl-8 w-[300px]"/>
            </div>
          </div>
        </div>
        <card_1.CardDescription>
          Administrar roles y permisos para todas las direcciones registradas
        </card_1.CardDescription>
      </card_1.CardHeader>
      <card_1.CardContent>
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-12 px-4 text-left text-sm font-medium">Dirección</th>
                <th className="h-12 px-4 text-left text-sm font-medium">Rol</th>
                <th className="h-12 px-4 text-left text-sm font-medium">Estado</th>
                <th className="h-12 px-4 text-left text-sm font-medium">Desde</th>
                <th className="h-12 px-4 text-right text-sm font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (<tr key={user.id} className="border-b transition-colors hover:bg-muted/50">
                  <td className="h-16 px-4 py-2 font-mono text-sm">
                    {user.address}
                  </td>
                  <td className="h-16 px-4 py-2">
                    <badge_1.Badge variant="outline" className={roleColors[user.role]}>
                      <lucide_react_1.Shield className="mr-1 h-3 w-3"/>
                      {user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </badge_1.Badge>
                  </td>
                  <td className="h-16 px-4 py-2">
                    <badge_1.Badge variant={user.status === 'active' ? "default" : "secondary"}>
                      {user.status === 'active' ? 'Activo' : 'Inactivo'}
                    </badge_1.Badge>
                  </td>
                  <td className="h-16 px-4 py-2 text-sm text-muted-foreground">
                    {new Date(user.since).toLocaleDateString()}
                  </td>
                  <td className="h-16 px-4 py-2 text-right">
                    <button_1.Button variant="outline" size="sm" className="mr-2">
                      Editar
                    </button_1.Button>
                    <button_1.Button variant="outline" size="sm">
                      Revocar
                    </button_1.Button>
                  </td>
                </tr>))}
            </tbody>
          </table>
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
