"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useWeb3 = void 0;
const wagmi_1 = require("wagmi");
// Hook personalizado para manejar la cuenta y la conexión
const useWeb3 = () => {
    const { address, isConnected } = (0, wagmi_1.useAccount)();
    const { connect, connectors } = (0, wagmi_1.useConnect)();
    const { disconnect } = (0, wagmi_1.useDisconnect)();
    return {
        address,
        isConnected,
        connect,
        connectors,
        disconnect,
    };
};
exports.useWeb3 = useWeb3;
