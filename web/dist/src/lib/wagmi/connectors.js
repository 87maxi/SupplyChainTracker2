"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metaMaskConnector = void 0;
const connectors_1 = require("wagmi/connectors");
// Create MetaMask connector
exports.metaMaskConnector = (0, connectors_1.metaMask)();
