import { SupplyChainService } from '@/services/SupplyChainService';

// Mock completo del SupplyChainService
const mockSupplyChainService = {
  getNetbookState: jest.fn(),
  getNetbookReport: jest.fn(),
  getAllSerialNumbers: jest.fn(),
  registerNetbooks: jest.fn(),
  auditHardware: jest.fn(),
  validateSoftware: jest.fn(),
  assignToStudent: jest.fn(),
  getCurrentAccount: jest.fn(),
  getCurrentNetwork: jest.fn(),
  getAccountBalance: jest.fn(),
  isWalletConnected: jest.fn(),
  connectWallet: jest.fn(),
};

// Configurar valores por defecto para las promesas
mockSupplyChainService.getNetbookState.mockResolvedValue(0); // Estado FABRICADA

mockSupplyChainService.getNetbookReport.mockResolvedValue({
  serialNumber: 'NB-001',
  batchId: 'BATCH-001',
  initialModelSpecs: 'Model A',
  hwAuditor: '0x0000000000000000000000000000000000000000',
  hwIntegrityPassed: true,
  hwReportHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
  swTechnician: '0x0000000000000000000000000000000000000000',
  osVersion: '1.0.0',
  swValidationPassed: true,
  destinationSchoolHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
  studentIdHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
  distributionTimestamp: 0,
  currentState: 0,
});

mockSupplyChainService.getAllSerialNumbers.mockResolvedValue([
  'NB-001',
  'NB-002',
  'NB-003',
]);

mockSupplyChainService.getCurrentAccount.mockResolvedValue('0x1234567890123456789012345678901234567890');
mockSupplyChainService.getCurrentNetwork.mockResolvedValue({ chainId: 31337 });
mockSupplyChainService.getAccountBalance.mockResolvedValue('1.0');
mockSupplyChainService.isWalletConnected.mockReturnValue(true);
mockSupplyChainService.connectWallet.mockResolvedValue('0x1234567890123456789012345678901234567890');

export default mockSupplyChainService;