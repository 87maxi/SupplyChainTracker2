import { getContract } from '@/lib/web3';
import { NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS, NEXT_PUBLIC_RPC_URL } from '@/lib/env';
import SupplyChainTrackerABI from '@/contracts/abi/SupplyChainTracker.json';
import { ethers } from 'ethers';
import { writeContract, readContract } from '@wagmi/core';
import { config } from '@/lib/wagmi/config';

// Load environment variables
const contractAddress = NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS;

if (!contractAddress) {
  throw new Error('NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS is not defined');
}

// Create contract instance
export const getSupplyChainContract = async () => {
  if (typeof window === 'undefined') {
    // Server-side: use a JSON-RPC provider
    const provider = new ethers.JsonRpcProvider(NEXT_PUBLIC_RPC_URL);
    return new ethers.Contract(contractAddress, SupplyChainTrackerABI, provider);
  }

  const contract = await getContract(SupplyChainTrackerABI, contractAddress);
  return contract;
};

// Export role constants
export const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';
export const FABRICANTE_ROLE = '0x77158a1a868f1a2c65d799578edd3b70d91fe41d35a0873530f1675e734b03ea';
export const AUDITOR_HW_ROLE = '0x1b936a89e5e4bda7649c98d9e9505d97f27e27d48c04ee16fe3626e927b10223';
export const TECNICO_SW_ROLE = '0x82c5ab743a5cc7f634910cb398752a71d2d53dfaf4533e36bea6a488818753ab';
export const ESCUELA_ROLE = '0xc1a00cfc59ca80abcf3bceb0faa0349adfbe88d3298de8601c5e848e293322e7';

// Expose contract read methods
export const SupplyChainContract = {
  // Role getters (constants)
  async getDefaultAdminRole() {
    return DEFAULT_ADMIN_ROLE;
  },

  async getFabricanteRole() {
    return FABRICANTE_ROLE;
  },

  async getAuditorHwRole() {
    return AUDITOR_HW_ROLE;
  },

  async getTecnicoSwRole() {
    return TECNICO_SW_ROLE;
  },

  async getEscuelaRole() {
    return ESCUELA_ROLE;
  },

  // State and data queries
  async getNetbookReport(serial: string) {
    const contract = await getSupplyChainContract();
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
      currentState: parseInt(report.currentState) as any
    };
  },

  async getNetbookState(serial: string) {
    const contract = await getSupplyChainContract();
    const state = await contract.getNetbookState(serial);
    return parseInt(state);
  },

  async hasRole(role: string, account: string) {
    try {
      return await readContract(config, {
        address: contractAddress as `0x${string}`,
        abi: SupplyChainTrackerABI,
        functionName: 'hasRole',
        args: [role, account]
      });
    } catch (error) {
      console.error('Error in hasRole:', error);
      throw error;
    }
  },

  async getAllSerialNumbers() {
    const contract = await getSupplyChainContract();
    return await contract.getAllSerialNumbers();
  },

  async getNetbooksByState(state: number) {
    const contract = await getSupplyChainContract();
    return await contract.getNetbooksByState(state);
  },

  async getAllMembers(roleHash: string) {
    const contract = await getSupplyChainContract();
    return await contract.getAllMembers(roleHash);
  },

  async getRoleMemberCount(roleHash: string) {
    const contract = await getSupplyChainContract();
    return await contract.getRoleMemberCount(roleHash);
  },

  // Write operations
  async registerNetbooks(serials: string[], batches: string[], modelSpecs: string[]) {
    const contract = await getSupplyChainContract();
    const tx = await contract.registerNetbooks(serials, batches, modelSpecs);
    return tx;
  },

  async auditHardware(serial: string, passed: boolean, reportHash: string) {
    const contract = await getSupplyChainContract();
    const tx = await contract.auditHardware(serial, passed, reportHash);
    return tx;
  },

  async validateSoftware(serial: string, version: string, passed: boolean) {
    const contract = await getSupplyChainContract();
    const tx = await contract.validateSoftware(serial, version, passed);
    return tx;
  },

  async assignToStudent(serial: string, schoolHash: string, studentHash: string) {
    const contract = await getSupplyChainContract();
    const tx = await contract.assignToStudent(serial, schoolHash, studentHash);
    return tx;
  },

  async grantRole(role: string, account: string) {
    try {
      const hash = await writeContract(config, {
        address: contractAddress as `0x${string}`,
        abi: SupplyChainTrackerABI,
        functionName: 'grantRole',
        args: [role, account]
      });
      return { hash };
    } catch (error) {
      console.error('Error in grantRole:', error);
      throw error;
    }
  },

  async revokeRole(role: string, account: string) {
    try {
      const hash = await writeContract(config, {
        address: contractAddress as `0x${string}`,
        abi: SupplyChainTrackerABI,
        functionName: 'revokeRole',
        args: [role, account]
      });
      return { hash };
    } catch (error) {
      console.error('Error in revokeRole:', error);
      throw error;
    }
  }
};