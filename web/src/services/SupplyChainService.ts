import { Netbook } from '@/types/contract';
import { serverRpc } from '@/lib/serverRpc';
import Web3Service from '@/services/Web3Service';

// Get contract address from environment variables
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS;

if (!CONTRACT_ADDRESS) {
  console.warn('NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS is not set');
}

// Type-safe service for SupplyChainTracker contract
export class SupplyChainService {
  // Read functions
  static async getNetbookState(serial: string): Promise<number> {
    try {
      const state = await serverRpc.getNetbookState(serial);
      return parseInt(state, 10);
    } catch (error) {
      console.error('Error getting netbook state:', error);
      throw error;
    }
  }

  static async getNetbookReport(serial: string): Promise<Netbook> {
    try {
      return await serverRpc.getNetbookReport(serial);
    } catch (error) {
      console.error('Error getting netbook report:', error);
      throw error;
    }
  }

  static async getAllSerialNumbers(): Promise<string[]> {
    try {
      return await serverRpc.getAllSerialNumbers();
    } catch (error) {
      console.error('Error getting all serial numbers:', error);
      throw error;
    }
  }

  // Role management
  static async hasRole(roleHash: string, address: string): Promise<boolean> {
    try {
      return await serverRpc.hasRole(roleHash, address);
    } catch (error) {
      console.error('Error checking role:', error);
      return false;
    }
  }

  static async grantRole(roleHash: string, account: string): Promise<any> {
    try {
      const contract = Web3Service.getContract();
      if (!contract) {
        throw new Error('Contract not initialized');
      }
      return await contract.grantRole(roleHash, account);
    } catch (error) {
      console.error('Error granting role:', error);
      throw error;
    }
  }

  static async revokeRole(roleHash: string, account: string): Promise<any> {
    try {
      const contract = Web3Service.getContract();
      if (!contract) {
        throw new Error('Contract not initialized');
      }
      return await contract.revokeRole(roleHash, account);
    } catch (error) {
      console.error('Error revoking role:', error);
      throw error;
    }
  }

  // Write functions - these still need to be called from the client with wallet connection
  static async registerNetbooks(
    serials: string[], 
    batches: string[], 
    modelSpecs: string[]
  ): Promise<any> {
    try {
      const contract = Web3Service.getContract();
      return await contract.registerNetbooks(serials, batches, modelSpecs);
    } catch (error) {
      console.error('Error registering netbooks:', error);
      throw error;
    }
  }

  static async auditHardware(
    serial: string,
    passed: boolean,
    reportHash: string
  ): Promise<any> {
    try {
      return await Web3Service.getContract().auditHardware(serial, passed, reportHash);
    } catch (error) {
      console.error('Error auditing hardware:', error);
      throw error;
    }
  }

  static async validateSoftware(
    serial: string,
    version: string,
    passed: boolean
  ): Promise<any> {
    try {
      return await Web3Service.getContract().validateSoftware(serial, version, passed);
    } catch (error) {
      console.error('Error validating software:', error);
      throw error;
    }
  }

  static async assignToStudent(
    serial: string,
    schoolHash: string,
    studentHash: string
  ): Promise<any> {
    try {
      return await Web3Service.getContract().assignToStudent(serial, schoolHash, studentHash);
    } catch (error) {
      console.error('Error assigning to student:', error);
      throw error;
    }
  }

  // Utility functions
  static async getCurrentAccount(): Promise<string> {
    if (!Web3Service.isWalletConnected()) {
      await Web3Service.connectWallet();
    }
    return Web3Service.getSigner().getAddress();
  }

  static async getCurrentNetwork() {
    return Web3Service.getNetwork();
  }

  static async getAccountBalance(address: string): Promise<string> {
    return Web3Service.getBalance(address);
  }

  static isWalletConnected(): boolean {
    return Web3Service.isWalletConnected();
  }

  static async connectWallet(): Promise<string> {
    return Web3Service.connectWallet();
  }

  // Role constants (matching contract)
  static readonly DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';
  static readonly FABRICANTE_ROLE = '0x77158a1a868f1a2c65d799578edd3b70d91fe41d35a0873530f1675e734b03ea';
  static readonly AUDITOR_HW_ROLE = '0x1b936a89e5e4bda7649c98d9e9505d97f27e27d48c04ee16fe3626e927b10223';
  static readonly TECNICO_SW_ROLE = '0x82c5ab743a5cc7f634910cb398752a71d2d53dfaf4533e36bea6a488818753ab';
  static readonly ESCUELA_ROLE = '0xc1a00cfc59ca80abcf3bceb0faa0349adfbe88d3298de8601c5e848e293322e7';
}
