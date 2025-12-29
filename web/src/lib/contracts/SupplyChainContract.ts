'use server';

import { config } from '@/lib/wagmi/config';
import { readContract, writeContract } from '@wagmi/core';
import { formatEther } from 'viem';
import { RoleMap } from '@/lib/roleUtils';

// Importar el ABI y la dirección del contrato
import SupplyChainTrackerABI from '@/contracts/abi/SupplyChainTracker.json';
import { NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS } from '@/lib/env';

const contractAddress = NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS as `0x${string}`;
const abi = SupplyChainTrackerABI;

// Función para obtener todos los números de serie
export async function getAllSerialNumbers(): Promise<string[]> {
  try {
    const result = await readContract(config, {
      address: contractAddress,
      abi,
      functionName: 'getAllSerialNumbers',
      args: []
    });
    return result as string[];
  } catch (error) {
    console.error('Error al obtener números de serie:', error);
    throw error;
  }
}

// Función para obtener el estado de una netbook
export async function getNetbookState(serial: string): Promise<number> {
  try {
    const result = await readContract(config, {
      address: contractAddress,
      abi,
      functionName: 'getNetbookState',
      args: [serial]
    });
    return result as number;
  } catch (error) {
    console.error('Error al obtener estado de netbook:', error);
    throw error;
  }
}

// Función para obtener el reporte de una netbook
export async function getNetbookReport(serial: string): Promise<any> {
  try {
    const result = await readContract(config, {
      address: contractAddress,
      abi,
      functionName: 'getNetbookReport',
      args: [serial]
    });
    return result;
  } catch (error) {
    console.error('Error al obtener reporte de netbook:', error);
    throw error;
  }
}

// Función para registrar netbooks
export async function registerNetbooks(
  serials: string[], 
  batches: string[], 
  specs: string[]
): Promise<string> {
  try {
    const result = await writeContract(config, {
      address: contractAddress,
      abi,
      functionName: 'registerNetbooks',
      args: [serials, batches, specs]
    });
    
    // Simular transacción exitosa
    return result as `0x${string}`;
  } catch (error) {
    console.error('Error al registrar netbooks:', error);
    throw error;
  }
}

// Función para auditar hardware
export async function auditHardware(
  serial: string, 
  passed: boolean, 
  reportHash: string
): Promise<string> {
  try {
    const result = await writeContract(config, {
      address: contractAddress,
      abi,
      functionName: 'auditHardware',
      args: [serial, passed, reportHash as `0x${string}`]
    });
    
    // Simular transacción exitosa
    return result as `0x${string}`;
  } catch (error) {
    console.error('Error al auditar hardware:', error);
    throw error;
  }
}

// Función para validar software
export async function validateSoftware(
  serial: string, 
  osVersion: string, 
  passed: boolean
): Promise<string> {
  try {
    const result = await writeContract(config, {
      address: contractAddress,
      abi,
      functionName: 'validateSoftware',
      args: [serial, osVersion, passed]
    });
    
    // Simular transacción exitosa
    return result as `0x${string}`;
  } catch (error) {
    console.error('Error al validar software:', error);
    throw error;
  }
}

// Función para asignar a estudiante
export async function assignToStudent(
  serial: string, 
  schoolHash: string, 
  studentHash: string
): Promise<string> {
  try {
    const result = await writeContract(config, {
      address: contractAddress,
      abi,
      functionName: 'assignToStudent',
      args: [serial, schoolHash as `0x${string}`, studentHash as `0x${string}`]
    });
    
    // Simular transacción exitosa
    return result as `0x${string}`;
  } catch (error) {
    console.error('Error al asignar a estudiante:', error);
    throw error;
  }
}

// Función para obtener miembros de un rol
export async function getAllMembers(roleHash: string): Promise<string[]> {
  try {
    const result = await readContract(config, {
      address: contractAddress,
      abi,
      functionName: 'getAllMembers',
      args: [roleHash]
    });
    return result as string[];
  } catch (error) {
    console.error('Error al obtener miembros del rol:', error);
    throw error;
  }
}

// Función para obtener conteo de miembros de un rol
export async function getRoleMemberCount(roleHash: string): Promise<number> {
  try {
    const result = await readContract(config, {
      address: contractAddress,
      abi,
      functionName: 'getRoleMemberCount',
      args: [roleHash]
    });
    return result as number;
  } catch (error) {
    console.error('Error al obtener conteo de miembros del rol:', error);
    throw error;
  }
}

// Función para verificar si una cuenta tiene un rol
export async function hasRole(roleHash: string, address: string): Promise<boolean> {
  try {
    const result = await readContract(config, {
      address: contractAddress,
      abi,
      functionName: 'hasRole',
      args: [roleHash, address]
    });
    return result as boolean;
  } catch (error) {
    console.error('Error al verificar rol:', error);
    return false;
  }
}

// Función para obtener el rol por nombre
export async function getRoleByName(roleType: string): Promise<string> {
  try {
    // Map roleType to the expected values in the contract
    // Mapeo de nombres de roles con sufijo _ROLE a los nombres que acepta el contrato
    const roleMap: Record<string, string> = {
      'FABRICANTE_ROLE': 'FABRICANTE',
      'AUDITOR_HW_ROLE': 'AUDITOR_HW',
      'TECNICO_SW_ROLE': 'TECNICO_SW',
      'ESCUELA_ROLE': 'ESCUELA',
      'DEFAULT_ADMIN_ROLE': 'ADMIN', // El contrato mapea ADMIN -> DEFAULT_ADMIN_ROLE
      'ADMIN': 'ADMIN' // Caso directo para ADMIN
    };
    
    // Si el roleType tiene sufijo _ROLE, intentamos mapearlo
    const mappedRoleType = roleMap[roleType] || roleType;
    
    const result = await readContract(config, {
      address: contractAddress,
      abi,
      functionName: 'getRoleByName',
      args: [mappedRoleType]
    });
    return result as string;
  } catch (error) {
    console.error('Error al obtener rol por nombre:', error);
    // For ADMIN role, return the known hash
    if (roleType === 'ADMIN') {
      return '0x0000000000000000000000000000000000000000000000000000000000000000';
    }
    throw error;
  }
}

// Funciones para gestión de roles
// Solicita el rol usando el nombre base del rol (sin sufijo _ROLE) en lugar del hash.
export async function grantRole(roleName: string, account: string): Promise<string> {
  try {
    // Asegurarnos de que el nombre del rol esté en mayúsculas
    // Keep the role name as-is since contract expects exact case matching
    // The contract uses keccak256 encoding which is case-sensitive
    const contractRoleName = roleName.trim();
    
    // Validar que no se esté pasando un hash como roleName
    if (contractRoleName.startsWith('0x')) {
      throw new Error('grantRole espera un nombre de rol, no un hash');
    }

    const result = await writeContract(config, {
      address: contractAddress,
      abi,
      functionName: 'grantRole',
      args: [account, contractRoleName]
    });
    
    // Simular transacción exitosa
    return result as `0x${string}`;
  } catch (error) {
    console.error('Error al otorgar rol:', error);
    throw error;
  }
}

export async function revokeRole(roleHash: string, account: string): Promise<string> {
  try {
    const result = await writeContract(config, {
      address: contractAddress,
      abi,
      functionName: 'revokeRole',
      args: [account, roleHash]
    });
    
    // Simular transacción exitosa
    return result as `0x${string}`;
  } catch (error) {
    console.error('Error al revocar rol:', error);
    throw error;
  }
}

// Función para obtener netbooks por estado
export async function getNetbooksByState(state: number): Promise<string[]> {
  try {
    const result = await readContract(config, {
      address: contractAddress,
      abi,
      functionName: 'getNetbooksByState',
      args: [state]
    });
    return result as string[];
  } catch (error) {
    console.error('Error al obtener netbooks por estado:', error);
    throw error;
  }
}
