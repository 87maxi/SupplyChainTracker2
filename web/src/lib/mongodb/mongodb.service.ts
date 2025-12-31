// web/src/lib/mongodb/mongodb.service.ts
// MongoDB Service implementation for role and netbook data

import { getCollections } from './native-client';
import { RoleData, NetbookData } from '@/types/mongodb';
import { ContractRoles } from '@/types/contract';
import { Address } from 'viem';

export class MongoDBService {
  /**
   * Save role action data to MongoDB
   */
  async saveRoleData(params: {
    transactionHash: `0x${string}`;
    role: ContractRoles;
    userAddress: Address;
    data: Record<string, unknown>;
    timestamp?: Date;
  }): Promise<RoleData> {
    try {
      const { roleData: roleDataCollection } = await getCollections();
      
      const roleData: RoleData = {
        transactionHash: params.transactionHash,
        role: params.role,
        userAddress: params.userAddress.toLowerCase(),
        data: params.data,
        timestamp: params.timestamp || new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await roleDataCollection.insertOne(roleData);
      
      console.log('[MongoDBService] Saved role data:', {
        transactionHash: params.transactionHash,
        role: params.role,
        insertedId: result.insertedId
      });
      
      return { ...roleData, _id: result.insertedId.toString() };
    } catch (error) {
      console.error('[MongoDBService] Error saving role data:', error);
      throw error;
    }
  }

  /**
   * Save netbook data to MongoDB
   */
  async saveNetbookData(params: {
    serialNumber: string;
    transactionHash: `0x${string}`;
    role: ContractRoles;
    userAddress: Address;
    data: Record<string, unknown>;
    timestamp?: Date;
  }): Promise<NetbookData> {
    try {
      const { netbookData: netbookDataCollection } = await getCollections();
      
      const netbookData: NetbookData = {
        serialNumber: params.serialNumber,
        transactionHash: params.transactionHash,
        role: params.role,
        userAddress: params.userAddress.toLowerCase(),
        data: params.data,
        timestamp: params.timestamp || new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await netbookDataCollection.insertOne(netbookData);
      
      console.log('[MongoDBService] Saved netbook data:', {
        serialNumber: params.serialNumber,
        transactionHash: params.transactionHash,
        role: params.role,
        insertedId: result.insertedId
      });
      
      return { ...netbookData, _id: result.insertedId.toString() };
    } catch (error) {
      console.error('[MongoDBService] Error saving netbook data:', error);
      throw error;
    }
  }

  /**
   * Get role data by transaction hash
   */
  async getRoleDataByTransactionHash(transactionHash: `0x${string}`): Promise<RoleData | null> {
    try {
      const { roleData: roleDataCollection } = await getCollections();
      
      const roleData = await roleDataCollection.findOne({ transactionHash });
      
      console.log('[MongoDBService] Found role data for transaction:', {
        transactionHash,
        found: !!roleData
      });
      
      return roleData ? { ...roleData, _id: roleData._id?.toString() } : null;
    } catch (error) {
      console.error('[MongoDBService] Error getting role data by transaction hash:', error);
      throw error;
    }
  }

  /**
   * Get role data by role
   */
  async getRoleDataByRole(role: ContractRoles): Promise<RoleData[]> {
    try {
      const { roleData: roleDataCollection } = await getCollections();
      
      const roleData = await roleDataCollection
        .find({ role })
        .sort({ timestamp: -1 })
        .toArray();
      
      console.log('[MongoDBService] Found role data for role:', {
        role,
        count: roleData.length
      });
      
      return roleData.map(data => ({ ...data, _id: data._id?.toString() }));
    } catch (error) {
      console.error('[MongoDBService] Error getting role data by role:', error);
      throw error;
    }
  }

  /**
   * Get role data by user address
   */
  async getRoleDataByUser(userAddress: Address): Promise<RoleData[]> {
    try {
      const { roleData: roleDataCollection } = await getCollections();
      
      const roleData = await roleDataCollection
        .find({ userAddress: userAddress.toLowerCase() })
        .sort({ timestamp: -1 })
        .toArray();
      
      console.log('[MongoDBService] Found role data for user:', {
        userAddress,
        count: roleData.length
      });
      
      return roleData.map(data => ({ ...data, _id: data._id?.toString() }));
    } catch (error) {
      console.error('[MongoDBService] Error getting role data by user:', error);
      throw error;
    }
  }

  /**
   * Get netbook data by serial number
   */
  async getNetbookDataBySerial(serialNumber: string): Promise<NetbookData[]> {
    try {
      const { netbookData: netbookDataCollection } = await getCollections();
      
      const netbookData = await netbookDataCollection
        .find({ serialNumber })
        .sort({ timestamp: -1 })
        .toArray();
      
      console.log('[MongoDBService] Found netbook data for serial:', {
        serialNumber,
        count: netbookData.length
      });
      
      return netbookData.map(data => ({ ...data, _id: data._id?.toString() }));
    } catch (error) {
      console.error('[MongoDBService] Error getting netbook data by serial:', error);
      throw error;
    }
  }

  /**
   * Get netbook data by transaction hash
   */
  async getNetbookDataByTransactionHash(transactionHash: `0x${string}`): Promise<NetbookData | null> {
    try {
      const { netbookData: netbookDataCollection } = await getCollections();
      
      const netbookData = await netbookDataCollection.findOne({ transactionHash });
      
      console.log('[MongoDBService] Found netbook data for transaction:', {
        transactionHash,
        found: !!netbookData
      });
      
      return netbookData ? { ...netbookData, _id: netbookData._id?.toString() } : null;
    } catch (error) {
      console.error('[MongoDBService] Error getting netbook data by transaction hash:', error);
      throw error;
    }
  }

  /**
   * Get netbook data by serial number and role
   */
  async getNetbookDataByRole(serialNumber: string, role: ContractRoles): Promise<NetbookData | null> {
    try {
      const { netbookData: netbookDataCollection } = await getCollections();
      
      const netbookData = await netbookDataCollection.findOne({ 
        serialNumber, 
        role 
      });
      
      console.log('[MongoDBService] Found netbook data for serial and role:', {
        serialNumber,
        role,
        found: !!netbookData
      });
      
      return netbookData ? { ...netbookData, _id: netbookData._id?.toString() } : null;
    } catch (error) {
      console.error('[MongoDBService] Error getting netbook data by role:', error);
      throw error;
    }
  }

  /**
   * Get all netbook data across all roles
   */
  async getAllNetbookData(serialNumber: string): Promise<NetbookData[]> {
    try {
      const { netbookData: netbookDataCollection } = await getCollections();
      
      const netbookData = await netbookDataCollection
        .find({ serialNumber })
        .sort({ timestamp: -1 })
        .toArray();
      
      console.log('[MongoDBService] Found all netbook data for serial:', {
        serialNumber,
        count: netbookData.length
      });
      
      return netbookData.map(data => ({ ...data, _id: data._id?.toString() }));
    } catch (error) {
      console.error('[MongoDBService] Error getting all netbook data:', error);
      throw error;
    }
  }
}