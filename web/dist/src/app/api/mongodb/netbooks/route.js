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
// web/src/app/api/mongodb/netbooks/route.ts
const server_1 = require("next/server");
function GET(request) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { searchParams } = new URL(request.url);
            const serial = searchParams.get('serial');
            const state = searchParams.get('state');
            const batchId = searchParams.get('batchId');
            const limit = parseInt(searchParams.get('limit') || '100');
            const skip = parseInt(searchParams.get('skip') || '0');
            // Datos mock para desarrollo
            const mockNetbooks = [
                {
                    serialNumber: 'NB001',
                    batchId: 'BATCH001',
                    initialModelSpecs: 'Intel i5, 8GB RAM, 256GB SSD',
                    currentState: 'FABRICADA',
                    hwAuditor: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
                    hwIntegrityPassed: true,
                    swTechnician: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
                    swValidationPassed: false,
                    lastUpdated: new Date(),
                    lastTransactionHash: '0xabcdef1234567890'
                }
            ];
            // Filtrar por serial si se proporciona
            let filteredNetbooks = mockNetbooks;
            if (serial) {
                filteredNetbooks = filteredNetbooks.filter(nb => nb.serialNumber === serial);
            }
            if (state) {
                filteredNetbooks = filteredNetbooks.filter(nb => nb.currentState === state);
            }
            if (batchId) {
                filteredNetbooks = filteredNetbooks.filter(nb => nb.batchId === batchId);
            }
            return server_1.NextResponse.json({
                netbooks: filteredNetbooks,
                total: filteredNetbooks.length
            });
        }
        catch (error) {
            console.error('Error fetching netbooks:', error);
            return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
        }
    });
}
function POST(request) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const netbookData = yield request.json();
            // En una implementación real, aquí guardarías en MongoDB
            console.log('Saving netbook to MongoDB:', netbookData);
            return server_1.NextResponse.json({
                success: true,
                message: 'Netbook saved successfully',
                id: 'mock-nb-id-123'
            }, { status: 201 });
        }
        catch (error) {
            console.error('Error saving netbook:', error);
            return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
        }
    });
}
