'use server';

import { revalidateTag } from 'next/cache';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Define the types
export type RoleRequest = {
  id: string;
  userAddress: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: Date;
  processedDate?: Date;
  transactionHash?: string;
  signature?: string;
};

// Create a new role request and save to MongoDB
class RoleRequestService {
  private static instance: RoleRequestService;
  private collection = 'role_requests';

  private constructor() {}

  public static getInstance(): RoleRequestService {
    if (!RoleRequestService.instance) {
      RoleRequestService.instance = new RoleRequestService();
    }
    return RoleRequestService.instance;
  }

  private async getCollection() {
    const { db } = await connectToDatabase();
    return db.collection(this.collection);
  }

  // Create a new role request
  async createRequest(data: Omit<RoleRequest, 'id' | 'status' | 'requestDate'>): Promise<RoleRequest> {
    try {
      const collection = await this.getCollection();
      
      const request: RoleRequest = {
        id: Math.random().toString(36).substring(7),
        ...data,
        status: 'pending',
        requestDate: new Date()
      };
      
      await collection.insertOne(request);
      
      // Revalidate cache
      revalidateTag('role-requests');
      
      return request;
    } catch (error) {
      console.error('Error creating role request:', error);
      throw new Error('Failed to create role request');
    }
  }

  // Get all role requests
  async getAllRequests(): Promise<RoleRequest[]> {
    try {
      const collection = await this.getCollection();
      const requests = await collection.find({}).sort({ requestDate: -1 }).toArray();
      
      return requests.map(request => ({
        ...request,
        _id: undefined,
        id: request._id.toString()
      })) as RoleRequest[];
    } catch (error) {
      console.error('Error getting role requests:', error);
      throw new Error('Failed to get role requests');
    }
  }

  // Get role requests by status
  async getRequestsByStatus(status: 'pending' | 'approved' | 'rejected'): Promise<RoleRequest[]> {
    try {
      const collection = await this.getCollection();
      const requests = await collection.find({ status }).sort({ requestDate: -1 }).toArray();
      
      return requests.map(request => ({
        ...request,
        _id: undefined,
        id: request._id.toString()
      })) as RoleRequest[];
    } catch (error) {
      console.error('Error getting role requests by status:', error);
      throw new Error('Failed to get role requests');
    }
  }

  // Get role requests by user address
  async getRequestsByUser(address: string): Promise<RoleRequest[]> {
    try {
      const collection = await this.getCollection();
      const requests = await collection.find({ userAddress: address.toLowerCase() }).sort({ requestDate: -1 }).toArray();
      
      return requests.map(request => ({
        ...request,
        _id: undefined,
        id: request._id.toString()
      })) as RoleRequest[];
    } catch (error) {
      console.error('Error getting role requests by user:', error);
      throw new Error('Failed to get role requests');
    }
  }

  // Update role request status
  async updateRequestStatus(
    id: string, 
    status: 'approved' | 'rejected', 
    transactionHash?: string
  ): Promise<RoleRequest> {
    try {
      const collection = await this.getCollection();
      
      const updateData: any = {
        status,
        processedDate: new Date()
      };
      
      if (transactionHash) {
        updateData.transactionHash = transactionHash;
      }
      
      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
      
      if (result.matchedCount === 0) {
        throw new Error('Role request not found');
      }
      
      // Revalidate cache
      revalidateTag('role-requests');
      
      // Return the updated request
      const updatedRequest = await collection.findOne({ _id: new ObjectId(id) });
      return {
        ...updatedRequest,
        _id: undefined,
        id: updatedRequest?._id.toString()
      } as RoleRequest;
    } catch (error) {
      console.error('Error updating role request status:', error);
      throw new Error('Failed to update role request');
    }
  }

  // Delete a role request
  async deleteRequest(id: string): Promise<boolean> {
    try {
      const collection = await this.getCollection();
      
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      
      if (result.deletedCount === 0) {
        return false;
      }
      
      // Revalidate cache
      revalidateTag('role-requests');
      
      return true;
    } catch (error) {
      console.error('Error deleting role request:', error);
      throw new Error('Failed to delete role request');
    }
  }
}

// Export the service instance
export const roleRequestService = RoleRequestService.getInstance();
