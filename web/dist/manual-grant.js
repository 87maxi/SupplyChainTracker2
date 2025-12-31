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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const viem_1 = require("viem");
const accounts_1 = require("viem/accounts");
const chains_1 = require("viem/chains");
const SupplyChainTracker_json_1 = __importDefault(require("../src/contracts/abi/SupplyChainTracker.json"));
// Default Anvil deployment address - verify if this matches your logs
const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const ADMIN_PK = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // Account #0 Anvil
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const args = process.argv.slice(2);
        if (args.length < 2) {
            console.error('Usage: npx tsx scripts/manual-grant.ts <ROLE_NAME> <USER_ADDRESS>');
            console.log('Example: npx tsx scripts/manual-grant.ts FABRICANTE 0x123...');
            process.exit(1);
        }
        const [roleName, userAddress] = args;
        // Normalize role name to get the hash
        // If input is "FABRICANTE", we want keccak256("FABRICANTE_ROLE")
        // If input is "ADMIN", we want keccak256("DEFAULT_ADMIN_ROLE") or 0x00... depending on implementation
        // Based on previous logs, FABRICANTE -> FABRICANTE_ROLE
        let roleString = roleName;
        if (roleName === 'ADMIN') {
            roleString = 'DEFAULT_ADMIN_ROLE';
        }
        else if (!roleName.endsWith('_ROLE')) {
            roleString = roleName + '_ROLE';
        }
        const roleHash = (0, viem_1.keccak256)((0, viem_1.stringToBytes)(roleString));
        console.log(`Role Input: ${roleName}`);
        console.log(`Role String: ${roleString}`);
        console.log(`Role Hash: ${roleHash}`);
        const account = (0, accounts_1.privateKeyToAccount)(ADMIN_PK);
        const client = (0, viem_1.createWalletClient)({
            account,
            chain: chains_1.anvil,
            transport: (0, viem_1.http)()
        });
        const publicClient = (0, viem_1.createPublicClient)({
            chain: chains_1.anvil,
            transport: (0, viem_1.http)()
        });
        console.log(`Connecting to Anvil with Admin: ${account.address}`);
        try {
            // 1. Check if we are connected
            const chainId = yield publicClient.getChainId();
            console.log(`Connected to Chain ID: ${chainId}`);
            // 2. Send Transaction
            console.log(`Granting role to ${userAddress}...`);
            const hash = yield client.writeContract({
                address: CONTRACT_ADDRESS,
                abi: SupplyChainTracker_json_1.default,
                functionName: 'grantRole',
                args: [roleHash, userAddress],
            });
            console.log(`Transaction submitted: ${hash}`);
            // 3. Wait for Receipt
            const receipt = yield publicClient.waitForTransactionReceipt({ hash });
            console.log(`Transaction mined in block ${receipt.blockNumber}`);
            if (receipt.status === 'success') {
                console.log('✅ SUCCESS: Role granted on blockchain.');
            }
            else {
                console.error('❌ FAILED: Transaction reverted.');
            }
        }
        catch (error) {
            console.error('❌ Error executing transaction:', error);
        }
    });
}
main();
