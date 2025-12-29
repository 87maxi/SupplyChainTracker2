import { ethers } from 'ethers';
import { expect, describe, it, beforeEach } from '@jest/globals';

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Test suite for SupplyChainTracker contract integration
describe('SupplyChainTracker Contract Integration', () => {
  let provider: ethers.Provider;
  let contract: ethers.Contract;
  const contractAddress = process.env.NEXT_PUBLIC_SUPPLY_CHAIN_CONTRACT_ADDRESS;
  const abi = require('../../contracts/abi/SupplyChainTracker.json');

  // Validate environment variables
  beforeAll(() => {
    if (!contractAddress) {
      throw new Error('NEXT_PUBLIC_SUPPLY_CHAIN_CONTRACT_ADDRESS is not defined in .env.local');
    }
  });

  beforeEach(() => {
    // Connect to local Anvil network
    provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL || 'http://localhost:8545');
    
    // Initialize contract instance
    contract = new ethers.Contract(contractAddress, abi, provider);
  });

  it('should be able to read contract state', async () => {
    // Test basic contract interaction
    const totalNetbooks = await contract.totalNetbooks();
    expect(totalNetbooks).toBeGreaterThanOrEqual(0);
  }, 20000);

  it('should get valid role by name with uppercase', async () => {
    // Test specific function from the contract with valid role names
    // Based on contract tests, role names should be in uppercase without suffix
    const validRoleNames = [
      'FABRICANTE',
      'AUDITOR_HW',
      'TECNICO_SW',
      'ESCUELA',
      'ADMIN',
      'DEFAULT_ADMIN'
    ];
    
    for (const roleName of validRoleNames) {
      const role = await contract.getRoleByName(roleName);
      expect(role).toBeDefined();
      expect(typeof role).toBe('string');
      expect(role.length).toBe(66); // 0x + 32 bytes hex
    }
  }, 20000);

  it('should list all roles constants', async () => {
    // Test role constant getters
    const roles = [
      'DEFAULT_ADMIN_ROLE',
      'FABRICANTE_ROLE',
      'AUDITOR_HW_ROLE',
      'TECNICO_SW_ROLE',
      'ESCUELA_ROLE'
    ];
    
    for (const role of roles) {
      const roleHash = await contract[role]();
      expect(roleHash).toBeDefined();
      expect(typeof roleHash).toBe('string');
      expect(roleHash.length).toBe(66);
    }
  }, 20000);

  it('should get netbooks by state', async () => {
    // Test array return functionality
    const states = Object.keys(SupplyChainTrackerState);
    
    // Skip string index
    for (const key of states) {
      if (isNaN(Number(key))) continue;
      
      const stateNum = Number(key);
      const netbooks = await contract.getNetbooksByState(stateNum);
      expect(Array.isArray(netbooks)).toBe(true);
    }
  }, 20000);
});

// Define State enum to match contract
const SupplyChainTrackerState = {
  Registered: 0,
  HardwareAudited: 1,
  SoftwareValidated: 2,
  AssignedToStudent: 3
};