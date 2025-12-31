import { MongoDBClient } from '@/lib/mongodb-client';
import { RoleRequest } from '@/types/role-request';
import { Address } from 'viem';

/**
 * Service to handle role requests persistence in MongoDB
 */
export class RoleRequestService {
  /**
   * Submit a new role request
   */
  static async submitRoleRequest(address: Address, role: string, signature?: string): Promise<RoleRequest> {
    try {
      return await MongoDBClient.submitRoleRequest(address, role, signature);
    } catch (error) {
      console.error('[RoleRequestService] Error submitting role request:', error);
      throw error;
    }
  }

  /**
   * Get all pending role requests
   */
  static async getPendingRoleRequests(): Promise<RoleRequest[]> {
    try {
      return await MongoDBClient.getPendingRoleRequests();
    } catch (error) {
      console.error('[RoleRequestService] Error getting pending requests:', error);
      throw error;
    }
  }

  /**
   * Get all role requests (including approved/rejected)
   */
  static async getAllRoleRequests(): Promise<RoleRequest[]> {
    try {
      return await MongoDBClient.getAllRoleRequests();
    } catch (error) {
      console.error('[RoleRequestService] Error getting all requests:', error);
      throw error;
    }
  }

  /**
   * Update role request status
   */
  static async updateRoleRequestStatus(id: string, status: 'approved' | 'rejected'): Promise<void> {
    try {
      await MongoDBClient.updateRoleRequestStatus(id, status);
    } catch (error) {
      console.error('[RoleRequestService] Error updating request status:', error);
      throw error;
    }
  }

  /**
   * Delete role request
   */
  static async deleteRoleRequest(id: string): Promise<void> {
    try {
      await MongoDBClient.deleteRoleRequest(id);
    } catch (error) {
      console.error('[RoleRequestService] Error deleting request:', error);
      throw error;
    }
  }

  /**
   * Get role requests by user address
   */
  static async getRoleRequestsByUser(address: Address): Promise<RoleRequest[]> {
    try {
      return await MongoDBClient.getRoleRequestsByUser(address);
    } catch (error) {
      console.error('[RoleRequestService] Error getting user requests:', error);
      throw error;
    }
  }
}