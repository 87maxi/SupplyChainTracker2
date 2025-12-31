// web/src/lib/mongodb/__tests__/mongodb.service.test.ts
// Tests for MongoDB service

import { MongoDBService } from '../mongodb.service';
import { ContractRoles } from '@/types/contract';

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
  let service: MongoDBService;

  beforeEach(() => {
    service = new MongoDBService();
    jest.clearAllMocks();
  });

  describe('saveRoleData', () => {
    it('should save role data successfully', async () => {
      const params = {
        transactionHash: '0x1234567890abcdef' as `0x${string}`,
        role: 'FABRICANTE_ROLE' as ContractRoles,
        userAddress: '0x1234567890abcdef1234567890abcdef12345678' as `0x${string}`,
        data: { action: 'create', metadata: 'test' }
      };

      const result = await service.saveRoleData(params);

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
    });
  });

  describe('saveNetbookData', () => {
    it('should save netbook data successfully', async () => {
      const params = {
        serialNumber: 'NB-123456',
        transactionHash: '0x1234567890abcdef' as `0x${string}`,
        role: 'AUDITOR_HW_ROLE' as ContractRoles,
        userAddress: '0x1234567890abcdef1234567890abcdef12345678' as `0x${string}`,
        data: { model: 'EduBook Pro', specs: { cpu: 'Intel i5' } }
      };

      const result = await service.saveNetbookData(params);

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
    });
  });

  describe('getRoleDataByTransactionHash', () => {
    it('should return null when no data found', async () => {
      const result = await service.getRoleDataByTransactionHash('0x123456' as `0x${string}`);
      expect(result).toBeNull();
    });
  });

  describe('getRoleDataByRole', () => {
    it('should return empty array when no data found', async () => {
      const result = await service.getRoleDataByRole('FABRICANTE_ROLE' as ContractRoles);
      expect(result).toEqual([]);
    });
  });

  describe('getRoleDataByUser', () => {
    it('should return empty array when no data found', async () => {
      const result = await service.getRoleDataByUser('0x123456' as `0x${string}`);
      expect(result).toEqual([]);
    });
  });

  describe('getNetbookDataBySerial', () => {
    it('should return empty array when no data found', async () => {
      const result = await service.getNetbookDataBySerial('NB-123456');
      expect(result).toEqual([]);
    });
  });

  describe('getNetbookDataByTransactionHash', () => {
    it('should return null when no data found', async () => {
      const result = await service.getNetbookDataByTransactionHash('0x123456' as `0x${string}`);
      expect(result).toBeNull();
    });
  });

  describe('getNetbookDataByRole', () => {
    it('should return null when no data found', async () => {
      const result = await service.getNetbookDataByRole('NB-123456', 'FABRICANTE_ROLE' as ContractRoles);
      expect(result).toBeNull();
    });
  });

  describe('getAllNetbookData', () => {
    it('should return empty array when no data found', async () => {
      const result = await service.getAllNetbookData('NB-123456');
      expect(result).toEqual([]);
    });
  });
});