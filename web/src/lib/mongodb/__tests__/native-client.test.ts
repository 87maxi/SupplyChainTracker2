// web/src/lib/mongodb/__tests__/native-client.test.ts
// Tests for native MongoDB client

import { MongoClient } from 'mongodb';
import { connectToDatabase, initializeIndexes, getCollections } from '../native-client';

// Mock MongoDB client
jest.mock('mongodb', () => ({
  MongoClient: {
    connect: jest.fn()
  }
}));

describe('Native MongoDB Client', () => {
  const mockClient = { db: jest.fn().mockReturnThis() } as unknown as jest.Mocked<MongoClient>;
    db: jest.fn().mockReturnValue({
      collection: jest.fn().mockImplementation((name) => ({
        createIndex: jest.fn().mockResolvedValue(undefined)
      }))
    }),
    close: jest.fn().mockResolvedValue(undefined)
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (MongoClient.connect as jest.Mock).mockResolvedValue(mockClient);
    
    // Clear the global cache before each test
    (global as any).mongoDBCache = undefined;
    jest.spyOn(MongoClient, 'connect').mockResolvedValue(mockClient);
  });

  describe('connectToDatabase', () => {
    it('should connect to MongoDB successfully', async () => {
      const result = await connectToDatabase();
      
      expect(MongoClient.connect).toHaveBeenCalledWith(
        'mongodb://localhost:27017',
        expect.any(Object)
      );
      expect(result.client).toBe(mockClient);
      expect(result.db).toBeDefined();
    });
  });

  describe('getCollections', () => {
    it('should return collections successfully', async () => {
      const collections = await getCollections();
      
      expect(collections).toEqual({
        roleData: expect.any(Object),
        netbookData: expect.any(Object)
      });
    });
  });

  describe('initializeIndexes', () => {
    it('should initialize indexes successfully', async () => {
      await initializeIndexes();
      
      // Should create indexes
      const mockDb = mockClient.db();
      expect(mockDb.collection).toHaveBeenCalledWith('role_data');
      expect(mockDb.collection).toHaveBeenCalledWith('netbook_data');
    });
  });
});