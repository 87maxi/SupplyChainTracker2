"use strict";
// web/src/lib/mongodb/native-client.ts
// Native MongoDB client implementation without Mongoose
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
exports.connectToDatabase = connectToDatabase;
exports.getCollections = getCollections;
exports.initializeIndexes = initializeIndexes;
exports.disconnectFromDatabase = disconnectFromDatabase;
exports.getConnectionStatus = getConnectionStatus;
const mongodb_1 = require("mongodb");
const config_1 = require("./config");
let cached = global.mongoDBCache || {
    client: null,
    db: null,
    promise: null,
};
if (!global.mongoDBCache) {
    global.mongoDBCache = cached;
}
/**
 * Connect to MongoDB using native driver
 */
function connectToDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        if (cached.client && cached.db) {
            return { client: cached.client, db: cached.db };
        }
        if (!cached.promise) {
            const options = {
            // Connection options if needed
            };
            cached.promise = mongodb_1.MongoClient.connect(config_1.mongodbConfig.uri, options)
                .then((client) => {
                const db = client.db(config_1.mongodbConfig.db);
                console.log('✅ Connected to MongoDB successfully (native driver)');
                return { client, db };
            })
                .catch((error) => {
                console.error('❌ Error connecting to MongoDB:', error);
                cached.promise = null;
                throw error;
            });
        }
        try {
            const { client, db } = yield cached.promise;
            cached.client = client;
            cached.db = db;
            return { client, db };
        }
        catch (error) {
            cached.promise = null;
            throw error;
        }
    });
}
/**
 * Get collections
 */
function getCollections() {
    return __awaiter(this, void 0, void 0, function* () {
        const { db } = yield connectToDatabase();
        return {
            roleData: db.collection('role_data'),
            netbookData: db.collection('netbook_data')
        };
    });
}
/**
 * Initialize indexes for collections
 */
function initializeIndexes() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { roleData, netbookData } = yield getCollections();
            // Indexes for role_data collection
            yield roleData.createIndex({ transactionHash: 1 }, { unique: true });
            yield roleData.createIndex({ role: 1 });
            yield roleData.createIndex({ userAddress: 1 });
            yield roleData.createIndex({ timestamp: -1 });
            yield roleData.createIndex({ createdAt: -1 });
            // Indexes for netbook_data collection
            yield netbookData.createIndex({ transactionHash: 1 }, { unique: true });
            yield netbookData.createIndex({ serialNumber: 1 });
            yield netbookData.createIndex({ role: 1 });
            yield netbookData.createIndex({ userAddress: 1 });
            yield netbookData.createIndex({ timestamp: -1 });
            yield netbookData.createIndex({ createdAt: -1 });
            yield netbookData.createIndex({ serialNumber: 1, role: 1 });
            console.log('✅ MongoDB indexes initialized');
        }
        catch (error) {
            console.error('❌ Error initializing MongoDB indexes:', error);
            throw error;
        }
    });
}
/**
 * Disconnect from MongoDB
 */
function disconnectFromDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        if (cached.client) {
            yield cached.client.close();
            cached.client = null;
            cached.db = null;
            cached.promise = null;
            console.log('✅ Disconnected from MongoDB');
        }
    });
}
/**
 * Get connection status
 */
function getConnectionStatus() {
    return cached.client ? 'connected' : 'disconnected';
}
exports.default = {
    connectToDatabase,
    disconnectFromDatabase,
    getConnectionStatus,
    initializeIndexes,
    getCollections
};
