// This file has been removed as part of the transition to a fully blockchain-native architecture.
// All role management and data persistence is now handled on-chain via the SupplyChainTracker contract.
// No server-side persistence or MongoDB integration is used in this application.

export class MongoDBClient {
  // All methods have been removed to enforce on-chain architecture
  // This class is deprecated and will be removed in a future commit.
  
  static async submitRoleRequest(address: string, role: string, signature?: string): Promise<any> {
    throw new Error('MongoDB client has been removed. All role requests must be handled on-chain via the SupplyChainTracker contract.');
  }

  static async getPendingRoleRequests(): Promise<any[]> {
    throw new Error('MongoDB client has been removed. All role requests must be handled on-chain via the SupplyChainTracker contract.');
  }

  static async getAllRoleRequests(): Promise<any[]> {
    throw new Error('MongoDB client has been removed. All role requests must be handled on-chain via the SupplyChainTracker contract.');
  }

  static async updateRoleRequestStatus(id: string, status: string): Promise<void> {
    throw new Error('MongoDB client has been removed. All role requests must be handled on-chain via the SupplyChainTracker contract.');
  }

  static async deleteRoleRequest(id: string): Promise<void> {
    throw new Error('MongoDB client has been removed. All role requests must be handled on-chain via the SupplyChainTracker contract.');
  }

  static async getRoleRequestsByUser(address: string): Promise<any[]> {
    throw new Error('MongoDB client has been removed. All role requests must be handled on-chain via the SupplyChainTracker contract.');
  }
}