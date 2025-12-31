"use strict";
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
const viem_1 = require("viem");
const accounts_1 = require("viem/accounts");
const chains_1 = require("viem/chains");
const CONTRACT_ADDRESS = '0x0165878A594ca255338adfa4d48449f69242Eb8F'; // From env.ts
const PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // Default Anvil Account 0
const abi = (0, viem_1.parseAbi)([
    'function grantRole(bytes32 role, address account) external',
    'function hasRole(bytes32 role, address account) external view returns (bool)'
]);
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const account = (0, accounts_1.privateKeyToAccount)(PRIVATE_KEY);
        const publicClient = (0, viem_1.createPublicClient)({
            chain: chains_1.anvil,
            transport: (0, viem_1.http)('http://127.0.0.1:8545')
        });
        const walletClient = (0, viem_1.createWalletClient)({
            account,
            chain: chains_1.anvil,
            transport: (0, viem_1.http)('http://127.0.0.1:8545')
        });
        const role = '0xdf8b4c520ffe197c5343c6f5aec59570151ef9a492f2c624fd45dd6ed2013848'; // FABRICANTE_ROLE
        const targetUser = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'; // Anvil Account 1
        console.log('--- Starting Approval Speed Test ---');
        console.log(`Contract: ${CONTRACT_ADDRESS}`);
        console.log(`Granting role to: ${targetUser}`);
        const start = performance.now();
        try {
            console.log('1. Submitting transaction...');
            const hash = yield walletClient.writeContract({
                address: CONTRACT_ADDRESS,
                abi,
                functionName: 'grantRole',
                args: [role, targetUser]
            });
            const submitted = performance.now();
            console.log(`   Tx Hash: ${hash}`);
            console.log(`   Submission took: ${(submitted - start).toFixed(2)}ms`);
            console.log('2. Waiting for receipt...');
            const receipt = yield publicClient.waitForTransactionReceipt({
                hash,
                pollingInterval: 100 // Fast polling
            });
            const end = performance.now();
            console.log(`   Receipt block: ${receipt.blockNumber}`);
            console.log(`   Status: ${receipt.status}`);
            console.log(`   Wait took: ${(end - submitted).toFixed(2)}ms`);
            console.log(`   TOTAL TIME: ${(end - start).toFixed(2)}ms`);
        }
        catch (error) {
            console.error('Error:', error);
        }
    });
}
main();
