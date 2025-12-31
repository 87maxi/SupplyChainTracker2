"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyWagmiConfig = verifyWagmiConfig;
const config_1 = require("./config");
function verifyWagmiConfig() {
    console.log('=== Wagmi Config Verification ===');
    console.log('Chains:', config_1.config.chains.map(c => c.name));
    console.log('Connectors:', config_1.config.connectors.map(c => c.name));
    console.log('===================================');
}
