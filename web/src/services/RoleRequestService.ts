// web/src/services/RoleRequestService.ts
// Service implementation for role requests
// This file handles the complete flow of role requests from UI to blockchain
// Uses the SupplyChainService for direct contract interaction

import { SupplyChainService } from './SupplyChainService';
import { RoleService } from './contracts/role.service';
import { roleMapper, RoleName } from '@/lib/roleMapping';
import { Role } from './contracts/role.service';

// Import the contract constants and ABI
import { ROLE_HASHES } from '@/lib/constants/roles';
import SupplyChainTrackerABI from '@/lib/contracts/abi/SupplyChainTracker.json';

// Import config and env variables
import { config } from '@/lib/wagmi/config';
import { NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS, validateAddress } from '@/lib/env';
import { useAccount } from 'wagmi';

/**
 * Helper function to get the currently connected account from the wallet
 * @returns The connected account address or null if not connected
 */
async function getConnectedAccount(): Promise<`0x${string}` | null> {
  if (typeof window === 'undefined' || !window.ethereum) {
    console.error('[RoleRequestService] No ethereum provider found');
    return null;
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    }) as string[];

    if (!accounts || accounts.length === 0) {
      console.error('[RoleRequestService] No accounts found');
      return null;
    }

    console.log('[RoleRequestService] Connected account:', accounts[0]);
    return accounts[0] as `0x${string}`;
  } catch (error) {
    console.error('[RoleRequestService] Error getting connected account:', error);
    return null;
  }
}

// Mock data structure for role requests (would come from database in original implementation)
export interface RoleRequest {
  id: string;
  userAddress: string;
  role: string;
  signature: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt?: string;  // Added to fix TypeScript error
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
  config,
  undefined  // La cuenta se proporcionará en tiempo de ejecución
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
  async updateRoleRequestStatus(id: string, status: 'approved' | 'rejected'): Promise<RoleRequest> {
    const request = roleRequests.find(r => r.id === id);
    if (!request) {
      throw new Error('Role request not found');
    }

    if (status === 'approved') {
      // Use the role service to grant the actual role
      try {
        // ✓ CORRECCIÓN: Obtener la cuenta del administrador conectado
        const adminAccount = await getConnectedAccount();

        if (!adminAccount) {
          throw new Error('No hay cuenta de administrador conectada. Por favor conecta tu wallet.');
        }

        console.log('[RoleRequestService] Granting role with admin account:', {
          adminAccount,
          targetUser: request.userAddress,
          requestedRole: request.role
        });

        if (!NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS) {
          throw new Error('La dirección del contrato no está configurada (NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS)');
        }

        // ✓ Crear RoleService con la cuenta del ADMIN, no del usuario
        const adminRoleService = new RoleService(
          NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS as `0x${string}`,
          SupplyChainTrackerABI,
          config,
          adminAccount as `0x${string}`  // ✓ Cuenta del admin que ejecuta la transacción
        );

        // Normalizar el nombre del rol
        const normalizedRoleName = roleMapperInstance.normalizeRoleName(request.role);
        console.log('[RoleRequestService] Normalized role name:', normalizedRoleName, 'from request role:', request.role);

        // Convertir a la clave del rol
        // Usar el tipo Role del servicio de roles que es compatible con ROLE_HASHES
        const roleKeyMap: Record<string, Role> = {
          'FABRICANTE_ROLE': 'FABRICANTE',
          'AUDITOR_HW_ROLE': 'AUDITOR_HW',
          'TECNICO_SW_ROLE': 'TECNICO_SW',
          'ESCUELA_ROLE': 'ESCUELA',
          'DEFAULT_ADMIN_ROLE': 'ADMIN'
        };

        // Get the role key that corresponds to the normalized role name
        const roleKey = roleKeyMap[normalizedRoleName];

        // If we found a valid role key, use it; otherwise use ADMIN as fallback
        const role: Role = roleKey || 'ADMIN';
        console.log('[RoleRequestService] Mapped role key:', role, 'for normalized name:', normalizedRoleName);

        // ✓ Otorgar rol al usuario solicitante usando el servicio del admin
        console.log('[RoleRequestService] Attempting to grant role:', {
          role,
          roleHash: ROLE_HASHES[role as keyof typeof ROLE_HASHES],
          targetUser: request.userAddress,
          executingAs: adminAccount
        });

        const result = await adminRoleService.grantRole(
          role,
          request.userAddress as `0x${string}`  // ✓ Usuario que recibe el rol
        );

        console.log('[RoleRequestService] Role grant result:', result);

        if (result.success && result.txHash) {
          // Update request with transaction hash
          request.transactionHash = result.txHash;

          console.log(`[RoleRequestService] ✓ Rol ${request.role} otorgado exitosamente a ${request.userAddress}. Tx hash: ${result.txHash}`);
        } else {
          const errorMsg = result.message || 'No se pudo otorgar el rol';
          console.error('[RoleRequestService] Error otorgando rol:', errorMsg);
          throw new Error(errorMsg);
        }
      } catch (error) {
        // Log the full error for debugging
        console.error('[RoleRequestService] CRITICAL ERROR during role grant:', error);

        const errorDetails = {
          message: error instanceof Error ? error.message : String(error),
          request,
          adminAccount: await getConnectedAccount().catch(() => 'error getting account'),
          contractAddress: NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS
        };

        console.error('[RoleRequestService] Error details:', errorDetails);

        // Re-lanzar el error para que el hook lo maneje
        throw error;
      }
    }

    request.status = status;
    request.updatedAt = new Date().toISOString();

    localStorage.setItem('role_requests', JSON.stringify(roleRequests));

    return request;
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
