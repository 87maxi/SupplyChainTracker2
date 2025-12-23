'use server';

import { revalidateTag } from 'next/cache';
import { ethers } from 'ethers';
import { NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS, NEXT_PUBLIC_RPC_URL } from '@/lib/env';
import SupplyChainTrackerABI from '@/contracts/abi/SupplyChainTracker.json';

// Cache configuration
const CACHE_TTL = 60 * 1000; // 1 minute
const cache = new Map<string, { data: any; timestamp: number }>();

// Cache keys
const CACHE_KEYS = {
  SERIAL_NUMBERS: 'serial-numbers',
  NETBOOK_REPORT: 'netbook-report:',
  NETBOOK_STATE: 'netbook-state:',
  NETBOOKS_BY_STATE: 'netbooks-by-state:',
  ROLE_MEMBERS: 'role-members:',
  ROLE_MEMBER_COUNT: 'role-member-count:',
  HAS_ROLE: 'has-role:'
} as const;

// Role constants (as async functions to comply with Server Actions)
const ROLE_CONSTANTS = {
  DEFAULT_ADMIN_ROLE: '0x0000000000000000000000000000000000000000000000000000000000000000',
  FABRICANTE_ROLE: '0x77158a1a868f1a2c65d799578edd3b70d91fe41d35a0873530f1675e734b03ea',
  AUDITOR_HW_ROLE: '0x1b936a89e5e4bda7649c98d9e9505d97f27e27d48c04ee16fe3626e927b10223',
  TECNICO_SW_ROLE: '0x82c5ab743a5cc7f634910cb398752a71d2d53dfaf4533e36bea6a488818753ab',
  ESCUELA_ROLE: '0xc1a00cfc59ca80abcf3bceb0faa0349adfbe88d3298de8601c5e848e293322e7'
};

// Create server-side contract instance
const getServerContract = () => {
  if (!NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS) {
    throw new Error('NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS is not defined');
  }
  
  if (!NEXT_PUBLIC_RPC_URL) {
    throw new Error('NEXT_PUBLIC_RPC_URL is not defined');
  }
  
  const provider = new ethers.JsonRpcProvider(NEXT_PUBLIC_RPC_URL);
  return new ethers.Contract(
    NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS, 
    SupplyChainTrackerABI, 
    provider
  );
};

/**
 * Server-only RPC functions for interacting with the SupplyChain smart contract.
 * These functions run on the server side and use caching for performance.
 */

/**
 * Helper function to get cached data or fetch fresh data
 */
async function withCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = CACHE_TTL
): Promise<T> {
  const cached = cache.get(key);
  const now = Date.now();
  
  if (cached && now - cached.timestamp < ttl) {
    console.log(`Cache hit for ${key}`);
    return cached.data;
  }

  console.log(`Cache miss for ${key}`);
  const data = await fetchFn();
  cache.set(key, { data, timestamp: now });
  return data;
}

/**
 * Get role constants
 */
export async function getRoleConstant(roleName: keyof typeof ROLE_CONSTANTS): Promise<string> {
  return ROLE_CONSTANTS[roleName];
}

/**
 * Get all serial numbers from the contract
 */
export async function getAllSerialNumbers(): Promise<string[]> {
  return withCache(
    CACHE_KEYS.SERIAL_NUMBERS,
    async () => {
      try {
        const contract = getServerContract();
        return await contract.getAllSerialNumbers();
      } catch (error) {
        console.error('Error getting serial numbers:', error);
        throw new Error(`Failed to get serial numbers: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  );
}

/**
 * Get detailed netbook report by serial number
 */
export async function getNetbookReport(serial: string) {
  const key = `${CACHE_KEYS.NETBOOK_REPORT}${serial}`;
  
  return withCache(
    key,
    async () => {
      try {
        const contract = getServerContract();
        const report = await contract.getNetbookReport(serial);
        return {
          serialNumber: serial,
          batchId: report.batchId,
          initialModelSpecs: report.initialModelSpecs,
          hwAuditor: report.hwAuditor,
          hwIntegrityPassed: report.hwIntegrityPassed,
          hwReportHash: report.hwReportHash,
          swTechnician: report.swTechnician,
          osVersion: report.osVersion,
          swValidationPassed: report.swValidationPassed,
          destinationSchoolHash: report.destinationSchoolHash,
          studentIdHash: report.studentIdHash,
          distributionTimestamp: report.distributionTimestamp.toString(),
          currentState: parseInt(report.currentState)
        };
      } catch (error) {
        console.error(`Error getting netbook report for ${serial}:`, error);
        throw new Error(`Failed to get netbook report: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  );
}

/**
 * Get the current state of a netbook
 */
export async function getNetbookState(serial: string): Promise<number> {
  const key = `${CACHE_KEYS.NETBOOK_STATE}${serial}`;
  
  return withCache(
    key,
    async () => {
      try {
        const contract = getServerContract();
        const state = await contract.getNetbookState(serial);
        return parseInt(state);
      } catch (error) {
        console.error(`Error getting state for ${serial}:`, error);
        throw new Error(`Failed to get netbook state: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  );
}

/**
 * Get all netbooks in a specific state
 */
export async function getNetbooksByState(state: number): Promise<string[]> {
  const key = `${CACHE_KEYS.NETBOOKS_BY_STATE}${state}`;
  
  return withCache(
    key,
    async () => {
      try {
        const contract = getServerContract();
        return await contract.getNetbooksByState(state);
      } catch (error) {
        console.error(`Error getting netbooks for state ${state}:`, error);
        throw new Error(`Failed to get netbooks by state: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  );
}

/**
 * Get all members of a specific role
 */
export async function getRoleMembers(roleHash: string): Promise<string[]> {
  const key = `${CACHE_KEYS.ROLE_MEMBERS}${roleHash}`;
  
  return withCache(
    key,
    async () => {
      try {
        const contract = getServerContract();
        return await contract.getAllMembers(roleHash);
      } catch (error) {
        console.error(`Error getting members for role ${roleHash}:`, error);
        throw new Error(`Failed to get role members: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  );
}

/**
 * Get the count of members in a specific role
 */
export async function getRoleMemberCount(roleHash: string): Promise<number> {
  const key = `${CACHE_KEYS.ROLE_MEMBER_COUNT}${roleHash}`;
  
  return withCache(
    key,
    async () => {
      try {
        const contract = getServerContract();
        const count = await contract.getRoleMemberCount(roleHash);
        return Number(count);
      } catch (error) {
        console.error(`Error getting member count for role ${roleHash}:`, error);
        throw new Error(`Failed to get role member count: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  );
}

/**
 * Check if an address has a specific role
 */
export async function hasRole(roleHash: string, address: string): Promise<boolean> {
  const key = `${CACHE_KEYS.HAS_ROLE}${roleHash}:${address}`;
  
  return withCache(
    key,
    async () => {
      try {
        const contract = getServerContract();
        return await contract.hasRole(roleHash, address);
      } catch (error) {
        console.error('Error checking role:', error);
        throw new Error(`Failed to check role: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
    30 * 1000 // Shorter TTL for role checks (30 seconds)
  );
}

/**
 * Clear specific cache entries
 */
export async function clearCache(keys?: string[]): Promise<void> {
  if (keys) {
    keys.forEach(key => cache.delete(key));
  } else {
    cache.clear();
  }
  console.log('Cache cleared', keys ? `for keys: ${keys.join(', ')}` : 'completely');
}

/**
 * Revalidate all cached data and Next.js cache tags
 */
export async function revalidateAll(): Promise<void> {
  // Clear all local cache
  cache.clear();
  
  // Revalidate Next.js cache tags
  revalidateTag('dashboard-data', 'layout');
  revalidateTag('netbook-state', 'layout');
  revalidateTag('serial-numbers', 'layout');
  revalidateTag('role-members', 'layout');
  revalidateTag('role-requests', 'layout');
  
  console.log('All cache tags revalidated and local cache cleared');
}

/**
 * Get cache statistics for debugging
 */
export async function getCacheStats(): Promise<{ size: number; keys: string[] }> {
  return {
    size: cache.size,
    keys: Array.from(cache.keys())
  };
}
