"use strict";
// web/src/lib/mongodb/__tests__/mongodb.service.test.ts
// Tests for MongoDB service
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
const mongodb_service_1 = require("../mongodb.service");
// Mock the native client
jest.mock('../native-client', () => ({
    getCollections: jest.fn().mockResolvedValue({
        roleData: {
            insertOne: jest.fn().mockResolvedValue({ insertedId: 'mock-id-1' }),
            findOne: jest.fn().mockResolvedValue(null),
            find: jest.fn().mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    toArray: jest.fn().mockResolvedValue([])
                })
            })
        },
        netbookData: {
            insertOne: jest.fn().mockResolvedValue({ insertedId: 'mock-id-2' }),
            findOne: jest.fn().mockResolvedValue(null),
            find: jest.fn().mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    toArray: jest.fn().mockResolvedValue([])
                })
            })
        }
    }),
    initializeIndexes: jest.fn().mockResolvedValue(undefined)
}));
describe('MongoDBService', () => {
    let service;
    beforeEach(() => {
        service = new mongodb_service_1.MongoDBService();
        jest.clearAllMocks();
    });
    describe('saveRoleData', () => {
        it('should save role data successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const params = {
                transactionHash: '0x1234567890abcdef',
                role: 'FABRICANTE_ROLE',
                userAddress: '0x1234567890abcdef1234567890abcdef12345678',
                data: { action: 'create', metadata: 'test' }
            };
            const result = yield service.saveRoleData(params);
            expect(result).toEqual({
                transactionHash: '0x1234567890abcdef',
                role: 'FABRICANTE_ROLE',
                userAddress: '0x1234567890abcdef1234567890abcdef12345678',
                data: { action: 'create', metadata: 'test' },
                timestamp: expect.any(Date),
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date),
                _id: 'mock-id-1'
            });
        }));
    });
    describe('saveNetbookData', () => {
        it('should save netbook data successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const params = {
                serialNumber: 'NB-123456',
                transactionHash: '0x1234567890abcdef',
                role: 'AUDITOR_HW_ROLE',
                userAddress: '0x1234567890abcdef1234567890abcdef12345678',
                data: { model: 'EduBook Pro', specs: { cpu: 'Intel i5' } }
            };
            const result = yield service.saveNetbookData(params);
            expect(result).toEqual({
                serialNumber: 'NB-123456',
                transactionHash: '0x1234567890abcdef',
                role: 'AUDITOR_HW_ROLE',
                userAddress: '0x1234567890abcdef1234567890abcdef12345678',
                data: { model: 'EduBook Pro', specs: { cpu: 'Intel i5' } },
                timestamp: expect.any(Date),
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date),
                _id: 'mock-id-2'
            });
        }));
    });
    describe('getRoleDataByTransactionHash', () => {
        it('should return null when no data found', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield service.getRoleDataByTransactionHash('0x123456');
            expect(result).toBeNull();
        }));
    });
    describe('getRoleDataByRole', () => {
        it('should return empty array when no data found', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield service.getRoleDataByRole('FABRICANTE_ROLE');
            expect(result).toEqual([]);
        }));
    });
    describe('getRoleDataByUser', () => {
        it('should return empty array when no data found', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield service.getRoleDataByUser('0x123456');
            expect(result).toEqual([]);
        }));
    });
    describe('getNetbookDataBySerial', () => {
        it('should return empty array when no data found', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield service.getNetbookDataBySerial('NB-123456');
            expect(result).toEqual([]);
        }));
    });
    describe('getNetbookDataByTransactionHash', () => {
        it('should return null when no data found', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield service.getNetbookDataByTransactionHash('0x123456');
            expect(result).toBeNull();
        }));
    });
    describe('getNetbookDataByRole', () => {
        it('should return null when no data found', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield service.getNetbookDataByRole('NB-123456', 'FABRICANTE_ROLE');
            expect(result).toBeNull();
        }));
    });
    describe('getAllNetbookData', () => {
        it('should return empty array when no data found', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield service.getAllNetbookData('NB-123456');
            expect(result).toEqual([]);
        }));
    });
});
