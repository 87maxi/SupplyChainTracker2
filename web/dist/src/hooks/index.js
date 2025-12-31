"use strict";
// web/src/hooks/index.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCachedData = exports.useRoleRequests = exports.useRoleContract = exports.useSupplyChainContract = exports.useNotifications = exports.useToast = exports.useWeb3 = void 0;
// Hooks de Web3
var useWeb3_1 = require("@/hooks/useWeb3");
Object.defineProperty(exports, "useWeb3", { enumerable: true, get: function () { return useWeb3_1.useWeb3; } });
var use_toast_1 = require("./use-toast");
Object.defineProperty(exports, "useToast", { enumerable: true, get: function () { return use_toast_1.useToast; } });
var use_notifications_1 = require("./use-notifications");
Object.defineProperty(exports, "useNotifications", { enumerable: true, get: function () { return use_notifications_1.useNotifications; } });
// Hooks de contratos
var use_supply_chain_hook_1 = require("./use-contracts/use-supply-chain.hook");
Object.defineProperty(exports, "useSupplyChainContract", { enumerable: true, get: function () { return use_supply_chain_hook_1.useSupplyChainContract; } });
var use_role_hook_1 = require("./use-contracts/use-role.hook");
Object.defineProperty(exports, "useRoleContract", { enumerable: true, get: function () { return use_role_hook_1.useRoleContract; } });
var useRoleRequests_1 = require("./useRoleRequests");
Object.defineProperty(exports, "useRoleRequests", { enumerable: true, get: function () { return useRoleRequests_1.useRoleRequests; } });
var use_cached_data_1 = require("./use-cached-data");
Object.defineProperty(exports, "useCachedData", { enumerable: true, get: function () { return use_cached_data_1.useCachedData; } });
