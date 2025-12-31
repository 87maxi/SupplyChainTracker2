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
exports.default = TokenDetailsPage;
const useWeb3_1 = require("@/hooks/useWeb3");
const useSupplyChainService_1 = require("@/hooks/useSupplyChainService");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const react_1 = require("react");
function TokenDetailsPage({ params }) {
    const { id } = params;
    const { isConnected } = (0, useWeb3_1.useWeb3)();
    const { getNetbookReport } = (0, useSupplyChainService_1.useSupplyChainService)();
    const [netbook, setNetbook] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)('');
    (0, react_1.useEffect)(() => {
        const fetchNetbook = () => __awaiter(this, void 0, void 0, function* () {
            if (!isConnected)
                return;
            setLoading(true);
            setError('');
            try {
                const report = yield getNetbookReport(id);
                setNetbook(report);
            }
            catch (err) {
                console.error('Error fetching netbook:', err);
                setError('Failed to load netbook details');
            }
            finally {
                setLoading(false);
            }
        });
        fetchNetbook();
    }, [id, isConnected]);
    if (!isConnected) {
        return (<div className="container mx-auto px-4 py-12">
        <card_1.Card>
          <card_1.CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg mb-4">Por favor, conecta tu wallet para ver los detalles del netbook.</p>
            <button_1.Button onClick={() => window.location.reload()}>Conectar Wallet</button_1.Button>
          </card_1.CardContent>
        </card_1.Card>
      </div>);
    }
    if (loading) {
        return (<div className="container mx-auto px-4 py-12">
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Detalles del Netbook</card_1.CardTitle>
            <card_1.CardDescription>Cargando...</card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="h-4 w-1/2 bg-muted rounded animate-pulse"></div>
          </card_1.CardContent>
        </card_1.Card>
      </div>);
    }
    if (error) {
        return (<div className="container mx-auto px-4 py-12">
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Error</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <p className="text-muted-foreground">{error}</p>
            <button_1.Button className="mt-4" onClick={() => window.location.reload()}>Reintentar</button_1.Button>
          </card_1.CardContent>
        </card_1.Card>
      </div>);
    }
    if (!netbook) {
        return (<div className="container mx-auto px-4 py-12">
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Netbook no encontrado</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <p className="text-muted-foreground">No se encontró un netbook con el número de serie {id}.</p>
            <button_1.Button className="mt-4" asChild>
              <a href="/tokens">Volver a la lista</a>
            </button_1.Button>
          </card_1.CardContent>
        </card_1.Card>
      </div>);
    }
    return (<div className="container mx-auto px-4 py-12">
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Detalles del Netbook {netbook.serialNumber}</card_1.CardTitle>
          <card_1.CardDescription>Información sobre este netbook</card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="grid gap-4">
            <div>
              <p className="text-sm font-medium">Número de Serie</p>
              <p className="text-foreground">{netbook.serialNumber}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Lote</p>
              <p className="text-foreground">{netbook.batchId}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Especificación del Modelo</p>
              <p className="text-foreground">{netbook.initialModelSpecs}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Estado Actual</p>
              <p className="text-foreground">{netbook.currentState}</p>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>);
}
