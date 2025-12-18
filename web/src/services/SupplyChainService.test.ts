import { SupplyChainService } from '@/services/SupplyChainService';
import { SupplyChainContract } from '@/lib/contracts/SupplyChainContract';
import { serverRpc } from '@/lib/serverRpc';

// Tipos para los mocks
import { type Contract, type MockProxy } from 'jest-mock';

describe('SupplyChainService', () => {
  // Mocks temporales que se crean y se limpian en cada test
  const mockContract = {
    getNetbookState: jest.fn(),
    getNetbookReport: jest.fn(),
    registerNetbooks: jest.fn(),
    auditHardware: jest.fn(),
    validateSoftware: jest.fn(),
    assignToStudent: jest.fn(),
    grantRole: jest.fn(),
    revokeRole: jest.fn(),
    hasRole: jest.fn(),
  };

  const mockServerRpc = {
    getNetbookState: jest.fn(),
    getNetbookReport: jest.fn(),
    getAllSerialNumbers: jest.fn(),
    hasRole: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock del contrato
    Object.assign(SupplyChainContract, mockContract);
    Object.assign(serverRpc, mockServerRpc);
  });

  describe('Read functions', () => {
    it('should get netbook state', async () => {
      mockServerRpc.getNetbookState.mockResolvedValue('0');
      
      const state = await SupplyChainService.getNetbookState('NB-001');
      
      expect(state).toBe(0);
      expect(mockServerRpc.getNetbookState).toHaveBeenCalledWith('NB-001');
    });

    it('should get netbook report', async () => {
      const mockReport = {
        serialNumber: 'NB-001',
        batchId: 'BATCH-001',
        initialModelSpecs: 'Intel Celeron N4020, 4GB RAM, 64GB SSD',
        hwAuditor: '0x0000000000000000000000000000000000000000',
        hwIntegrityPassed: false,
        hwReportHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
        swTechnician: '0x0000000000000000000000000000000000000000',
        osVersion: '',
        swValidationPassed: false,
        destinationSchoolHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
        studentIdHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
        distributionTimestamp: '0',
        currentState: 0
      };
      mockServerRpc.getNetbookReport.mockResolvedValue(mockReport);
      
      const report = await SupplyChainService.getNetbookReport('NB-001');
      
      expect(report).toEqual(mockReport);
      expect(mockServerRpc.getNetbookReport).toHaveBeenCalledWith('NB-001');
    });

    it('should get all serial numbers', async () => {
      mockServerRpc.getAllSerialNumbers.mockResolvedValue(['NB-001', 'NB-002', 'NB-003']);
      
      const serials = await SupplyChainService.getAllSerialNumbers();
      
      expect(serials).toEqual(['NB-001', 'NB-002', 'NB-003']);
      expect(mockServerRpc.getAllSerialNumbers).toHaveBeenCalled();
    });
  });

  describe('Write functions', () => {
    it('should register netbooks', async () => {
      const mockTx = { hash: '0x123' };
      mockContract.registerNetbooks.mockResolvedValue(mockTx);
      
      const result = await SupplyChainService.registerNetbooks(
        ['NB-001'],
        ['BATCH-001'],
        ['Model A']
      );
      
      expect(result).toEqual(mockTx);
      expect(mockContract.registerNetbooks).toHaveBeenCalledWith(
        ['NB-001'],
        ['BATCH-001'],
        ['Model A']
      );
    });

    it('should audit hardware', async () => {
      const mockTx = { hash: '0x123' };
      mockContract.auditHardware.mockResolvedValue(mockTx);
      
      const result = await SupplyChainService.auditHardware(
        'NB-001',
        true,
        '0x0000000000000000000000000000000000000000000000000000000000000000'
      );
      
      expect(result).toEqual(mockTx);
      expect(mockContract.auditHardware).toHaveBeenCalledWith(
        'NB-001',
        true,
        '0x0000000000000000000000000000000000000000000000000000000000000000'
      );
    });

    it('should validate software', async () => {
      const mockTx = { hash: '0x123' };
      mockContract.validateSoftware.mockResolvedValue(mockTx);
      
      const result = await SupplyChainService.validateSoftware(
        'NB-001',
        '1.0.0',
        true
      );
      
      expect(result).toEqual(mockTx);
      expect(mockContract.validateSoftware).toHaveBeenCalledWith(
        'NB-001',
        '1.0.0',
        true
      );
    });

    it('should assign to student', async () => {
      const mockTx = { hash: '0x123' };
      mockContract.assignToStudent.mockResolvedValue(mockTx);
      
      const result = await SupplyChainService.assignToStudent(
        'NB-001',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000000000000000000000000000'
      );
      
      expect(result).toEqual(mockTx);
      expect(mockContract.assignToStudent).toHaveBeenCalledWith(
        'NB-001',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000000000000000000000000000'
      );
    });
  });

  describe('Utility functions', () => {
    it('should check if wallet is connected', () => {
      const isConnected = SupplyChainService.isWalletConnected();
      expect(isConnected).toBe(false); // Default implementation returns false
    });

    it('should throw error when connecting wallet (not implemented)', async () => {
      await expect(SupplyChainService.connectWallet()).rejects.toThrow('Wallet connection not implemented');
    });
  });
});