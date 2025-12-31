"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.useWeb3 = void 0;
const wagmi_1 = require("wagmi");
const useWeb3 = () => {
    const { address, isConnected, isConnecting } = (0, wagmi_1.useAccount)();
    const { connect, connectors } = (0, wagmi_1.useConnect)();
    const { disconnect } = (0, wagmi_1.useDisconnect)();
    const connectWallet = (connectorId) => {
        if (connectorId) {
            const selectedConnector = connectors.find(c => c.id === connectorId);
            if (selectedConnector) {
                connect({ connector: selectedConnector });
            }
            else if (connectors.length > 0) {
                connect({ connector: connectors[0] });
            }
        }
        else if (connectors.length > 0) {
            connect({ connector: connectors[0] });
        }
    };
    const defaultAdminAddress = process.env.NEXT_PUBLIC_DEFAULT_ADMIN_ADDRESS;
    return {
        address,
        isConnected,
        isConnecting,
        disconnect,
        connectWallet,
        defaultAdminAddress,
    };
};
exports.useWeb3 = useWeb3;
