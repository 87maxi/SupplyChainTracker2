// Client-side wrapper for MongoDB operations
// This prevents MongoDB from being imported on the client side

import { Address } from 'viem';

export interface RoleRequest {
  id: string;
  address: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  timestamp: Date;
  updatedAt?: Date;
  signature?: string;
  transactionHash?: string;
  _id?: string;
}

export class MongoDBClient {
  static async submitRoleRequest(address: Address, role: string, signature?: string): Promise<RoleRequest> {
    const response = await fetch('/api/role-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address, role, signature }),
    });

    if (!response.ok) {
      throw new Error('Failed to submit role request');
    }

    const data = await response.json();
    return data.data;
  }

  static async getPendingRoleRequests(): Promise<RoleRequest[]> {
    const response = await fetch('/api/role-requests?status=pending');
    
    if (!response.ok) {
      throw new Error('Failed to fetch pending requests');
    }

    const data = await response.json();
    return data.data;
  }

  static async getAllRoleRequests(): Promise<RoleRequest[]> {
    const response = await fetch('/api/role-requests');
    
    if (!response.ok) {
      throw new Error('Failed to fetch all requests');
    }

    const data = await response.json();
    return data.data;
  }

  static async updateRoleRequestStatus(id: string, status: 'approved' | 'rejected'): Promise<void> {
    const response = await fetch('/api/role-requests', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, status }),
    });

    if (!response.ok) {
      throw new Error('Failed to update request status');
    }
  }

  static async deleteRoleRequest(id: string): Promise<void> {
    const response = await fetch(`/api/role-requests?id=${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete request');
    }
  }

  static async getRoleRequestsByUser(address: Address): Promise<RoleRequest[]> {
    const response = await fetch(`/api/role-requests?address=${address}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch user requests');
    }

    const data = await response.json();
    return data.data;
  }
}