// web/src/services/RoleRequestService.ts
// Service implementation for role requests
// This file handles the complete flow of role requests from UI to blockchain
// Uses the SupplyChainService for direct contract interaction

import { SupplyChainService } from './SupplyChainService';
import { RoleService } from './contracts/role.service';
import { roleMapper } from '@/lib/roleMapping';

// Import the contract constants and ABI
import { ROLE_HASHES } from '@/lib/constants/roles';
import SupplyChainTrackerABI from '@/lib/contracts/abi/SupplyChainTracker.json';

// Import config and env variables
import { config } from '@/lib/wagmi/config';
import { NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS } from '@/lib/env';

// Mock data structure for role requests (would come from database in original implementation)
export interface RoleRequest {
  id: string;
  userAddress: string;
  role: string;
  signature: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  transactionHash?: string;
}

// Mock role requests for backward compatibility
// Use an in-memory store for requests
let roleRequests: RoleRequest[] = [];

// Create an instance of the RoleService
// We need to create it with the proper contract address and ABI
const roleService = new RoleService(
  NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS as `0x${string}`,
  SupplyChainTrackerABI,
  config
);

// Use the role mapper for consistent role name handling
// Use the singleton instance from roleMapping
const roleMapperInstance = roleMapper;

// Initialize with actual data from localStorage
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('role_requests');
  if (stored) {
    roleRequests = JSON.parse(stored);
  }
}

// Use the actual SupplyChainService for contract interactions
const supplyChainService = SupplyChainService.getInstance();

export const RoleRequestService = {
  /**
   * Create a new role request
   * @param request Role request details
   * @returns Promise that resolves when the request is created
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
    
    roleRequests.push(newRequest);
    localStorage.setItem('role_requests', JSON.stringify(roleRequests));
  },
  
  /**
   * Get all role requests
   * @returns All role requests
   */
  async getRoleRequests(): Promise<RoleRequest[]> {
    // Refresh from storage
    const stored = localStorage.getItem('role_requests');
    if (stored) {
      roleRequests = JSON.parse(stored);
    }
    return [...roleRequests];
  },
  
  /**
   * Update status of a role request
   * @param id Request ID
   * @param status New status
   * @returns Promise that resolves when the status is updated
   */
  async updateRoleRequestStatus(id: string, status: 'approved' | 'rejected'): Promise<void> {
    const request = roleRequests.find(r => r.id === id);
    if (!request) {
      throw new Error('Role request not found');
    }
    
    if (status === 'approved') {
      // Use the role service to grant the actual role
      try {
        // Use the role mapper to get role hash
        const roleHash = await roleMapperInstance.getRoleHash(request.role);
        
        // Grant role through the contract
        const result = await roleService.grantRole(roleHash as unknown as Role, request.userAddress as `0x${string}`);
        
        if (result.success && result.txHash) {
          // Update request with transaction hash
          request.transactionHash = result.txHash;
          
          console.log(`Rol ${request.role} otorgado exitosamente a ${request.userAddress}. Tx hash: ${result.txHash}`);
        } else {
          console.error('Error otorgando rol:', result.message || 'No se pudo otorgar el rol');
          return; // Don't update status if grant failed
        }
      } catch (error) {
        console.error('Error granting role:', error);
        console.error('Error otorgando rol:', error instanceof Error ? error.message : 'Error al otorgar el rol');
        return; // Don't update status if grant failed
      }
    }
    
    request.status = status;
    request.updatedAt = new Date().toISOString();
    
    localStorage.setItem('role_requests', JSON.stringify(roleRequests));
  },
  
  /**
   * Delete a role request
   * @param id Request ID to delete
   * @returns Promise that resolves when the request is deleted
   */
  async deleteRoleRequest(id: string): Promise<void> {
    roleRequests = roleRequests.filter(r => r.id !== id);
    localStorage.setItem('role_requests', JSON.stringify(roleRequests));
  }
};

// Export individual functions for backward compatibility
export const getRoleRequests = RoleRequestService.getRoleRequests;
export const updateRoleRequestStatus = RoleRequestService.updateRoleRequestStatus;
export const deleteRoleRequest = RoleRequestService.deleteRoleRequest;
