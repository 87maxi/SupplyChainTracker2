'use server';

import { revalidateTag } from 'next/cache';
import { SupplyChainContract } from '@/lib/contracts/SupplyChainContract';

// Use local storage or cache for server-side data
const cache = new Map();

const CACHE_KEY = 'supply-chain-data';
const ROLE_CACHE_KEY = 'role-members';

// Server-only RPC functions
export async function getAllSerialNumbers() {
  // Use cache for performance
  if (cache.has(CACHE_KEY)) {
    console.log('Cache hit for getAllSerialNumbers');
    return cache.get(CACHE_KEY);
  }

  console.log('Cache miss for getAllSerialNumbers');

  try {
    // Fetch from contract
    const serialNumbers = await SupplyChainContract.getAllSerialNumbers();
    cache.set(CACHE_KEY, serialNumbers);
    return serialNumbers;
  } catch (error) {
    console.error('Error getting serial numbers:', error);
    throw error;
  }
}

export async function getNetbookReport(serial: string) {
  try {
    return await SupplyChainContract.getNetbookReport(serial);
  } catch (error) {
    console.error(`Error getting netbook report for ${serial}:`, error);
    throw error;
  }
}

export async function getNetbookState(serial: string) {
  console.log(`Getting state for serial: ${serial}`);

  try {
    return await SupplyChainContract.getNetbookState(serial);
  } catch (error) {
    console.error(`Error getting state for ${serial}:`, error);
    throw error;
  }
}

export async function getNetbooksByState(state: number): Promise<string[]> {
  try {
    return await SupplyChainContract.getNetbooksByState(state);
  } catch (error) {
    console.error(`Error getting netbooks for state ${state}:`, error);
    throw error;
  }
}

export async function getRoleMembers(roleHash: string): Promise<string[]> {
  try {
    return await SupplyChainContract.getAllMembers(roleHash);
  } catch (error) {
    console.error(`Error getting members for role ${roleHash}:`, error);
    throw error;
  }
}

export async function getRoleMemberCount(roleHash: string): Promise<number> {
  try {
    const count = await SupplyChainContract.getRoleMemberCount(roleHash);
    return Number(count);
  } catch (error) {
    console.error(`Error getting member count for role ${roleHash}:`, error);
    throw error;
  }
}

export async function revalidateAll() {
  cache.clear();
  revalidateTag('dashboard-data', 'page');
  revalidateTag('netbook-state', 'page');
  revalidateTag('serial-numbers', 'page');
  revalidateTag('role-members', 'page');
  console.log('All cache tags revalidated');
}

// Keep the object for backward compatibility if needed, but individual exports are preferred
export const serverRpc = {
  getAllSerialNumbers,
  getNetbookReport,
  getNetbookState,
  getNetbooksByState,
  getRoleMembers,
  getRoleMemberCount,
  revalidate: {
    all: revalidateAll
  }
};