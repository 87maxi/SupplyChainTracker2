  'use server'
import { MongoClient, Db, Collection } from 'mongodb';
import { MONGODB_URI, MONGODB_DATABASE } from '@/lib/env';

// Interfaces for our data models
export interface RoleData {
  _id?: string;
  transactionHash: `0x${string}`;
  role: string;
  userAddress: string;
  data: Record<string, unknown>;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface NetbookData {
  _id?: string;
  serialNumber: string;
  transactionHash: `0x${string}`;
  role: string;
  userAddress: string;
  data: Record<string, unknown>;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

class MongoDBService {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private isConnected = false;

  async connect(): Promise<void> {
    if (this.isConnected && this.db) {
      return;
    }

    try {
      const uri = MONGODB_URI;
      if (!uri) {
        throw new Error('MongoDB URI is not configured. Please check your environment variables.');
      }

      this.client = new MongoClient(uri);
      await this.client.connect();
      
      const dbName = MONGODB_DATABASE || 'supplychain';
      this.db = this.client.db(dbName);
      
      // Create indexes for better performance
      await this.createIndexes();
      
      this.isConnected = true;
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      throw error;
    }
  }

  private async createIndexes(): Promise<void> {
    if (!this.db) return;

    try {
      const roleDataCollection = this.db.collection('role_data');
      const netbookDataCollection = this.db.collection('netbook_data');

      // Create indexes for role_data collection
      await roleDataCollection.createIndex({ transactionHash: 1 }, { unique: true });
      await roleDataCollection.createIndex({ role: 1 });
      await roleDataCollection.createIndex({ userAddress: 1 });
      await roleDataCollection.createIndex({ timestamp: -1 });
      await roleDataCollection.createIndex({ createdAt: -1 });

      // Create indexes for netbook_data collection
      await netbookDataCollection.createIndex({ serialNumber: 1 });
      await netbookDataCollection.createIndex({ transactionHash: 1 }, { unique: true });
      await netbookDataCollection.createIndex({ role: 1 });
      await netbookDataCollection.createIndex({ userAddress: 1 });
      await netbookDataCollection.createIndex({ timestamp: -1 });
      await netbookDataCollection.createIndex({ createdAt: -1 });
      await netbookDataCollection.createIndex({ serialNumber: 1, role: 1 });

      console.log('MongoDB indexes created successfully');
    } catch (error) {
      console.error('Error creating MongoDB indexes:', error);
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.isConnected = false;
      this.db = null;
      console.log('Disconnected from MongoDB');
    }
  }

  getRoleDataCollection(): Collection<RoleData> {
    if (!this.db) {
      throw new Error('Database not connected');
    }
    return this.db.collection<RoleData>('role_data');
  }

  getNetbookDataCollection(): Collection<NetbookData> {
    if (!this.db) {
      throw new Error('Database not connected');
    }
    return this.db.collection<NetbookData>('netbook_data');
  }

  // Role data operations
  async saveRoleData(data: Omit<RoleData, '_id' | 'createdAt' | 'updatedAt'>): Promise<RoleData> {
    await this.connect();
    
    const roleDataCollection = this.getRoleDataCollection();
    
    const document: RoleData = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await roleDataCollection.insertOne(document);
    return { ...document, _id: result.insertedId.toString() };
  }

  async getRoleDataByTransactionHash(transactionHash: `0x${string}`): Promise<RoleData | null> {
    await this.connect();
    
    const roleDataCollection = this.getRoleDataCollection();
    return await roleDataCollection.findOne({ transactionHash });
  }

  async getRoleDataByRole(role: string): Promise<RoleData[]> {
    await this.connect();
    
    const roleDataCollection = this.getRoleDataCollection();
    return await roleDataCollection.find({ role }).sort({ timestamp: -1 }).toArray();
  }

  async getRoleDataByUser(userAddress: string): Promise<RoleData[]> {
    await this.connect();
    
    const roleDataCollection = this.getRoleDataCollection();
    return await roleDataCollection.find({ userAddress }).sort({ timestamp: -1 }).toArray();
  }

  // Netbook data operations
  async saveNetbookData(data: Omit<NetbookData, '_id' | 'createdAt' | 'updatedAt'>): Promise<NetbookData> {
    await this.connect();
    
    const netbookDataCollection = this.getNetbookDataCollection();
    
    const document: NetbookData = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await netbookDataCollection.insertOne(document);
    return { ...document, _id: result.insertedId.toString() };
  }

  async getNetbookDataBySerial(serialNumber: string): Promise<NetbookData[]> {
    await this.connect();
    
    const netbookDataCollection = this.getNetbookDataCollection();
    return await netbookDataCollection.find({ serialNumber }).sort({ timestamp: -1 }).toArray();
  }

  async getNetbookDataByTransactionHash(transactionHash: `0x${string}`): Promise<NetbookData | null> {
    await this.connect();
    
    const netbookDataCollection = this.getNetbookDataCollection();
    return await netbookDataCollection.findOne({ transactionHash });
  }

  async getNetbookDataByRole(serialNumber: string, role: string): Promise<NetbookData | null> {
    await this.connect();
    
    const netbookDataCollection = this.getNetbookDataCollection();
    return await netbookDataCollection.findOne({ serialNumber, role });
  }

  // Get all data for a netbook across all roles
  async getAllNetbookData(serialNumber: string): Promise<NetbookData[]> {
    await this.connect();
    
    const netbookDataCollection = this.getNetbookDataCollection();
    return await netbookDataCollection.find({ serialNumber }).sort({ timestamp: -1 }).toArray();
  }
}

// Export singleton instance
export const mongodbService = new MongoDBService();