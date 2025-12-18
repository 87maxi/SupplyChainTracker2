import { SupplyChainService } from '@/services/SupplyChainService';
import Web3Service from '@/services/Web3Service';

// Mock de Web3Service
jest.mock('@/services/Web3Service', () => ({
  getContract: jest.fn(),
  connectWallet: jest.fn(),
  isWalletConnected: jest.fn(),
  getSigner: jest.fn(),
  getProvider: jest.fn(),
  getNetwork: jest.fn(),
  getBalance: jest.fn(),
}));

describe('SupplyChainService', () => {
  const mockContract = {
    getNetbookState: jest.fn(),
    getNetbookReport: jest.fn(),
    registerNetbooks: jest.fn(),
    auditHardware: jest.fn(),
    validateSoftware: jest.fn(),
    assignToStudent: jest.fn(),
    allSerialNumbers: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock del contrato
    (Web3Service.getContract as jest.Mock).mockReturnValue(mockContract);
  });

  describe('Read functions', () => {
    it('should get netbook state', async () => {
      mockContract.getNetbookState.mockResolvedValue(0);
      
      const state = await SupplyChainService.getNetbookState('NB-001');
      
      expect(state).toBe(0);
      expect(mockContract.getNetbookState).toHaveBeenCalledWith('NB-001');
    });

    it('should get netbook report', async () => {
      const mockReport = {
        serialNumber: 'NB-001',
        currentState: 0,
      };
      mockContract.getNetbookReport.mockResolvedValue(mockReport);
      
      const report = await SupplyChainService.getNetbookReport('NB-001');
      
      expect(report).toEqual(mockReport);
      expect(mockContract.getNetbookReport).toHaveBeenCalledWith('NB-001');
    });

    it('should get all serial numbers', async () => {
      mockContract.allSerialNumbers.mockResolvedValue(['NB-001', 'NB-002', 'NB-003']);
      
      const serials = await SupplyChainService.getAllSerialNumbers();
      
      expect(serials).toEqual(['NB-001', 'NB-002', 'NB-003']);
      expect(mockContract.allSerialNumbers).toHaveBeenCalled();
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
    it('should connect wallet through utility function', async () => {
      (Web3Service.connectWallet as jest.Mock).mockResolvedValue('0x1234567890123456789012345678901234567890');
      
      const address = await SupplyChainService.connectWallet();
      
      expect(address).toBe('0x1234567890123456789012345678901234567890');
      expect(Web3Service.connectWallet).toHaveBeenCalled();
    });

    it('should get current account', async () => {
      (Web3Service.connectWallet as jest.Mock).mockResolvedValue('0x1234567890123456789012345678901234567890');
      (Web3Service.isWalletConnected as jest.Mock).mockReturnValue(true);
      (Web3Service.getSigner as jest.Mock).mockReturnValue({
        getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890')
      });
      
      const account = await SupplyChainService.getCurrentAccount();
      
      expect(account).toBe('0x1234567890123456789012345678901234567890');
    });
  });
});