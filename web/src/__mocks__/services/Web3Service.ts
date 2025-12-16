import Web3Service from '@/services/Web3Service';

// Mock completo del Web3Service
const mockWeb3Service = {
  connectWallet: jest.fn(),
  getSigner: jest.fn(),
  getProvider: jest.fn(),
  getContract: jest.fn(),
  isWalletConnected: jest.fn(),
  getNetwork: jest.fn(),
  getBalance: jest.fn(),
};

// Mock del ethers objeto que sería devuelto
const mockSigner = {
  getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
};

const mockProvider = {
  getNetwork: jest.fn().mockResolvedValue({ chainId: 31337 }),
  getBalance: jest.fn().mockResolvedValue('1000000000000000000'),
};

// Configurar los mocks
mockWeb3Service.getSigner.mockReturnValue(mockSigner);
mockWeb3Service.getProvider.mockReturnValue(mockProvider);

// Mock del contrato
const mockContract = {
  getNetbookState: jest.fn(),
  getNetbookReport: jest.fn(),
  registerNetbooks: jest.fn(),
  auditHardware: jest.fn(),
  validateSoftware: jest.fn(),
  assignToStudent: jest.fn(),
  allSerialNumbers: {
    length: jest.fn(),
  },
};

mockWeb3Service.getContract.mockReturnValue(mockContract);

// Establecer por defecto que la wallet está conectada
mockWeb3Service.isWalletConnected.mockReturnValue(true);

// Mock de red y balance
mockWeb3Service.getNetwork.mockResolvedValue({ chainId: 31337 });
mockWeb3Service.getBalance.mockResolvedValue('1.0');

export default mockWeb3Service;