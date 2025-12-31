"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletConnectButton = WalletConnectButton;
const useWeb3_1 = require("@/hooks/useWeb3");
const button_1 = require("@/components/ui/button");
function WalletConnectButton() {
    const { isConnected, address, connectWallet, disconnect } = (0, useWeb3_1.useWeb3)();
    return (<div className="flex items-center gap-4">
      {isConnected ? (<div className="flex items-center gap-2">
          <span className="text-sm font-mono">
            {address === null || address === void 0 ? void 0 : address.slice(0, 6)}...{address === null || address === void 0 ? void 0 : address.slice(-4)}
          </span>
          <button_1.Button variant="outline" size="sm" onClick={() => { disconnect(); window.location.reload(); }}>
            Disconnect
          </button_1.Button>
        </div>) : (<button_1.Button size="sm" onClick={() => connectWallet()}>
          Connect Wallet
        </button_1.Button>)}
    </div>);
}
