import { connectToDatabase } from '@/lib/mongodb';
import { RoleData, NetbookData } from '@/types/mongodb';
import { ContractRoles } from '@/types/contract';
import { Address } from 'viem';

/**
 * Service to handle role data persistence in MongoDB
 */
export class RoleDataService {
  /**
   * Save role action data to MongoDB
   * @param params Role data parameters
   * @returns Saved role data
   */
  static async saveRoleData(params: {
    transactionHash: `0x${string}`;
    role: ContractRoles;
    userAddress: Address;
    data: Record<string, unknown>;
    timestamp?: Date;
  }): Promise<RoleData> {
    try {
      const { db } = await connectToDatabase();
      const result = await db.collection('role_data').insertOne({
        transactionHash: params.transactionHash,
        role: params.role,
        userAddress: params.userAddress,
        data: params.data,
        timestamp: params.timestamp || new Date()
      });
      
      
      console.log(`[RoleDataService] Saved role data for transaction ${params.transactionHash}`);
      return { ...params, _id: result.insertedId.toString() };
    } catch (error) {
      console.error('[RoleDataService] Error saving role data:', error);
      throw error;
    }
  }

  /**
   * Save netbook data to MongoDB
   * @param params Netbook data parameters
   * @returns Saved netbook data
   */
  static async saveNetbookData(params: {
    serialNumber: string;
    transactionHash: `0x${string}`;
    role: ContractRoles;
    userAddress: Address;
    data: Record<string, unknown>;
    timestamp?: Date;
  }): Promise<NetbookData> {
    try {
      const { db } = await connectToDatabase();
      const result = await db.collection('netbook_data').insertOne({
        serialNumber: params.serialNumber,
        transactionHash: params.transactionHash,
        role: params.role,
        userAddress: params.userAddress,
        data: params.data,
        timestamp: params.timestamp || new Date()
      });
      
      
      console.log(`[RoleDataService] Saved netbook data for serial ${params.serialNumber}, transaction ${params.transactionHash}`);
      return { ...params, _id: result.insertedId.toString() };
    } catch (error) {
      console.error('[RoleDataService] Error saving netbook data:', error);
      throw error;
    }
  }

  /**
   * Get role data by transaction hash
   * @param transactionHash Transaction hash
   * @returns Role data or null
   */
  static async getRoleDataByTransactionHash(transactionHash: `0x${string}`): Promise<RoleData | null> {
    try {
      const { db } = await connectToDatabase();
      const roleData = await db.collection('role_data').findOne({ transactionHash });
      return roleData ? { ...roleData, _id: roleData._id?.toString() } : null;
    } catch (error) {
      console.error('[RoleDataService] Error getting role data by transaction hash:', error);
      throw error;
    }
  }

  /**
   * Get role data by role
   * @param role Role name
   * @returns Array of role data
   */
  static async getRoleDataByRole(role: ContractRoles): Promise<RoleData[]> {
    try {
      const { db } = await connectToDatabase();
      const roleData = await db.collection('role_data').find({ role }).sort({ timestamp: -1 }).toArray();
      return roleData.map(data => ({ ...data, _id: data._id?.toString() }));
    } catch (error) {
      console.error('[RoleDataService] Error getting role data by role:', error);
      throw error;
    }
  }

  /**
   * Get role data by user address
   * @param userAddress User address
   * @returns Array of role data
   */
  static async getRoleDataByUser(userAddress: Address): Promise<RoleData[]> {
    try {
      const { db } = await connectToDatabase();
      const roleData = await db.collection('role_data').find({ userAddress: userAddress.toLowerCase() }).sort({ timestamp: -1 }).toArray();
      return roleData.map(data => ({ ...data, _id: data._id?.toString() }));
    } catch (error) {
      console.error('[RoleDataService] Error getting role data by user:', error);
      throw error;
    }
  }

  /**
   * Get netbook data by serial number
   * @param serialNumber Serial number
   * @returns Array of netbook data
   */
  static async getNetbookDataBySerial(serialNumber: string): Promise<NetbookData[]> {
    try {
      const { db } = await connectToDatabase();
      const netbookData = await db.collection('netbook_data').find({ serialNumber }).sort({ timestamp: -1 }).toArray();
      return netbookData.map(data => ({ ...data, _id: data._id?.toString() }));
    } catch (error) {
      console.error('[RoleDataService] Error getting netbook data by serial:', error);
      throw error;
    }
  }

  /**
   * Get netbook data by transaction hash
   * @param transactionHash Transaction hash
   * @returns Netbook data or null
   */
  static async getNetbookDataByTransactionHash(transactionHash: `0x${string}`): Promise<NetbookData | null> {
    try {
      const { db } = await connectToDatabase();
      const netbookData = await db.collection('netbook_data').findOne({ transactionHash });
      return netbookData ? { ...netbookData, _id: netbookData._id?.toString() } : null;
    } catch (error) {
      console.error('[RoleDataService] Error getting netbook data by transaction hash:', error);
      throw error;
    }
  }

  /**
   * Get netbook data by serial number and role
   * @param serialNumber Serial number
   * @param role Role name
   * @returns Netbook data or null
   */
  static async getNetbookDataByRole(serialNumber: string, role: ContractRoles): Promise<NetbookData | null> {
    try {
      const { db } = await connectToDatabase();
      const netbookData = await db.collection('netbook_data').findOne({ serialNumber, role });
      return netbookData ? { ...netbookData, _id: netbookData._id?.toString() } : null;
    } catch (error) {
      console.error('[RoleDataService] Error getting netbook data by role:', error);
      throw error;
    }
  }

  /**
   * Get all netbook data across all roles
   * @param serialNumber Serial number
   * @returns Array of netbook data
   */
  static async getAllNetbookData(serialNumber: string): Promise<NetbookData[]> {
    try {
      const { db } = await connectToDatabase();
      const netbookData = await db.collection('netbook_data').find({ serialNumber }).sort({ timestamp: -1 }).toArray();
      return netbookData.map(data => ({ ...data, _id: data._id?.toString() }));
    } catch (error) {
      console.error('[RoleDataService] Error getting all netbook data:', error);
      throw error;
    }
  }
}