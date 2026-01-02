// web/src/services/RoleRequestService.ts
// Mock implementation of the old RoleRequestService API
// This file provides backward compatibility for components that still import from '@/services/RoleRequestService'
// All functionality is now handled by the smart contract and contract service

import { SupplyChainService } from './SupplyChainService';

// Mock data structure for role requests (would come from database in original implementation)
interface RoleRequest {
  id: string;
  userAddress: string;
  role: string;
  signature: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

// Mock role requests for backward compatibility
let mockRoleRequests: RoleRequest[] = [];

// Initialize with some mock data if needed
// This could be replaced with actual data from localStorage or API
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('mockRoleRequests');
  if (stored) {
    mockRoleRequests = JSON.parse(stored);
  } else {
    // Initialize with empty array
    mockRoleRequests = [];
    localStorage.setItem('mockRoleRequests', JSON.stringify(mockRoleRequests));
  }
}

// Use the actual SupplyChainService for contract interactions
const supplyChainService = SupplyChainService.getInstance();

export const RoleRequestService = {
  /**
   * Create a new role request
   * In the new system, this would be replaced by a direct contract call or form submission
   */
  async createRequest(request: {
    userAddress: string;
    role: string;
    signature: string;
  }): Promise<void> {
    const newRequest: RoleRequest = {
      id: Date.now().toString(),
      userAddress: request.userAddress,
      role: request.role,
      signature: request.signature,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    mockRoleRequests.push(newRequest);
    localStorage.setItem('mockRoleRequests', JSON.stringify(mockRoleRequests));
    
    // In a real implementation, we would integrate with the actual role request process
    // This might involve calling a smart contract function or API endpoint
  },
  
  /**
   * Get all role requests
   * In the new system, this could be replaced by a contract query or database call
   */
  async getRoleRequests(): Promise<RoleRequest[]> {
    // Refresh from storage
    const stored = localStorage.getItem('mockRoleRequests');
    if (stored) {
      mockRoleRequests = JSON.parse(stored);
    }
    return [...mockRoleRequests];
  },
  
  /**
   * Update status of a role request
   * In the new system, this would trigger a smart contract call to grant the role
   */
  async updateRoleRequestStatus(id: string, status: 'approved' | 'rejected'): Promise<void> {
    const request = mockRoleRequests.find(r => r.id === id);
    if (!request) {
      throw new Error('Role request not found');
    }
    
    request.status = status;
    
    // If approved, attempt to grant the role via contract
    if (status === 'approved') {
      // This would be replaced by actual contract interaction
      // await supplyChainService.grantRole(request.role, request.userAddress);
      console.log(`Role ${request.role} granted to ${request.userAddress}`);
    }
    
    localStorage.setItem('mockRoleRequests', JSON.stringify(mockRoleRequests));
  },
  
  /**
   * Delete a role request
   */
  async deleteRoleRequest(id: string): Promise<void> {
    mockRoleRequests = mockRoleRequests.filter(r => r.id !== id);
    localStorage.setItem('mockRoleRequests', JSON.stringify(mockRoleRequests));
  }
};

// Export individual functions for backward compatibility
export const getRoleRequests = RoleRequestService.getRoleRequests;
export const updateRoleRequestStatus = RoleRequestService.updateRoleRequestStatus;
export const deleteRoleRequest = RoleRequestService.deleteRoleRequest;
