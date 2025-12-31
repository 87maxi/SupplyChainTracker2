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
const server_1 = require("next/server");
const RoleDataService_1 = require("@/services/RoleDataService");
/**
 * API Route to handle supply chain actions that require MongoDB persistence
 *
 * This route handles operations that need to be performed on the server
 * to avoid exposing MongoDB dependencies to client components.
 */
function POST(request) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const body = yield request.json();
            // Validate required fields
            if (!body.serialNumber && !body.serials) {
                return server_1.NextResponse.json({ error: 'Missing serialNumber or serials' }, { status: 400 });
            }
            if (!body.transactionHash) {
                return server_1.NextResponse.json({ error: 'Missing transactionHash' }, { status: 400 });
            }
            if (!body.role) {
                return server_1.NextResponse.json({ error: 'Missing role' }, { status: 400 });
            }
            if (!body.userAddress) {
                return server_1.NextResponse.json({ error: 'Missing userAddress' }, { status: 400 });
            }
            const { serialNumber, serials, transactionHash, role, userAddress, data } = body;
            // Determine which operation to perform based on input
            let result;
            if (serials && serials.length > 0) {
                // Handle register netbooks (multiple)
                const firstSerial = serials[0]; // Use first serial as reference
                result = yield RoleDataService_1.RoleDataService.saveNetbookData({
                    serialNumber: firstSerial,
                    transactionHash: transactionHash,
                    role: role,
                    userAddress: userAddress,
                    data: Object.assign({ serials }, data),
                });
            }
            else if (serialNumber) {
                // Handle single netbook operations
                result = yield RoleDataService_1.RoleDataService.saveNetbookData({
                    serialNumber,
                    transactionHash: transactionHash,
                    role: role,
                    userAddress: userAddress,
                    data: data || {},
                });
            }
            return server_1.NextResponse.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            console.error('Error in supply-chain-actions API route:', error);
            return server_1.NextResponse.json({ error: 'Failed to process supply chain action' }, { status: 500 });
        }
    });
}
