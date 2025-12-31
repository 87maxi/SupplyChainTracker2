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
exports.TransactionConfirmation = TransactionConfirmation;
const dialog_1 = require("@/components/ui/dialog");
const button_1 = require("@/components/ui/button");
const alert_1 = require("@/components/ui/alert");
const lucide_react_1 = require("lucide-react");
const react_1 = require("react");
function TransactionConfirmation({ open, onOpenChange, onConfirm, title, description, warning, confirmText = "Confirmar", cancelText = "Cancelar", transactionDetails }) {
    const [isConfirming, setIsConfirming] = (0, react_1.useState)(false);
    const handleConfirm = () => __awaiter(this, void 0, void 0, function* () {
        setIsConfirming(true);
        try {
            yield onConfirm();
            onOpenChange(false);
        }
        catch (error) {
            console.error('Transaction confirmation error:', error);
        }
        finally {
            setIsConfirming(false);
        }
    });
    return (<dialog_1.Dialog open={open} onOpenChange={onOpenChange}>
      <dialog_1.DialogContent className="sm:max-w-md">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle>{title}</dialog_1.DialogTitle>
          <dialog_1.DialogDescription>{description}</dialog_1.DialogDescription>
        </dialog_1.DialogHeader>
        
        {warning && (<alert_1.Alert variant="destructive">
            <lucide_react_1.AlertTriangle className="h-4 w-4"/>
            <alert_1.AlertTitle>Advertencia</alert_1.AlertTitle>
            <alert_1.AlertDescription>{warning}</alert_1.AlertDescription>
          </alert_1.Alert>)}

        {transactionDetails && (<div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Detalles de la transacción:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Dirección desde:</span>
                <span className="font-mono text-xs">{transactionDetails.fromAddress.slice(0, 6)}...{transactionDetails.fromAddress.slice(-4)}</span>
              </div>
              {transactionDetails.toAddress && (<div className="flex justify-between">
                  <span>Dirección a:</span>
                  <span className="font-mono text-xs">{transactionDetails.toAddress.slice(0, 6)}...{transactionDetails.toAddress.slice(-4)}</span>
                </div>)}
              <div className="flex justify-between">
                <span>Gas estimado:</span>
                <span>{transactionDetails.gasEstimate.toLocaleString()} unidades</span>
              </div>
              <div className="flex justify-between">
                <span>Comisión máxima:</span>
                <span>{transactionDetails.maxFee} ETH</span>
              </div>
            </div>
          </div>)}
        
        <dialog_1.DialogFooter className="sm:justify-end">
          <button_1.Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={isConfirming}>
            {cancelText}
          </button_1.Button>
          <button_1.Button type="button" onClick={handleConfirm} disabled={isConfirming}>
            {isConfirming ? (<>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                {confirmText}
              </>) : confirmText}
          </button_1.Button>
        </dialog_1.DialogFooter>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}
