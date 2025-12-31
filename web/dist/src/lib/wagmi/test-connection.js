"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testWagmiConnection = testWagmiConnection;
const config_1 = require("./config");
const actions_1 = require("wagmi/actions");
function testWagmiConnection() {
    try {
        const account = (0, actions_1.getAccount)(config_1.config);
        console.log('Wagmi connection test:', {
            isConnected: account.isConnected,
            address: account.address,
            status: account.status
        });
        return account;
    }
    catch (error) {
        console.error('Wagmi connection test failed:', error);
        throw error;
    }
}
