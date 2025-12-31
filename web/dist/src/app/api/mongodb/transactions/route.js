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
exports.GET = GET;
exports.POST = POST;
// web/src/app/api/mongodb/transactions/route.ts
const server_1 = require("next/server");
function GET(request) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { searchParams } = new URL(request.url);
            const userAddress = searchParams.get('userAddress');
            const limit = parseInt(searchParams.get('limit') || '50');
            const skip = parseInt(searchParams.get('skip') || '0');
            // En una implementación real, aquí conectarías a MongoDB
            // Por ahora devolvemos datos mock para desarrollo
            const mockTransactions = [
                {
                    transactionHash: '0x1234567890abcdef',
                    blockNumber: 12345,
                    from: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
                    to: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
                    functionName: 'grantRole',
                    status: 'success',
                    timestamp: new Date(),
                    role: 'FABRICANTE_ROLE'
                }
            ];
            // Filtrar por userAddress si se proporciona
            const filteredTransactions = userAddress
                ? mockTransactions.filter(tx => tx.from.toLowerCase() === userAddress.toLowerCase())
                : mockTransactions;
            return server_1.NextResponse.json({
                transactions: filteredTransactions,
                total: filteredTransactions.length
            });
        }
        catch (error) {
            console.error('Error fetching transactions:', error);
            return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
        }
    });
}
function POST(request) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const transactionData = yield request.json();
            // En una implementación real, aquí guardarías en MongoDB
            console.log('Saving transaction to MongoDB:', transactionData);
            return server_1.NextResponse.json({
                success: true,
                message: 'Transaction logged successfully',
                id: 'mock-id-123'
            }, { status: 201 });
        }
        catch (error) {
            console.error('Error saving transaction:', error);
            return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
        }
    });
}
