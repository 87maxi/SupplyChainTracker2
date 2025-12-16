import { ethers } from 'ethers';
import { Signer } from 'ethers';
import SupplyChainTrackerABI from '@/contracts/abi/SupplyChainTracker.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Default Anvil address

export class Web3Service {
  private contract: ethers.Contract;

  constructor(signer: Signer) {
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, SupplyChainTrackerABI, signer);
  }

  // Role Management
  async grantRole(role: string, account: string) {
    const tx = await this.contract.grantRole(role, account);
    return tx;
  }

  async revokeRole(role: string, account: string) {
    const tx = await this.contract.revokeRole(role, account);
    return tx;
  }

  async hasRole(role: string, account: string) {
    return await this.contract.hasRole(role, account);
  }

  // Netbook Management
  async registerNetbooks(serials: string[], batches: string[], modelSpecs: string[]) {
    const tx = await this.contract.registerNetbooks(serials, batches, modelSpecs);
    return tx;
  }

  async auditHardware(serial: string, passed: boolean, reportHash: string) {
    const tx = await this.contract.auditHardware(serial, passed, reportHash);
    return tx;
  }

  async validateSoftware(serial: string, version: string, passed: boolean) {
    const tx = await this.contract.validateSoftware(serial, version, passed);
    return tx;
  }

  async assignToStudent(serial: string, schoolHash: string, studentHash: string) {
    const tx = await this.contract.assignToStudent(serial, schoolHash, studentHash);
    return tx;
  }

  // Read Functions
  async getNetbookReport(serial: string) {
    return await this.contract.getNetbookReport(serial);
  }

  async getNetbookState(serial: string) {
    return await this.contract.getNetbookState(serial);
  }

  // Role Constants (retrieved from contract)
  async getRoles() {
    const roles = {
      DEFAULT_ADMIN_ROLE: await this.contract.DEFAULT_ADMIN_ROLE(),
      FABRICANTE_ROLE: await this.contract.FABRICANTE_ROLE(),
      AUDITOR_HW_ROLE: await this.contract.AUDITOR_HW_ROLE(),
      TECNICO_SW_ROLE: await this.contract.TECNICO_SW_ROLE(),
      ESCUELA_ROLE: await this.contract.ESCUELA_ROLE(),
    };
    return roles;
  }
}