"use strict";
// web/src/lib/wagmi/config.ts
// Configuración simplificada de Wagmi - Solo para gestión de wallet
// Las operaciones blockchain se manejan through el cliente unificado en lib/blockchain
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const wagmi_1 = require("wagmi");
const connectors_1 = require("wagmi/connectors");
// Configuración mínima para desarrollo local con Anvil
exports.config = (0, wagmi_1.createConfig)({
    chains: [{
            id: 31337,
            name: 'Anvil Local',
            network: 'anvil',
            nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
            rpcUrls: {
                default: { http: ['http://localhost:8545'] },
                public: { http: ['http://localhost:8545'] },
            },
            testnet: true,
        }],
    // Solo connectors esenciales para desarrollo
    connectors: [
        (0, connectors_1.injected)(), // Soporta MetaMask, Rabby y otras wallets injectadas
    ],
    // Configuración mínima de transporte
    transports: {
        31337: (0, wagmi_1.http)('http://localhost:8545'),
    },
    ssr: false, // Mejor performance para desarrollo
});
