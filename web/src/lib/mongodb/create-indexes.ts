import { getCollections } from './native-client';

export async function createIndexes() {
  try {
    const { roleData, netbookData } = await getCollections();
    
    // Create indexes for role_data collection
    await roleData.createIndex({ transactionHash: 1 }, { unique: true });
    await roleData.createIndex({ userAddress: 1 });
    await roleData.createIndex({ role: 1 });
    await roleData.createIndex({ timestamp: -1 });
    await roleData.createIndex({ status: 1 });
    
    // Create indexes for netbook_data collection
    await netbookData.createIndex({ serialNumber: 1 });
    await netbookData.createIndex({ transactionHash: 1 }, { unique: true });
    await netbookData.createIndex({ userAddress: 1 });
    await netbookData.createIndex({ role: 1 });
    await netbookData.createIndex({ status: 1 });
    await netbookData.createIndex({ timestamp: -1 });
    
    // Create compound indexes
    await netbookData.createIndex({ serialNumber: 1, role: 1 });
    await netbookData.createIndex({ serialNumber: 1, status: 1 });
    
    console.log('[createIndexes] Successfully created all indexes');
  } catch (error) {
    console.error('[createIndexes] Error creating indexes:', error);
    throw error;
  }
}