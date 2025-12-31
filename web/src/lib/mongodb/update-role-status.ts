import { getCollections } from './native-client';
import { RoleData } from '@/types/mongodb';
import { ContractRoles } from '@/types/contract';
import { Address } from 'viem';

export async function updateRoleStatus(params: {
  transactionHash: `0x${string}`;
  status: 'approved' | 'rejected';
  updatedBy: Address;
}): Promise<boolean> {
  try {
    const { roleData: roleDataCollection } = await getCollections();
    
    const result = await roleDataCollection.updateOne(
      { transactionHash: params.transactionHash },
      { 
        $set: { 
          status: params.status,
          updatedBy: params.updatedBy.toLowerCase(),
          updatedAt: new Date()
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true }
    );
    
    console.log('[updateRoleStatus] Updated role status:', {
      transactionHash: params.transactionHash,
      status: params.status,
      matched: result.matchedCount,
      modified: result.modifiedCount,
      upserted: result.upsertedId
    });
    
    return result.modifiedCount > 0 || result.upsertedId != null;
  } catch (error) {
    console.error('[updateRoleStatus] Error updating role status:', error);
    throw error;
  }
}