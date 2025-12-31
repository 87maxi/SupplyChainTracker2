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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TokensPage;
const useWeb3_1 = require("@/hooks/useWeb3");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const table_1 = require("@/components/ui/table");
const link_1 = __importDefault(require("next/link"));
const useSupplyChainService_1 = require("@/hooks/useSupplyChainService");
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
function TokensPage() {
    const { isConnected } = (0, useWeb3_1.useWeb3)();
    const { getAllSerialNumbers, getNetbookState, getNetbookReport } = (0, useSupplyChainService_1.useSupplyChainService)();
    const [netbooks, setNetbooks] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)('');
    const stateLabels = {
        0: 'FABRICADA',
        1: 'HW_APROBADO',
        2: 'SW_VALIDADO',
        3: 'DISTRIBUIDA'
    };
    const stateColors = {
        0: 'bg-blue-100 text-blue-800 border border-blue-200',
        1: 'bg-green-100 text-green-800 border border-green-200',
        2: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
        3: 'bg-purple-100 text-purple-800 border border-purple-200'
    };
    (0, react_1.useEffect)(() => {
        const fetchNetbooks = () => __awaiter(this, void 0, void 0, function* () {
            if (!isConnected)
                return;
            setLoading(true);
            setError('');
            // Mapeo de número de estado a NetbookState
            const stateMap = {
                0: 'FABRICADA',
                1: 'HW_APROBADO',
                2: 'SW_VALIDADO',
                3: 'DISTRIBUIDA'
            };
            try {
                const serials = yield getAllSerialNumbers();
                const netbooksData = yield Promise.all(serials.map((serial) => __awaiter(this, void 0, void 0, function* () {
                    const state = yield getNetbookState(serial);
                    const report = yield getNetbookReport(serial);
                    return {
                        serialNumber: serial,
                        batchId: "N/A",
                        initialModelSpecs: "N/A",
                        hwAuditor: report.hwAuditor,
                        hwIntegrityPassed: false,
                        hwReportHash: "0x0",
                        swTechnician: report.swTechnician,
                        osVersion: "N/A",
                        swValidationPassed: false,
                        destinationSchoolHash: "0x0",
                        studentIdHash: "0x0",
                        distributionTimestamp: "0",
                        currentState: stateMap[Number(state)],
                    };
                })));
                setNetbooks(netbooksData);
            }
            catch (err) {
                console.error('Error fetching netbooks:', err);
                setError('Failed to load netbooks');
            }
            finally {
                setLoading(false);
            }
        });
        fetchNetbooks();
    }, [isConnected]);
    if (!isConnected) {
        return (<div className="container mx-auto px-4 py-12">
        <card_1.Card>
          <card_1.CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg mb-4">Por favor, conecta tu wallet para ver los netbooks.</p>
            <button_1.Button onClick={() => window.location.reload()}>Conectar Wallet</button_1.Button>
          </card_1.CardContent>
        </card_1.Card>
      </div>);
    }
    if (loading) {
        return (<div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Gestión de Netbooks</h1>
        
        <div className="flex justify-between items-center mb-6">
          <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
          <div className="h-10 w-40 bg-muted rounded animate-pulse"></div>
        </div>
        
        <card_1.Card>
          <card_1.CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (<div key={i} className="flex items-center justify-between py-3 border-b">
                  <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                  <div className="h-6 w-20 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                  <div className="h-8 w-16 bg-muted rounded animate-pulse"></div>
                </div>))}
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>);
    }
    return (<div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Gestión de Netbooks</h1>
      
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">Total: {netbooks.length} netbooks registrados</p>
        <button_1.Button asChild>
          <link_1.default href="/tokens/create">Registrar Nuevos Netbooks</link_1.default>
        </button_1.Button>
      </div>
      
      <card_1.Card>
        <card_1.CardContent>
          {error && <div className="text-red-500 p-4 rounded-md bg-red-50 mb-4">{error}</div>}
          
          {netbooks.length > 0 ? (<table_1.Table>
              <table_1.TableHeader>
                <table_1.TableRow>
                  <table_1.TableHead>Número de Serie</table_1.TableHead>
                  <table_1.TableHead>Estado</table_1.TableHead>
                  <table_1.TableHead>Propietario</table_1.TableHead>
                  <table_1.TableHead>Acciones</table_1.TableHead>
                </table_1.TableRow>
              </table_1.TableHeader>
              <table_1.TableBody>
                {netbooks.map((netbook, index) => (<table_1.TableRow key={index}>
                    <table_1.TableCell className="font-mono">{netbook.serialNumber}</table_1.TableCell>
                    <table_1.TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${stateColors[netbook.currentState]}`}>
                        {stateLabels[netbook.currentState]}
                      </span>
                    </table_1.TableCell>
                    <table_1.TableCell>
                      {netbook.hwAuditor !== '0x0000000000000000000000000000000000000000' ? 'HW Audited' : 'Pending'}
                    </table_1.TableCell>
                    <table_1.TableCell>
                      <button_1.Button variant="outline" size="sm" onClick={() => {
                    window.location.href = `/tokens/${netbook.serialNumber}`;
                }}>
                        Ver
                      </button_1.Button>
                    </table_1.TableCell>
                  </table_1.TableRow>))}
              </table_1.TableBody>
            </table_1.Table>) : (<div className="text-center py-12">
              <lucide_react_1.Laptop className="mx-auto h-12 w-12 text-muted-foreground mb-4"/>
              <h3 className="text-lg font-medium text-foreground mb-2">
                No hay netbooks registrados
              </h3>
              <p className="text-muted-foreground mb-6">
                Comienza registrando el primer netbook del sistema
              </p>
              <button_1.Button asChild>
                <link_1.default href="/tokens/create" className="gap-2">
                  <lucide_react_1.Plus className="h-4 w-4"/>
                  Registrar Primer Netbook
                </link_1.default>
              </button_1.Button>
            </div>)}
        </card_1.CardContent>
      </card_1.Card>
    </div>);
}
