'use client';

import { ROLES } from '@/lib/constants';
import { readContract, writeContract, waitForTransaction, getBalance } from '@wagmi/core';
import { config } from '@/lib/wagmi/config';
import { parseUnits } from 'viem';
import { formatUnits } from 'ethers';

// Import contract ABI and address
import SupplyChainTrackerABI from '@/contracts/abi/SupplyChainTracker.json';
import { NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS } from '@/lib/env';

const contractAddress = NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS as `0x${string}`;
const abi = SupplyChainTrackerABI;

// Get account balance in ETH
export const getAccountBalance = async (address: string) => {
  try {
    const balance = await getBalance(config, {
      address: address as `0x${string}`
    });
    return balance.formatted;
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

// Fetch total supply of netbooks
export const getTotalNetbooks = async () => {
  try {
    const result = await readContract(config, {
      address: contractAddress,
      abi,
      functionName: 'totalNetbooks'
    });
    return Number(result);
  } catch (error) {
    console.error('Error fetching total netbooks:', error);
    throw error;
  }
};

// Fetch netbook by DNS
export const getNetbookByDns = async (dns: string) => {
  try {
    const result = await readContract(config, {
      address: contractAddress,
      abi,
      functionName: 'netbooks',
      args: [dns]
    }) as any[];

    return {
      dns: result[0],
      fabricante: result[1],
      estado: Number(result[2]),
      auditorHw: result[3],
      tecnicoSw: result[4],
      escuela: result[5],
      owner: result[6],
      assignedTo: result[7]
    };
  } catch (error) {
    console.error('Error fetching netbook:', error);
    throw error;
  }
};

// Get count of all states
export const getStateCounts = async () => {
  try {
    const counts = await Promise.all([
      readContract(config, {
        address: contractAddress,
        abi,
        functionName: 'getNetbooksByState',
        args: [0] // Disponible
      }).then(results => (results as any[]).length),

      readContract(config, {
        address: contractAddress,
        abi,
        functionName: 'getNetbooksByState',
        args: [1] // En reparación HW
      }).then(results => (results as any[]).length),

      readContract(config, {
        address: contractAddress,
        abi,
        functionName: 'getNetbooksByState',
        args: [2] // En configuración SW
      }).then(results => (results as any[]).length),

      readContract(config, {
        address: contractAddress,
        abi,
        functionName: 'getNetbooksByState',
        args: [3] // Asignado
      }).then(results => (results as any[]).length),

      readContract(config, {
        address: contractAddress,
        abi,
        functionName: 'getNetbooksByState',
        args: [4] // Cambio de estado
      }).then(results => (results as any[]).length)
    ]);

    return {
      disponible: counts[0],
      enReparacionHw: counts[1],
      enConfiguracionSw: counts[2],
      asignado: counts[3],
      cambioEstado: counts[4]
    };
  } catch (error) {
    console.error('Error fetching state counts:', error);
    throw error;
  }
};

// Get role counts using getAllMembers
export const getRoleCounts = async () => {
  try {
    const roleCounts = await Promise.all(Object.values(ROLES).map(async (role) => {
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

// Register new netbook
export const registerNetbook = async (dns: string) => {
  try {
    const hash = await writeContract(config, {
      address: contractAddress,
      abi,
      functionName: 'registerNetbook',
      args: [dns]
    });

    // Wait for transaction to be confirmed
    const receipt = await waitForTransaction(config, { hash });
    return receipt;
  } catch (error) {
    console.error('Error registering netbook:', error);
    throw error;
  }
};

// Register multiple netbooks
export const registerNetbooks = async (serials: string[], batches: string[], modelSpecs: string[]) => {
  try {
    const hash = await writeContract(config, {
      address: contractAddress,
      abi,
      functionName: 'registerNetbooks',
      args: [serials, batches, modelSpecs]
    });

    const receipt = await waitForTransaction(config, { hash });
    return receipt;
  } catch (error) {
    console.error('Error registering netbooks:', error);
    throw error;
  }
};

// Verify hardware
export const verifyHardware = async (dns: string, passed: boolean) => {
  try {
    const hash = await writeContract(config, {
      address: contractAddress,
      abi,
      functionName: 'verifyHardware',
      args: [dns, passed]
    });

    const receipt = await waitForTransaction(config, { hash });
    return receipt;
  } catch (error) {
    console.error('Error verifying hardware:', error);
    throw error;
  }
};

// Configure software
export const configureSoftware = async (dns: string, passed: boolean) => {
  try {
    const hash = await writeContract(config, {
      address: contractAddress,
      abi,
      functionName: 'configureSoftware',
      args: [dns, passed]
    });

    const receipt = await waitForTransaction(config, { hash });
    return receipt;
  } catch (error) {
    console.error('Error configuring software:', error);
    throw error;
  }
};

// Assign netbook to student
export const assignToStudent = async (dns: string, studentAddress: string) => {
  try {
    const hash = await writeContract(config, {
      address: contractAddress,
      abi,
      functionName: 'assignToStudent',
      args: [dns, studentAddress]
    });

    const receipt = await waitForTransaction(config, { hash });
    return receipt;
  } catch (error) {
    console.error('Error assigning to student:', error);
    throw error;
  }
};

// Grant role to user
export const grantRole = async (role: string, userAddress: string) => {
  try {
    const hash = await writeContract(config, {
      address: contractAddress,
      abi,
      functionName: 'grantRole',
      args: [role, userAddress]
    });

    const receipt = await waitForTransaction(config, { hash });
    return receipt;
  } catch (error) {
    console.error('Error granting role:', error);
    throw error;
  }
};

// Revoke role from user
export const revokeRole = async (role: string, userAddress: string) => {
  try {
    const hash = await writeContract(config, {
      address: contractAddress,
      abi,
      functionName: 'revokeRole',
      args: [role, userAddress]
    });

    const receipt = await waitForTransaction(config, { hash });
    return receipt;
  } catch (error) {
    console.error('Error revoking role:', error);
    throw error;
  }
};

// Get all users with their roles
export const getRoleMembers = async (role: string) => {
  try {
    const members = await readContract(config, {
      address: contractAddress,
      abi,
      functionName: 'getAllMembers',
      args: [role]
    });
    return members;
  } catch (error) {
    console.error('Error getting role members:', error);
    throw error;
  }
};

// Get role name by hash
export const getRoleName = (roleHash: string) => {
  if (roleHash === '0x0000000000000000000000000000000000000000000000000000000000000000') {
    return 'ADMIN';
  }

  const roleMap: Record<string, string> = {
    ['0x77158a1a868f1a2c65d799578edd3b70d91fe41d35a0873530f1675e734b03ea']: 'FABRICANTE_ROLE',
    ['0x1b936a89e5e4bda7649c98d9e9505d97f27e27d48c04ee16fe3626e927b10223']: 'AUDITOR_HW_ROLE',
    ['0x82c5ab743a5cc7f634910cb398752a71d2d53dfaf4533e36bea6a488818753ab']: 'TECNICO_SW_ROLE',
    ['0xc1a00cfc59ca80abcf3bceb0faa0349adfbe88d3298de8601c5e848e293322e7']: 'ESCUELA_ROLE'
  };

  return roleMap[roleHash] || 'UNKNOWN_ROLE';
};

// Get a summary of all roles and their members
export const getAllRolesSummary = async () => {
  try {
    const rolesSummary: Record<string, any> = {};

    for (const [roleName, roleData] of Object.entries(ROLES)) {
      const members = await getRoleMembers(roleData.hash) as any[];
      rolesSummary[roleName] = {
        name: roleData.label,
        count: members.length,
        members: members
      };
    }

    return rolesSummary;
  } catch (error) {
    console.error('Error getting roles summary:', error);
    throw error;
  }
};

// Get netbook report by DNS
export const getNetbookReport = async (dns: string) => {
  try {
    const report = await readContract(config, {
      address: contractAddress,
      abi,
      functionName: 'getNetbookReport',
      args: [dns]
    }) as any[];

    return {
      serialNumber: report[0],
      batchId: report[1],
      initialModelSpecs: report[2],
      hwAuditor: report[3],
      hwIntegrityPassed: report[4],
      hwReportHash: report[5],
      swTechnician: report[6],
      osVersion: report[7],
      swValidationPassed: report[8],
      destinationSchoolHash: report[9],
      studentIdHash: report[10],
      distributionTimestamp: report[11].toString(),
      currentState: Number(report[12]) as any // Cast to State if needed, but any is safer for now
    };
  } catch (error) {
    console.error('Error fetching netbook report:', error);
    throw error;
  }
};

// Get state of netbook by DNS
export const getNetbookState = async (dns: string) => {
  try {
    const state = await readContract(config, {
      address: contractAddress,
      abi,
      functionName: 'getNetbookState',
      args: [dns]
    });

    return Number(state);
  } catch (error) {
    console.error('Error fetching netbook state:', error);
    throw error;
  }
};

// Get all serial numbers
export const getAllSerialNumbers = async () => {
  try {
    const serials = await readContract(config, {
      address: contractAddress,
      abi,
      functionName: 'getAllSerialNumbers'
    });

    return serials as string[];
  } catch (error) {
    console.error('Error fetching all serial numbers:', error);
    throw error;
  }
};

// Get total count of netbooks
export const getTotalNetbookCount = async () => {
  try {
    const count = await readContract(config, {
      address: contractAddress,
      abi,
      functionName: 'totalNetbooks'
    });

    return Number(count);
  } catch (error) {
    console.error('Error fetching total netbook count:', error);
    throw error;
  }
};

