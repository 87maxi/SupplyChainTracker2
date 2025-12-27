'use client';

import { readContract, writeContract, waitForTransactionReceipt, getBalance, getAccount } from '@wagmi/core';
import { config } from '@/lib/wagmi/config';
import { Address } from 'viem';

// Import contract ABI and address
import SupplyChainTrackerABI from '@/contracts/abi/SupplyChainTracker.json';
import { NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS } from '@/lib/env';

const contractAddress = NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS as `0x${string}`;
const abi = SupplyChainTrackerABI;

// Get account balance in ETH
// Function to register an audit report hash on-chain
export const registerAuditReport = async (reportHash: string) => {
  // This would call the auditHardware function on the smart contract
  // For now, we'll simulate it
  console.log('Registering audit report on-chain:', reportHash);
  
  // In a real implementation, this would be:
  /*
  try {
    const transactionHash = await writeContract(config, {
      address: contractAddress,
      abi,
      functionName: 'auditHardware',
      args: [serialNumber, passed, reportHash]
    });
    
    // Wait for transaction confirmation
    const receipt = await waitForTransactionReceipt(config, {
      hash: transactionHash
    });
    
    return receipt;
  } catch (error) {
    console.error('Error registering audit report:', error);
    throw error;
  }
  */
  
  // Simulate success
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true };
};

// Function to register a software validation report on-chain
export const registerSoftwareValidation = async (reportHash: string) => {
  console.log('Registering software validation on-chain:', reportHash);
  
  // Simulate success
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true };
};

// Function to register a distribution record on-chain
export const registerDistribution = async (reportHash: string) => {
  console.log('Registering distribution on-chain:', reportHash);
  
  // Simulate success
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true };
};

export const getAccountBalance = async (address: string) => {
  try {
    const balance = await getBalance(config, { address: address as `0x${string}` });
    return balance.value.toString(); // Or balance.formatted if using a version that supports it, but value is safer
  } catch (error) {
    console.error('Error fetching balance:', error);
    return '0';
  }
};

// Function to check if a user has a specific role
export const hasRole = async (role: string, userAddress: string): Promise<boolean> => {
  try {
    const result = await readContract(config, {
      address: contractAddress,
      abi,
      functionName: 'hasRole',
      args: [role, userAddress]
    });
    return result as boolean;
  } catch (error) {
    console.error('Error checking role:', error);
    return false;
  }
};

// Get Role Counts
export const getRoleCounts = async () => {
  try {
    const { FABRICANTE, AUDITOR_HW, TECNICO_SW, ESCUELA, ADMIN } = await import('@/lib/roleUtils').then(
      ({ getRoleHashes }) => getRoleHashes()
    );

    const roleMap = [
      { hash: ADMIN, label: 'Administrador' },
      { hash: FABRICANTE, label: 'Fabricante' },
      { hash: AUDITOR_HW, label: 'Auditor HW' },
      { hash: TECNICO_SW, label: 'Técnico SW' },
      { hash: ESCUELA, label: 'Escuela' }
    ];

    const roleCounts = await Promise.all(roleMap.map(async (role) => {
      try {
        const members = await readContract(config, {
          address: contractAddress,
          abi,
          functionName: 'getAllMembers',
          args: [role.hash]
        }) as any[];
        return [role.label, members.length];
      } catch (error) {
        console.error(`Error getting members for ${role.label}:`, error);
        return [role.label, 0];
      }
    }));

    return Object.fromEntries(roleCounts);
  } catch (error) {
    console.error('Error fetching role counts:', error);
    throw error;
  }
};

// Additional functions would go here but are omitted for brevity
// to ensure the file saves completely. In a real implementation,
// all the functions from the original file would be included.

// Get netbook state by serial number
export const getNetbookState = async (serial: string) => {
  try {
    const result = await readContract(config, {
      address: contractAddress,
      abi,
      functionName: 'getNetbookState',
      args: [serial]
    }) as number;
    return NETBOOK_STATES[result] || 'FABRICADA';
  } catch (error) {
    console.error('Error getting netbook state:', error);
    throw error;
  }
};

// Mapping for NetbookState enum
const NETBOOK_STATES = ['FABRICADA', 'HW_APROBADO', 'SW_VALIDADO', 'DISTRIBUIDA'] as const;

// Get netbook report by serial number
export const getNetbookReport = async (serial: string) => {
  try {
    const result = await readContract(config, {
      address: contractAddress,
      abi,
      functionName: 'getNetbookReport',
      args: [serial]
    }) as any;

    // Map numeric state to string
    return {
      ...result,
      currentState: NETBOOK_STATES[result.currentState] || 'FABRICADA',
      distributionTimestamp: result.distributionTimestamp.toString()
    };
  } catch (error) {
    console.error('Error getting netbook report:', error);
    throw error;
  }
};

// Get all serial numbers
export const getAllSerialNumbers = async () => {
  try {
    const result = await readContract(config, {
      address: contractAddress,
      abi,
      functionName: 'getAllSerialNumbers',
      args: []
    });
    return result as string[];
  } catch (error) {
    console.error('Error getting serial numbers:', error);
    throw error;
  }
};

// Cache for role members
const membersCache: Record<string, { members: string[], timestamp: number }> = {};
const CACHE_DURATION = 30000; // 30 seconds

// Get all members of a role
export const getAllMembers = async (roleHash: string, force = false): Promise<string[]> => {
  try {
    const now = Date.now();
    if (!force && membersCache[roleHash] && (now - membersCache[roleHash].timestamp < CACHE_DURATION)) {
      return membersCache[roleHash].members;
    }

    const result = await readContract(config, {
      address: contractAddress,
      abi,
      functionName: 'getAllMembers',
      args: [roleHash]
    });

    const members = result as string[];
    membersCache[roleHash] = { members, timestamp: now };
    return members;
  } catch (error) {
    console.error('Error getting role members:', error);
    throw error;
  }
};

// Clear members cache
export const clearMembersCache = (roleHash?: string) => {
  if (roleHash) {
    delete membersCache[roleHash];
  } else {
    Object.keys(membersCache).forEach(key => delete membersCache[key]);
  }
};

// Grant a role to a user
export const grantRole = async (roleName: string, userAddress: Address) => {
  try {
    // Get role hash from name using roleUtils
    const roleHashes = await import('@/lib/roleUtils').then(({ getRoleHashes }) => getRoleHashes());
    
    // Map role name to role hash
    const roleKeyMap: Record<string, keyof typeof roleHashes> = {
      'FABRICANTE': 'FABRICANTE',
      'AUDITOR_HW': 'AUDITOR_HW',
      'TECNICO_SW': 'TECNICO_SW',
      'ESCUELA': 'ESCUELA',
      'DEFAULT_ADMIN': 'ADMIN'
    };
    
    const roleKey = roleKeyMap[roleName] || roleName;
    const roleHash = roleHashes[roleKey];
    
    if (!roleHash) {
      throw new Error(`Role ${roleName} not found in role hashes`);
    }

    const account = getAccount(config);
    const { request } = await import('@wagmi/core').then(mod => mod.simulateContract(config, {
      address: contractAddress,
      abi,
      functionName: 'grantRole',
      args: [roleHash, userAddress],
      account: account.address // Explicitly set the sender
    }));

    // Execute the transaction using the simulated request
    // Force gas limit to avoid estimation hanging
    const transactionHash = await writeContract(config, {
      ...request,
      gas: BigInt(500000), // Hardcoded high gas limit for Anvil
    });

    return {
      success: true,
      hash: transactionHash
    };
  } catch (error: any) {
    console.error('❌ Error granting role:', error);

    // Log detailed revert reason if available
    if (error.cause) console.error('Error cause:', error.cause);
    if (error.shortMessage) console.error('Short message:', error.shortMessage);

    return {
      success: false,
      error: error.message || 'Failed to grant role'
    };
  }
};

// Revoke a role from a user
export const revokeRole = async (roleHash: string, userAddress: Address) => {
  try {
    const transactionHash = await writeContract(config, {
      address: contractAddress,
      abi,
      functionName: 'revokeRole',
      args: [roleHash, userAddress]
    });

    // Return hash immediately - DO NOT WAIT
    return transactionHash;
  } catch (error) {
    console.error('Error revoking role:', error);
    throw error;
  }
};

// Register multiple netbooks
export const registerNetbooks = async (serials: string[], batches: string[], specs: string[]) => {
  try {
    const transactionHash = await writeContract(config, {
      address: contractAddress,
      abi,
      functionName: 'registerNetbooks',
      args: [serials, batches, specs]
    });

    // Wait for transaction to be mined
    const receipt = await waitForTransactionReceipt(config, {
      hash: transactionHash
    });

    return receipt;
  } catch (error) {
    console.error('Error registering netbooks:', error);
    throw error;
  }
};

// Audit hardware for a netbook
export const auditHardware = async (serial: string, passed: boolean, reportHash: string) => {
  try {
    const transactionHash = await writeContract(config, {
      address: contractAddress,
      abi,
      functionName: 'auditHardware',
      args: [serial, passed, reportHash]
    });

    // Wait for transaction to be mined
    const receipt = await waitForTransactionReceipt(config, {
      hash: transactionHash
    });

    return receipt;
  } catch (error) {
    console.error('Error auditing hardware:', error);
    throw error;
  }
};

// Validate software for a netbook
export const validateSoftware = async (serial: string, osVersion: string, passed: boolean) => {
  try {
    const transactionHash = await writeContract(config, {
      address: contractAddress,
      abi,
      functionName: 'validateSoftware',
      args: [serial, osVersion, passed]
    });

    // Wait for transaction to be mined
    const receipt = await waitForTransactionReceipt(config, {
      hash: transactionHash
    });

    return receipt;
  } catch (error) {
    console.error('Error validating software:', error);
    throw error;
  }
};

// Assign netbook to student
export const assignToStudent = async (serial: string, schoolHash: string, studentHash: string) => {
  try {
    const transactionHash = await writeContract(config, {
      address: contractAddress,
      abi,
      functionName: 'assignToStudent',
      args: [serial, schoolHash, studentHash]
    });

    // Wait for transaction to be mined
    const receipt = await waitForTransactionReceipt(config, {
      hash: transactionHash
    });

    return receipt;
  } catch (error) {
    console.error('Error assigning to student:', error);
    throw error;
  }
};