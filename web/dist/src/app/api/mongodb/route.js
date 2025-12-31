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
exports.POST = POST;
exports.GET = GET;
const server_1 = require("next/server");
const mongodb_1 = require("@/lib/mongodb");
// POST /api/mongodb/save-netbook-data
function POST(request) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const body = yield request.json();
            // Validate required fields
            if (!body.serialNumber || !body.transactionHash || !body.role || !body.userAddress) {
                return server_1.NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
            }
            // Save to MongoDB
            const result = yield mongodb_1.mongodbService.saveNetbookData({
                serialNumber: body.serialNumber,
                transactionHash: body.transactionHash,
                role: body.role,
                userAddress: body.userAddress,
                data: body.data || {},
                timestamp: body.timestamp ? new Date(body.timestamp) : new Date()
            });
            return server_1.NextResponse.json(result);
        }
        catch (error) {
            console.error('Error saving netbook data:', error);
            return server_1.NextResponse.json({ error: 'Failed to save netbook data' }, { status: 500 });
        }
    });
}
// GET /api/mongodb/netbook-data?serialNumber=...
function GET(request) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { searchParams } = new URL(request.url);
            const serialNumber = searchParams.get('serialNumber');
            if (!serialNumber) {
                return server_1.NextResponse.json({ error: 'Serial number is required' }, { status: 400 });
            }
            // Get netbook data from MongoDB
            const data = yield mongodb_1.mongodbService.getNetbookDataBySerial(serialNumber);
            return server_1.NextResponse.json(data);
        }
        catch (error) {
            console.error('Error fetching netbook data:', error);
            return server_1.NextResponse.json({ error: 'Failed to fetch netbook data' }, { status: 500 });
        }
    });
}
