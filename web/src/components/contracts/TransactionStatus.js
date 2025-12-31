"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionStatus = TransactionStatus;
const react_1 = require("react");
const use_toast_1 = require("@/hooks/use-toast");
const button_1 = require("@/components/ui/button");
const alert_1 = require("@/components/ui/alert");
const lucide_react_1 = require("lucide-react");
function TransactionStatus({ hash, onSuccess, onError, showDetails = true }) {
    const [status, setStatus] = (0, react_1.useState)(null);
    const [error, setError] = (0, react_1.useState)(null);
    const [receipt, setReceipt] = (0, react_1.useState)(null);
    const { toast } = (0, use_toast_1.useToast)();
    (0, react_1.useEffect)(() => {
        if (!hash) {
            setStatus(null);
            setError(null);
            setReceipt(null);
            return;
        }
        setStatus('pending');
        setError(null);
        setReceipt(null);
        // Simulate transaction monitoring
        const timer = setTimeout(() => {
            // In a real implementation, you would check the transaction receipt
            // This is a simulation for demonstration purposes
            const success = Math.random() > 0.3; // 70% success rate for demo
            if (success) {
                setStatus('success');
                setReceipt({
                    transactionHash: hash,
                    blockNumber: 12345678,
                    gasUsed: 21000,
                    effectiveGasPrice: 1000000000 // 1 gwei
                });
                toast({
                    title: "Transacción completada",
                    description: "La operación se completó exitosamente.",
                    variant: "default"
                });
                if (onSuccess)
                    onSuccess();
            }
            else {
                setStatus('error');
                setError('La transacción fue rechazada por la red');
                toast({
                    title: "Error en la transacción",
                    description: "La operación no pudo completarse.",
                    variant: "destructive"
                });
                if (onError)
                    onError();
            }
        }, 3000);
        return () => clearTimeout(timer);
    }, [hash, onSuccess, onError, toast]);
    if (!hash)
        return null;
    const renderContent = () => {
        switch (status) {
            case 'pending':
                return (<alert_1.Alert className="bg-yellow-50 border-yellow-200">
            <lucide_react_1.AlertTriangle className="h-4 w-4 text-yellow-600"/>
            <alert_1.AlertTitle className="text-yellow-800">Transacción Pendiente</alert_1.AlertTitle>
            <alert_1.AlertDescription className="text-yellow-700">
              <div className="flex items-center space-x-2">
                <lucide_react_1.Loader2 className="h-4 w-4 animate-spin"/>
                <span>Esperando confirmación en la red...</span>
              </div>
              {showDetails && (<div className="mt-2 text-sm">
                  <div><strong>Hash:</strong> {hash}</div>
                </div>)}
            </alert_1.AlertDescription>
          </alert_1.Alert>);
            case 'success':
                return (<alert_1.Alert className="bg-green-50 border-green-200">
            <lucide_react_1.CheckCircle className="h-4 w-4 text-green-600"/>
            <alert_1.AlertTitle className="text-green-800">Éxito</alert_1.AlertTitle>
            <alert_1.AlertDescription className="text-green-700">
              Transacción confirmada exitosamente
              {showDetails && receipt && (<div className="mt-2 text-sm space-y-1">
                  <div><strong>Hash:</strong> {receipt.transactionHash}</div>
                  <div><strong>Bloque:</strong> {receipt.blockNumber}</div>
                  <div><strong>Gas utilizado:</strong> {receipt.gasUsed.toLocaleString()}</div>
                  <button_1.Button variant="link" className="p-0 h-auto font-normal" onClick={() => window.open(`https://etherscan.io/tx/${hash}`, '_blank')}>
                    Ver en Etherscan →
                  </button_1.Button>
                </div>)}
            </alert_1.AlertDescription>
          </alert_1.Alert>);
            case 'error':
                return (<alert_1.Alert className="bg-red-50 border-red-200">
            <lucide_react_1.XCircle className="h-4 w-4 text-red-600"/>
            <alert_1.AlertTitle className="text-red-800">Error</alert_1.AlertTitle>
            <alert_1.AlertDescription className="text-red-700">
              {error}
              {showDetails && (<div className="mt-2 text-sm">
                  <div><strong>Hash:</strong> {hash}</div>
                  <button_1.Button variant="link" className="p-0 h-auto font-normal" onClick={() => window.open(`https://etherscan.io/tx/${hash}`, '_blank')}>
                    Ver en Etherscan →
                  </button_1.Button>
                </div>)}
            </alert_1.AlertDescription>
          </alert_1.Alert>);
            default:
                return null;
        }
    };
    return <div className="space-y-4">{renderContent()}</div>;
}
