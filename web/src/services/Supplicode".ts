'use client';

import { readContract, writeContract, waitForTransactionReceipt, getBalance } from '@wagmi/core';
import { config } from '@/lib/wagmi/config';

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

// Validate software
export const validateSoftware = async (serial: string, osVersion: string, passed: boolean) => {
  try {
    const hash = await writeContract(config, {
      address: contractAddress,
      abi,
      functionName: 'validateSoftware',
      args: [serial, osVersion, passed]
    });

    const receipt = await waitForTransactionReceipt(config, { hash });
    return receipt;
  } catch (error) {
    console.error('Error validating software:', error);
    throw error;
  }
};

// Get role counts using getAllMembers
export const getRoleCounts = async () => {
  try {
    // Get role hashes from our utility
    const { FABRICANTE, AUDITOR_HW, TECNICO_SW, ESCUELA, ADMIN } = await import('@/lib/roleUtils').then(
      ({ getRoleHashes }) => getRoleHashes()
    );

    // Map role hashes to labels
    const roleMap = [
      { hash: ADMIN, label: 'Administrador' },
      { hash: FABRICANTE, label: 'Fabricante' },
      { hash: AUDITOR_HW, label: 'Auditor HW' },
      { hash: TECNICO_SW, label: 'Técnico SW' },
      { hash: ESCUELA, label: 'Escuela' }
    ];

    // Get counts for all roles
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