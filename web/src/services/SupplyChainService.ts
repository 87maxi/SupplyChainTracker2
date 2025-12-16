import Web3Service from '@/services/Web3Service';
import SupplyChainTrackerABI from '@/contracts/abi/SupplyChainTracker.json';
import { Netbook } from '@/types/contract';

// Get contract address from environment variables
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS;

// Type guard to ensure ABI is in the correct format
function isAbiArray(abi: any): abi is any[] {
  return Array.isArray(abi);
}

// Validate ABI format
if (!isAbiArray(SupplyChainTrackerABI)) {
  throw new Error('Invalid ABI format for SupplyChainTracker');
}

// Initialize the contract configuration
const contractConfig = {
  address: CONTRACT_ADDRESS as string,
  abi: SupplyChainTrackerABI,
};

// Set up the contract with Web3Service
Web3Service.setContract(contractConfig);

// Type-safe service for SupplyChainTracker contract
export class SupplyChainService {
  // Read functions
  static async getNetbookState(serial: string): Promise<number> {
    try {
      return await Web3Service.getContract().getNetbookState(serial);
    } catch (error) {
      console.error('Error getting netbook state:', error);
      throw error;
    }
  }

  static async getNetbookReport(serial: string): Promise<Netbook> {
    try {
      return await Web3Service.getContract().getNetbookReport(serial);
    } catch (error) {
      console.error('Error getting netbook report:', error);
      throw error;
    }
  }

  static async getAllSerialNumbers(): Promise<string[]> {
    try {
      const contract = Web3Service.getContract();
      const count = await contract.allSerialNumbers.length;
      const serials: string[] = [];
      
      for (let i = 0; i < count; i++) {
        serials.push(await contract.allSerialNumbers(i));
      }
      
      return serials;
    } catch (error) {
      console.error('Error getting all serial numbers:', error);
      throw error;
    }
  }

  // Write functions
  static async registerNetbooks(
    serials: string[], 
    batches: string[], 
    modelSpecs: string[]
  ): Promise<ethers.ContractTransaction> {
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
  ): Promise<ethers.ContractTransaction> {
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
  ): Promise<ethers.ContractTransaction> {
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
  ): Promise<ethers.ContractTransaction> {
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
}
