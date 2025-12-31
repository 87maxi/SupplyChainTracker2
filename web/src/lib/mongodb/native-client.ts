// web/src/lib/mongodb/native-client.ts
// Native MongoDB client implementation without Mongoose

import { MongoClient, Db, Collection } from 'mongodb';
import { mongodbConfig } from './config';
import { RoleData, NetbookData } from '@/types/mongodb';
import { ContractRoles } from '@/types/contract';
import { Address } from 'viem';

// Global cache for MongoDB connection
interface MongoDBCache {
  client: MongoClient | null;
  db: Db | null;
  promise: Promise<{ client: MongoClient; db: Db }> | null;
}

declare global {
  var mongoDBCache: MongoDBCache | undefined;
}

let cached: MongoDBCache = global.mongoDBCache || {
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
export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cached.client && cached.db) {
    return { client: cached.client, db: cached.db };
  }

  if (!cached.promise) {
    const options = {
      // Connection options if needed
    };

    cached.promise = MongoClient.connect(mongodbConfig.uri, options)
      .then((client) => {
        const db = client.db(mongodbConfig.db);
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
    const { client, db } = await cached.promise;
    cached.client = client;
    cached.db = db;
    return { client, db };
  } catch (error) {
    cached.promise = null;
    throw error;
  }
}

/**
 * Get collections
 */
export async function getCollections() {
  const { db } = await connectToDatabase();
  
  return {
    roleData: db.collection<RoleData>('role_data'),
    netbookData: db.collection<NetbookData>('netbook_data')
  };
}

/**
 * Initialize indexes for collections
 */
export async function initializeIndexes(): Promise<void> {
  try {
    const { roleData, netbookData } = await getCollections();

    // Indexes for role_data collection
    await roleData.createIndex({ transactionHash: 1 }, { unique: true });
    await roleData.createIndex({ role: 1 });
    await roleData.createIndex({ userAddress: 1 });
    await roleData.createIndex({ timestamp: -1 });
    await roleData.createIndex({ createdAt: -1 });

    // Indexes for netbook_data collection
    await netbookData.createIndex({ transactionHash: 1 }, { unique: true });
    await netbookData.createIndex({ serialNumber: 1 });
    await netbookData.createIndex({ role: 1 });
    await netbookData.createIndex({ userAddress: 1 });
    await netbookData.createIndex({ timestamp: -1 });
    await netbookData.createIndex({ createdAt: -1 });
    await netbookData.createIndex({ serialNumber: 1, role: 1 });

    console.log('✅ MongoDB indexes initialized');
  } catch (error) {
    console.error('❌ Error initializing MongoDB indexes:', error);
    throw error;
  }
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectFromDatabase(): Promise<void> {
  if (cached.client) {
    await cached.client.close();
    cached.client = null;
    cached.db = null;
    cached.promise = null;
    console.log('✅ Disconnected from MongoDB');
  }
}

/**
 * Get connection status
 */
export function getConnectionStatus(): string {
  return cached.client ? 'connected' : 'disconnected';
}

export default {
  connectToDatabase,
  disconnectFromDatabase,
  getConnectionStatus,
  initializeIndexes,
  getCollections
};