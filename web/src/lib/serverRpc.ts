import { Netbook } from '@/types/contract';
import { SupplyChainContract } from '@/lib/contracts/SupplyChainContract';

// Server-side RPC calls that interact with the blockchain contract
class ServerRpc {
  async getNetbookState(serial: string): Promise<string> {
    console.log('Server RPC: getNetbookState', serial);
    try {
      const state = await SupplyChainContract.getNetbookState(serial);
      return state.toString();
    } catch (error) {
      console.error('Error getting netbook state:', error);
      return '0'; // Default to FABRICADA on error
    }
  }

  async getNetbookReport(serial: string): Promise<Netbook> {
    console.log('Server RPC: getNetbookReport', serial);
    try {
      const report = await SupplyChainContract.getNetbookReport(serial);
      return report as Netbook;
    } catch (error) {
      console.error('Error getting netbook report:', error);
      // Return empty report on error
      return {
        serialNumber: serial,
        batchId: '',
        initialModelSpecs: '',
        hwAuditor: '0x0000000000000000000000000000000000000000',
        hwIntegrityPassed: false,
        hwReportHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
        swTechnician: '0x0000000000000000000000000000000000000000',
        osVersion: '',
        swValidationPassed: false,
        destinationSchoolHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
        studentIdHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
        distributionTimestamp: '0',
        currentState: 0 as any
      };
    }
  }

  async getAllSerialNumbers(): Promise<string[]> {
    console.log('Server RPC: getAllSerialNumbers');
    try {
      // This would typically come from an indexed database or subgraph
      // For now, return empty array - will be populated by contract events
      return [];
    } catch (error) {
      console.error('Error getting serial numbers:', error);
      return [];
    }
  }

  async hasRole(roleHash: string, address: string): Promise<boolean> {
    console.log('Server RPC: hasRole', { roleHash, address });
    try {
      return await SupplyChainContract.hasRole(roleHash, address);
    } catch (error) {
      console.error('Error checking role:', error);
      return false;
    }
  }
}

export const serverRpc = new ServerRpc();
