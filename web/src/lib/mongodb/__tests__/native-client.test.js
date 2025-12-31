"use strict";
// web/src/lib/mongodb/__tests__/native-client.test.ts
// Tests for native MongoDB client
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
const mongodb_1 = require("mongodb");
const native_client_1 = require("../native-client");
// Mock MongoDB client
jest.mock('mongodb', () => ({
    MongoClient: {
        connect: jest.fn()
    }
}));
describe('Native MongoDB Client', () => {
    const mockClient = {
        db: jest.fn().mockReturnValue({
            collection: jest.fn().mockImplementation((name) => ({
                createIndex: jest.fn().mockResolvedValue(undefined)
            }))
        }),
        close: jest.fn().mockResolvedValue(undefined)
    };
    beforeEach(() => {
        jest.clearAllMocks();
        mongodb_1.MongoClient.connect.mockResolvedValue(mockClient);
        // Clear the global cache before each test
        global.mongoDBCache = undefined;
    });
    describe('connectToDatabase', () => {
        it('should connect to MongoDB successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield (0, native_client_1.connectToDatabase)();
            expect(mongodb_1.MongoClient.connect).toHaveBeenCalledWith('mongodb://localhost:27017', expect.any(Object));
            expect(result.client).toBe(mockClient);
            expect(result.db).toBeDefined();
        }));
    });
    describe('getCollections', () => {
        it('should return collections successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const collections = yield (0, native_client_1.getCollections)();
            expect(collections).toEqual({
                roleData: expect.any(Object),
                netbookData: expect.any(Object)
            });
        }));
    });
    describe('initializeIndexes', () => {
        it('should initialize indexes successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, native_client_1.initializeIndexes)();
            // Should create indexes
            const mockDb = mockClient.db();
            expect(mockDb.collection).toHaveBeenCalledWith('role_data');
            expect(mockDb.collection).toHaveBeenCalledWith('netbook_data');
        }));
    });
});
