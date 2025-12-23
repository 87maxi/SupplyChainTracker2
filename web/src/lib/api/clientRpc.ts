'use client';

import { readContract } from '@wagmi/core';
import { config } from '@/lib/wagmi/config';
import SupplyChainTrackerABI from '@/contracts/abi/SupplyChainTracker.json';
import { NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS } from '@/lib/env';

const contractAddress = NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS as `0x${string}`;
const abi = SupplyChainTrackerABI;

/**
 * Client-side RPC functions for interacting with the SupplyChain smart contract.
 * These functions run on the client side and use wagmi's readContract.
 */

export async function getRoleMembers(roleHash: string): Promise<string[]> {
  try {
    const result = await readContract(config, {
      address: contractAddress,
      abi,
      functionName: 'getAllMembers',
      args: [roleHash]
    });
    
    return result as string[];
  } catch (error) {
    console.error(`Error getting members for role ${roleHash}:`, error);
    return [];
  }
}

export async function getRoleMemberCount(roleHash: string): Promise<number> {
  try {
    const result = await readContract(config, {
      address: contractAddress,
      abi,
      functionName: 'getRoleMemberCount',
      args: [roleHash]
    });
    
    return Number(result);
  } catch (error) {
    console.error(`Error getting member count for role ${roleHash}:`, error);
    return 0;
  }
}

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
    console.error(`Error checking role ${roleHash} for address ${address}:`, error);
    return false;
  }
}

export async function getAllSerialNumbers(): Promise<string[]> {
  try {
    const result = await readContract(config, {
      address: contractAddress,
      abi,
      functionName: 'getAllSerialNumbers'
    });
    
    return result as string[];
  } catch (error) {
    console.error('Error getting all serial numbers:', error);
    return [];
  }
}

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
    console.error(`Error getting netbooks for state ${state}:`, error);
    return [];
  }
}