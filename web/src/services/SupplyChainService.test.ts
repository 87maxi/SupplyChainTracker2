import * as SupplyChainService from '@/services/SupplyChainService';
import { SupplyChainContract } from '@/lib/contracts/SupplyChainContract';


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

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock del contrato
    Object.assign(SupplyChainContract, mockContract);
  });

  describe('Read functions', () => {
    // Tests using serverRpc were removed as SupplyChainService no longer uses it.
    // TODO: Update tests to mock wagmi/core readContract/writeContract
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

  // Utility functions tests removed as they tested non-existent methods
});