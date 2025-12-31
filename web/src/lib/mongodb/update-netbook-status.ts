import { getCollections } from './native-client';
import { NetbookData } from '@/types/mongodb';

export async function updateNetbookStatus(params: {
  serialNumber: string;
  status: string;
  updatedBy: string;
  metadata?: Record<string, unknown>;
}): Promise<boolean> {
  try {
    const { netbookData: netbookDataCollection } = await getCollections();
    
    const updateFields: Record<string, unknown> = {
      status: params.status,
      updatedBy: params.updatedBy.toLowerCase(),
      updatedAt: new Date()
    };
    
    if (params.metadata) {
      updateFields.metadata = params.metadata;
    }
    
    const result = await netbookDataCollection.updateOne(
      { serialNumber: params.serialNumber },
      { 
        $set: updateFields,
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true }
    );
    
    console.log('[updateNetbookStatus] Updated netbook status:', {
      serialNumber: params.serialNumber,
      status: params.status,
      matched: result.matchedCount,
      modified: result.modifiedCount,
      upserted: result.upsertedId
    });
    
    return result.modifiedCount > 0 || result.upsertedId != null;
  } catch (error) {
    console.error('[updateNetbookStatus] Error updating netbook status:', error);
    throw error;
  }
}