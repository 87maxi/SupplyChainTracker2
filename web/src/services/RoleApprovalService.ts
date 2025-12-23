'use client';

import { writeContractWithQueue } from './TransactionManager';
import { config } from '@/lib/wagmi/config';
import SupplyChainTrackerABI from '@/contracts/abi/SupplyChainTracker.json';
import { NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS } from '@/lib/env';
import { ROLES } from '@/lib/constants';
import { hasRole as checkHasRole } from './SupplyChainService';

const contractAddress = NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS as `0x${string}`;
const abi = SupplyChainTrackerABI;

export class RoleApprovalService {
  /**
   * Grant a role to a user with comprehensive error handling and verification
   * @param role The role to grant (one of: admin, fabricante, auditor_hw, tecnico_sw, escuela)
   * @param targetAddress The address to grant the role to
   * @param adminAddress The admin address performing the grant
   * @returns Transaction receipt if successful
   */
  static async grantRole(role: string, targetAddress: string, adminAddress: `0x${string}`) {
    try {
      // Validate inputs
      if (!targetAddress || !adminAddress) {
        throw new Error("Direcciones inválidas");
      }

      // Map role name to role hash
      let roleHash: string;
      switch (role) {
        case 'admin':
          roleHash = ROLES.ADMIN.hash;
          break;
        case 'fabricante':
          roleHash = ROLES.FABRICANTE.hash;
          break;
        case 'auditor_hw':
          roleHash = ROLES.AUDITOR_HW.hash;
          break;
        case 'tecnico_sw':
          roleHash = ROLES.TECNICO_SW.hash;
          break;
        case 'escuela':
          roleHash = ROLES.ESCUELA.hash;
          break;
        default:
          throw new Error('Rol inválido: ' + role);
      }

      console.log('Granting role:', { role, roleHash, targetAddress, adminAddress });

      // Verify admin has the DEFAULT_ADMIN_ROLE before proceeding
      const isAdmin = await checkHasRole(ROLES.ADMIN.hash, adminAddress);
      if (!isAdmin) {
        throw new Error("No tienes permisos de administrador para realizar esta acción.");
      }

      // Execute the transaction with proper nonce management
      const receipt = await writeContractWithQueue({
        address: contractAddress,
        abi,
        functionName: 'grantRole',
        args: [roleHash, targetAddress],
        account: adminAddress
      });

      // Verify the role was actually granted on-chain
      const hasRoleResult = await checkHasRole(roleHash, targetAddress);
      if (!hasRoleResult) {
        throw new Error("La transacción se confirmó pero el rol no fue asignado. Por favor, inténtalo de nuevo.");
      }

      console.log('Role granted successfully:', receipt);
      return receipt;
    } catch (error: any) {
      console.error('Error in RoleApprovalService.grantRole:', error);
      
      // Provide more specific error messages
      let errorMessage = error.message || "No se pudo asignar el rol";
      
      if (error.message?.includes("AccessControlUnauthorizedAccount")) {
        errorMessage = "No tienes permisos de administrador para realizar esta acción.";
      } else if (error.message?.includes("user rejected")) {
        errorMessage = "Transacción rechazada por el usuario.";
      } else if (error.message?.includes("insufficient funds")) {
        errorMessage = "Fondos insuficientes para completar la transacción.";
      } else if (error.message?.includes("nonce too low")) {
        errorMessage = "Error de sincronización de transacción. Por favor, inténtalo de nuevo.";
      } else if (error.message?.includes("execution reverted")) {
        errorMessage = "Error en la ejecución del contrato. Verifica que los datos sean correctos.";
      }

      throw new Error(errorMessage);
    }
  }

  /**
   * Revoke a role from a user
   * @param role The role to revoke
   * @param targetAddress The address to revoke the role from
   * @param adminAddress The admin address performing the revocation
   * @returns Transaction receipt if successful
   */
  static async revokeRole(role: string, targetAddress: string, adminAddress: `0x${string}`) {
    try {
      // Validate inputs
      if (!targetAddress || !adminAddress) {
        throw new Error("Direcciones inválidas");
      }

      // Map role name to role hash
      let roleHash: string;
      switch (role) {
        case 'admin':
          roleHash = ROLES.ADMIN.hash;
          break;
        case 'fabricante':
          roleHash = ROLES.FABRICANTE.hash;
          break;
        case 'auditor_hw':
          roleHash = ROLES.AUDITOR_HW.hash;
          break;
        case 'tecnico_sw':
          roleHash = ROLES.TECNICO_SW.hash;
          break;
        case 'escuela':
          roleHash = ROLES.ESCUELA.hash;
          break;
        default:
          throw new Error('Rol inválido: ' + role);
      }

      console.log('Revoking role:', { role, roleHash, targetAddress, adminAddress });

      // Verify admin has the DEFAULT_ADMIN_ROLE before proceeding
      const isAdmin = await checkHasRole(ROLES.ADMIN.hash, adminAddress);
      if (!isAdmin) {
        throw new Error("No tienes permisos de administrador para realizar esta acción.");
      }

      // Execute the transaction with proper nonce management
      const receipt = await writeContractWithQueue({
        address: contractAddress,
        abi,
        functionName: 'revokeRole',
        args: [roleHash, targetAddress],
        account: adminAddress
      });

      console.log('Role revoked successfully:', receipt);
      return receipt;
    } catch (error: any) {
      console.error('Error in RoleApprovalService.revokeRole:', error);
      
      let errorMessage = error.message || "No se pudo revocar el rol";
      
      if (error.message?.includes("AccessControlUnauthorizedAccount")) {
        errorMessage = "No tienes permisos de administrador para realizar esta acción.";
      } else if (error.message?.includes("user rejected")) {
        errorMessage = "Transacción rechazada por el usuario.";
      } else if (error.message?.includes("insufficient funds")) {
        errorMessage = "Fondos insuficientes para completar la transacción.";
      } else if (error.message?.includes("nonce too low")) {
        errorMessage = "Error de sincronización de transacción. Por favor, inténtalo de nuevo.";
      } else if (error.message?.includes("execution reverted")) {
        errorMessage = "Error en la ejecución del contrato. Verifica que los datos sean correctos.";
      }

      throw new Error(errorMessage);
    }
  }
}