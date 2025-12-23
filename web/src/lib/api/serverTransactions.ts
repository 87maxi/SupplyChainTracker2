'use server';

import { revalidateTag } from 'next/cache';
import { SupplyChainContract } from '@/lib/contracts/SupplyChainContract';
import { clearCache } from './serverRpc';

/**
 * Server-side transaction functions for interacting with the SupplyChain smart contract.
 * These functions handle write operations and require proper error handling.
 */

/**
 * Grant a role to an address
 */
export async function grantRole(roleHash: string, address: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`Granting role ${roleHash} to address ${address}`);
    
    const transaction = await SupplyChainContract.grantRole(roleHash, address);
    
    // Wait for transaction confirmation
    const receipt = await transaction.wait();
    
    if (receipt.status === 1) {
      // Clear relevant cache entries
      clearCache();
      revalidateTag('role-members', 'layout');
      revalidateTag('role-requests', 'layout');
      
      console.log(`Role granted successfully in block ${receipt.blockNumber}`);
      return { success: true };
    } else {
      throw new Error('Transaction failed');
    }
    
  } catch (error) {
    console.error('Error granting role:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Handle specific error cases
    if (errorMessage.includes('AccessControl:')) {
      return { 
        success: false, 
        error: 'No tiene permisos para otorgar este rol' 
      };
    }
    
    if (errorMessage.includes('already has role')) {
      return { 
        success: false, 
        error: 'La dirección ya tiene este rol' 
      };
    }
    
    return { 
      success: false, 
      error: `Error al otorgar el rol: ${errorMessage}` 
    };
  }
}

/**
 * Revoke a role from an address
 */
export async function revokeRole(roleHash: string, address: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`Revoking role ${roleHash} from address ${address}`);
    
    const transaction = await SupplyChainContract.revokeRole(roleHash, address);
    
    // Wait for transaction confirmation
    const receipt = await transaction.wait();
    
    if (receipt.status === 1) {
      // Clear relevant cache entries
      clearCache();
      revalidateTag('role-members', 'layout');
      revalidateTag('role-requests', 'layout');
      
      console.log(`Role revoked successfully in block ${receipt.blockNumber}`);
      return { success: true };
    } else {
      throw new Error('Transaction failed');
    }
    
  } catch (error) {
    console.error('Error revoking role:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Handle specific error cases
    if (errorMessage.includes('AccessControl:')) {
      return { 
        success: false, 
        error: 'No tiene permisos para revocar este rol' 
      };
    }
    
    return { 
      success: false, 
      error: `Error al revocar el rol: ${errorMessage}` 
    };
  }
}

/**
 * Register multiple netbooks (FABRICANTE_ROLE required)
 */
export async function registerNetbooks(
  serials: string[],
  batches: string[], 
  specs: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`Registering ${serials.length} netbooks`);
    
    const transaction = await SupplyChainContract.registerNetbooks(serials, batches, specs);
    
    // Wait for transaction confirmation
    const receipt = await transaction.wait();
    
    if (receipt.status === 1) {
      // Clear relevant cache entries
      clearCache();
      revalidateTag('serial-numbers', 'layout');
      revalidateTag('netbook-state', 'layout');
      
      console.log(`Netbooks registered successfully in block ${receipt.blockNumber}`);
      return { success: true };
    } else {
      throw new Error('Transaction failed');
    }
    
  } catch (error) {
    console.error('Error registering netbooks:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('Acceso denegado')) {
      return { 
        success: false, 
        error: 'Se requiere rol de FABRICANTE para registrar netbooks' 
      };
    }
    
    return { 
      success: false, 
      error: `Error al registrar netbooks: ${errorMessage}` 
    };
  }
}

/**
 * Audit hardware (AUDITOR_HW_ROLE required)
 */
export async function auditHardware(
  serial: string,
  passed: boolean,
  reportHash: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`Auditing hardware for serial ${serial}, passed: ${passed}`);
    
    const transaction = await SupplyChainContract.auditHardware(serial, passed, reportHash);
    
    // Wait for transaction confirmation
    const receipt = await transaction.wait();
    
    if (receipt.status === 1) {
      // Clear relevant cache entries
      clearCache([`netbook-report:${serial}`, `netbook-state:${serial}`]);
      revalidateTag('netbook-state', 'layout');
      
      console.log(`Hardware audited successfully in block ${receipt.blockNumber}`);
      return { success: true };
    } else {
      throw new Error('Transaction failed');
    }
    
  } catch (error) {
    console.error('Error auditing hardware:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('Acceso denegado')) {
      return { 
        success: false, 
        error: 'Se requiere rol de AUDITOR_HW para auditar hardware' 
      };
    }
    
    return { 
      success: false, 
      error: `Error al auditar hardware: ${errorMessage}` 
    };
  }
}

/**
 * Validate software (TECNICO_SW_ROLE required)
 */
export async function validateSoftware(
  serial: string,
  osVersion: string,
  passed: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`Validating software for serial ${serial}, OS: ${osVersion}`);
    
    const transaction = await SupplyChainContract.validateSoftware(serial, osVersion, passed);
    
    // Wait for transaction confirmation
    const receipt = await transaction.wait();
    
    if (receipt.status === 1) {
      // Clear relevant cache entries
      clearCache([`netbook-report:${serial}`, `netbook-state:${serial}`]);
      revalidateTag('netbook-state', 'layout');
      
      console.log(`Software validated successfully in block ${receipt.blockNumber}`);
      return { success: true };
    } else {
      throw new Error('Transaction failed');
    }
    
  } catch (error) {
    console.error('Error validating software:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('Acceso denegado')) {
      return { 
        success: false, 
        error: 'Se requiere rol de TECNICO_SW para validar software' 
      };
    }
    
    return { 
      success: false, 
      error: `Error al validar software: ${errorMessage}` 
    };
  }
}

/**
 * Assign to student (ESCUELA_ROLE required)
 */
export async function assignToStudent(
  serial: string,
  schoolHash: string,
  studentHash: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`Assigning netbook ${serial} to student`);
    
    const transaction = await SupplyChainContract.assignToStudent(serial, schoolHash, studentHash);
    
    // Wait for transaction confirmation
    const receipt = await transaction.wait();
    
    if (receipt.status === 1) {
      // Clear relevant cache entries
      clearCache([`netbook-report:${serial}`, `netbook-state:${serial}`]);
      revalidateTag('netbook-state', 'layout');
      
      console.log(`Netbook assigned successfully in block ${receipt.blockNumber}`);
      return { success: true };
    } else {
      throw new Error('Transaction failed');
    }
    
  } catch (error) {
    console.error('Error assigning to student:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('Acceso denegado')) {
      return { 
        success: false, 
        error: 'Se requiere rol de ESCUELA para asignar netbooks' 
      };
    }
    
    return { 
      success: false, 
      error: `Error al asignar netbook: ${errorMessage}` 
    };
  }
}