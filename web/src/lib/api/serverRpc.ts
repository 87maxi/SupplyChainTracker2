'use server';

import { revalidateTag } from 'next/cache';
import { SupplyChainContract } from '@/lib/contracts/SupplyChainContract';

// Use local storage or cache for server-side data
const cache = new Map();

const CACHE_KEY = 'supply-chain-data';
const ROLE_CACHE_KEY = 'role-members';

// Server-only RPC functions
export const serverRpc = {
  async getAllSerialNumbers() {
    // Use cache for performance
    if (cache.has(CACHE_KEY)) {
      console.log('Cache hit for getAllSerialNumbers');
      return cache.get(CACHE_KEY);
    }

    console.log('Cache miss for getAllSerialNumbers');

    try {
      // Fetch from contract through the actual serverRpc instance
      const serialNumbers = await SupplyChainContract.getAllSerialNumbers();
      cache.set(CACHE_KEY, serialNumbers);
      return serialNumbers;
    } catch (error) {
      console.error('Error getting serial numbers:', error);
      throw error;
    }
  },

  async getNetbookReport(serial: string) {
    try {
      return await SupplyChainContract.getNetbookReport(serial);
    } catch (error) {
      console.error(`Error getting netbook report for ${serial}:`, error);
      throw error;
    }
  },

  async getNetbookState(serial: string) {
    console.log(`Getting state for serial: ${serial}`);

    try {
      return await SupplyChainContract.getNetbookState(serial);
    } catch (error) {
      console.error(`Error getting state for ${serial}:`, error);
      throw error;
    }
  },

  // Revalidate cache tags
  async getRoleMembers(roleHash: string): Promise<string[]> {
    try {
      return await SupplyChainContract.getAllMembers(roleHash);
    } catch (error) {
      console.error(`Error getting members for role ${roleHash}:`, error);
      throw error;
    }
  },

  async getRoleMemberCount(roleHash: string): Promise<number> {
    try {
      const count = await SupplyChainContract.getRoleMemberCount(roleHash);
      return Number(count);
    } catch (error) {
      console.error(`Error getting member count for role ${roleHash}:`, error);
      throw error;
    }
  },

  // Revalidate cache tags
  revalidate: {
    all: () => {
      cache.clear();
      revalidateTag('dashboard-data', {});
      revalidateTag('netbook-state', {});
      revalidateTag('serial-numbers', {});
      revalidateTag('role-members', {});
      console.log('All cache tags revalidated');
    }
  }
};