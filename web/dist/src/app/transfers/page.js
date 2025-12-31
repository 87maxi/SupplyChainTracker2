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
exports.default = TransfersPage;
const useWeb3_1 = require("@/hooks/useWeb3");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const table_1 = require("@/components/ui/table");
const useSupplyChainService_1 = require("@/hooks/useSupplyChainService");
const react_1 = require("react");
function TransfersPage() {
    const { address, isConnected } = (0, useWeb3_1.useWeb3)();
    const { getAllSerialNumbers, getNetbookState } = (0, useSupplyChainService_1.useSupplyChainService)();
    const [transfers, setTransfers] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)('');
    (0, react_1.useEffect)(() => {
        const fetchTransfers = () => __awaiter(this, void 0, void 0, function* () {
            if (!isConnected)
                return;
            setLoading(true);
            setError('');
            try {
                // Get all serial numbers
                const serials = yield getAllSerialNumbers();
                // Filter for transfers that are pending approval
                // In a real implementation, we'd have a pending transfers mapping in the contract
                // For now, we'll simulate pending transfers based on state transitions
                const pendingTransfers = [];
                for (const serial of serials) {
                    const stateValue = yield getNetbookState(serial);
                    const state = ['FABRICADA', 'HW_APROBADO', 'SW_VALIDADO', 'DISTRIBUIDA'][Number(stateValue)];
                    // In our state machine, transfers happen when moving from SW_VALIDADO to DISTRIBUIDA
                    // We'll consider these as "pending" until confirmed
                    if (state === 'DISTRIBUIDA') { // DISTRIBUIDA
                        // This is a completed transfer, not pending
                        // In a real implementation, we'd have a separate pending transfers mapping
                        // For now, we'll show all transfers as completed
                        pendingTransfers.push({
                            serial,
                            from: 'Fabricante',
                            to: 'Institución Educativa',
                            status: 'Completado'
                        });
                    }
                }
                setTransfers(pendingTransfers);
            }
            catch (err) {
                console.error('Error fetching transfers:', err);
                setError('Failed to load transfers');
            }
            finally {
                setLoading(false);
            }
        });
        fetchTransfers();
    }, [isConnected]);
    if (!isConnected) {
        return (<div className="container mx-auto px-4 py-12">
        <card_1.Card>
          <card_1.CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg mb-4">Por favor, conecta tu wallet para ver las transferencias pendientes.</p>
            <button_1.Button onClick={() => window.location.reload()}>Conectar Wallet</button_1.Button>
          </card_1.CardContent>
        </card_1.Card>
      </div>);
    }
    if (loading) {
        return (<div className="container mx-auto px-4 py-12">
        <card_1.Card>
          <card_1.CardContent className="flex flex-col items-center justify-center py-12">
            <p>Cargando transferencias...</p>
          </card_1.CardContent>
        </card_1.Card>
      </div>);
    }
    return (<div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Transferencias Pendientes</h1>

      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Transferencias de Netbooks</card_1.CardTitle>
          <card_1.CardDescription>Lista de transferencias de netbooks entre entidades</card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          {error && <div className="text-red-500 p-4 rounded-md bg-red-50 mb-4">{error}</div>}

          {transfers.length > 0 ? (<table_1.Table>
              <table_1.TableHeader>
                <table_1.TableRow>
                  <table_1.TableHead>Número de Serie</table_1.TableHead>
                  <table_1.TableHead>De</table_1.TableHead>
                  <table_1.TableHead>A</table_1.TableHead>
                  <table_1.TableHead>Estado</table_1.TableHead>
                  <table_1.TableHead>Acciones</table_1.TableHead>
                </table_1.TableRow>
              </table_1.TableHeader>
              <table_1.TableBody>
                {transfers.map((transfer, index) => (<table_1.TableRow key={index}>
                    <table_1.TableCell className="font-mono">{transfer.serial}</table_1.TableCell>
                    <table_1.TableCell>{transfer.from}</table_1.TableCell>
                    <table_1.TableCell>{transfer.to}</table_1.TableCell>
                    <table_1.TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${transfer.status === 'Completado' ? 'bg-green-100 text-green-800' :
                    transfer.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'}`}>
                        {transfer.status}
                      </span>
                    </table_1.TableCell>
                    <table_1.TableCell>
                      <button_1.Button variant="outline" size="sm" onClick={() => {
                    // In a real implementation, this would open a modal to approve/reject
                    // For now, we'll redirect to the token details page
                    window.location.href = `/tokens/${transfer.serial}`;
                }}>
                        Ver
                      </button_1.Button>
                    </table_1.TableCell>
                  </table_1.TableRow>))}
              </table_1.TableBody>
            </table_1.Table>) : (<div className="text-center py-8 text-muted-foreground">
              No hay transferencias pendientes.
            </div>)}
        </card_1.CardContent>
      </card_1.Card>
    </div>);
}
