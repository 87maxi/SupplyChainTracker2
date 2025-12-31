"use strict";
// web/src/lib/mongodb/mongodb.service.ts
// MongoDB Service implementation for role and netbook data
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
exports.MongoDBService = void 0;
const native_client_1 = require("./native-client");
class MongoDBService {
    /**
     * Save role action data to MongoDB
     */
    saveRoleData(params) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { roleData: roleDataCollection } = yield (0, native_client_1.getCollections)();
                const roleData = {
                    transactionHash: params.transactionHash,
                    role: params.role,
                    userAddress: params.userAddress.toLowerCase(),
                    data: params.data,
                    timestamp: params.timestamp || new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                const result = yield roleDataCollection.insertOne(roleData);
                console.log('[MongoDBService] Saved role data:', {
                    transactionHash: params.transactionHash,
                    role: params.role,
                    insertedId: result.insertedId
                });
                return Object.assign(Object.assign({}, roleData), { _id: result.insertedId.toString() });
            }
            catch (error) {
                console.error('[MongoDBService] Error saving role data:', error);
                throw error;
            }
        });
    }
    /**
     * Save netbook data to MongoDB
     */
    saveNetbookData(params) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { netbookData: netbookDataCollection } = yield (0, native_client_1.getCollections)();
                const netbookData = {
                    serialNumber: params.serialNumber,
                    transactionHash: params.transactionHash,
                    role: params.role,
                    userAddress: params.userAddress.toLowerCase(),
                    data: params.data,
                    timestamp: params.timestamp || new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                const result = yield netbookDataCollection.insertOne(netbookData);
                console.log('[MongoDBService] Saved netbook data:', {
                    serialNumber: params.serialNumber,
                    transactionHash: params.transactionHash,
                    role: params.role,
                    insertedId: result.insertedId
                });
                return Object.assign(Object.assign({}, netbookData), { _id: result.insertedId.toString() });
            }
            catch (error) {
                console.error('[MongoDBService] Error saving netbook data:', error);
                throw error;
            }
        });
    }
    /**
     * Get role data by transaction hash
     */
    getRoleDataByTransactionHash(transactionHash) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { roleData: roleDataCollection } = yield (0, native_client_1.getCollections)();
                const roleData = yield roleDataCollection.findOne({ transactionHash });
                console.log('[MongoDBService] Found role data for transaction:', {
                    transactionHash,
                    found: !!roleData
                });
                return roleData ? Object.assign(Object.assign({}, roleData), { _id: (_a = roleData._id) === null || _a === void 0 ? void 0 : _a.toString() }) : null;
            }
            catch (error) {
                console.error('[MongoDBService] Error getting role data by transaction hash:', error);
                throw error;
            }
        });
    }
    /**
     * Get role data by role
     */
    getRoleDataByRole(role) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { roleData: roleDataCollection } = yield (0, native_client_1.getCollections)();
                const roleData = yield roleDataCollection
                    .find({ role })
                    .sort({ timestamp: -1 })
                    .toArray();
                console.log('[MongoDBService] Found role data for role:', {
                    role,
                    count: roleData.length
                });
                return roleData.map(data => { var _a; return (Object.assign(Object.assign({}, data), { _id: (_a = data._id) === null || _a === void 0 ? void 0 : _a.toString() })); });
            }
            catch (error) {
                console.error('[MongoDBService] Error getting role data by role:', error);
                throw error;
            }
        });
    }
    /**
     * Get role data by user address
     */
    getRoleDataByUser(userAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { roleData: roleDataCollection } = yield (0, native_client_1.getCollections)();
                const roleData = yield roleDataCollection
                    .find({ userAddress: userAddress.toLowerCase() })
                    .sort({ timestamp: -1 })
                    .toArray();
                console.log('[MongoDBService] Found role data for user:', {
                    userAddress,
                    count: roleData.length
                });
                return roleData.map(data => { var _a; return (Object.assign(Object.assign({}, data), { _id: (_a = data._id) === null || _a === void 0 ? void 0 : _a.toString() })); });
            }
            catch (error) {
                console.error('[MongoDBService] Error getting role data by user:', error);
                throw error;
            }
        });
    }
    /**
     * Get netbook data by serial number
     */
    getNetbookDataBySerial(serialNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { netbookData: netbookDataCollection } = yield (0, native_client_1.getCollections)();
                const netbookData = yield netbookDataCollection
                    .find({ serialNumber })
                    .sort({ timestamp: -1 })
                    .toArray();
                console.log('[MongoDBService] Found netbook data for serial:', {
                    serialNumber,
                    count: netbookData.length
                });
                return netbookData.map(data => { var _a; return (Object.assign(Object.assign({}, data), { _id: (_a = data._id) === null || _a === void 0 ? void 0 : _a.toString() })); });
            }
            catch (error) {
                console.error('[MongoDBService] Error getting netbook data by serial:', error);
                throw error;
            }
        });
    }
    /**
     * Get netbook data by transaction hash
     */
    getNetbookDataByTransactionHash(transactionHash) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { netbookData: netbookDataCollection } = yield (0, native_client_1.getCollections)();
                const netbookData = yield netbookDataCollection.findOne({ transactionHash });
                console.log('[MongoDBService] Found netbook data for transaction:', {
                    transactionHash,
                    found: !!netbookData
                });
                return netbookData ? Object.assign(Object.assign({}, netbookData), { _id: (_a = netbookData._id) === null || _a === void 0 ? void 0 : _a.toString() }) : null;
            }
            catch (error) {
                console.error('[MongoDBService] Error getting netbook data by transaction hash:', error);
                throw error;
            }
        });
    }
    /**
     * Get netbook data by serial number and role
     */
    getNetbookDataByRole(serialNumber, role) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { netbookData: netbookDataCollection } = yield (0, native_client_1.getCollections)();
                const netbookData = yield netbookDataCollection.findOne({
                    serialNumber,
                    role
                });
                console.log('[MongoDBService] Found netbook data for serial and role:', {
                    serialNumber,
                    role,
                    found: !!netbookData
                });
                return netbookData ? Object.assign(Object.assign({}, netbookData), { _id: (_a = netbookData._id) === null || _a === void 0 ? void 0 : _a.toString() }) : null;
            }
            catch (error) {
                console.error('[MongoDBService] Error getting netbook data by role:', error);
                throw error;
            }
        });
    }
    /**
     * Get all netbook data across all roles
     */
    getAllNetbookData(serialNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { netbookData: netbookDataCollection } = yield (0, native_client_1.getCollections)();
                const netbookData = yield netbookDataCollection
                    .find({ serialNumber })
                    .sort({ timestamp: -1 })
                    .toArray();
                console.log('[MongoDBService] Found all netbook data for serial:', {
                    serialNumber,
                    count: netbookData.length
                });
                return netbookData.map(data => { var _a; return (Object.assign(Object.assign({}, data), { _id: (_a = data._id) === null || _a === void 0 ? void 0 : _a.toString() })); });
            }
            catch (error) {
                console.error('[MongoDBService] Error getting all netbook data:', error);
                throw error;
            }
        });
    }
}
exports.MongoDBService = MongoDBService;
