import Web3Service from '@/services/Web3Service';

// Mock del objeto window y ethereum
beforeAll(() => {
  // Crear un mock básico de ethereum
  const mockEthereum = {
    request: jest.fn(),
    on: jest.fn(),
    removeListener: jest.fn(),
  };

  // Agregar ethereum al objeto global
  Object.defineProperty(global, 'window', {
    value: {
      ethereum: mockEthereum,
    },
    writable: true,
  });
});

describe('Web3Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize provider when ethereum is available', () => {
    expect(Web3Service['provider']).toBeDefined();
  });

  it('should connect wallet and return account address', async () => {
    // Mock para eth_requestAccounts
    (window as any).ethereum.request.mockResolvedValue(['0x1234567890123456789012345678901234567890']);
    
    const address = await Web3Service.connectWallet();
    
    expect(address).toBe('0x1234567890123456789012345678901234567890');
    expect(Web3Service.isWalletConnected()).toBe(true);
  });

  it('should throw error when connecting wallet with no provider', async () => {
    // Guardar referencia al proveedor actual
    const originalProvider = Web3Service['provider'];
    // Eliminar el proveedor temporalmente
    Web3Service['provider'] = null;
    
    await expect(Web3Service.connectWallet()).rejects.toThrow('Web3 provider not available');
    
    // Restaurar el proveedor
    Web3Service['provider'] = originalProvider;
  });

  it('should get signer when wallet is connected', async () => {
    // Primero conectamos la wallet
    (window as any).ethereum.request.mockResolvedValue(['0x1234567890123456789012345678901234567890']);
    await Web3Service.connectWallet();
    
    const signer = Web3Service.getSigner();
    expect(signer).toBeDefined();
  });

  it('should throw error when getting signer with no wallet connection', () => {
    // Desconectar temporalmente
    const originalSigner = Web3Service['signer'];
    Web3Service['signer'] = null;
    
    expect(() => Web3Service.getSigner()).toThrow('Wallet not connected');
    
    // Restaurar
    Web3Service['signer'] = originalSigner;
  });

  it('should get provider', () => {
    const provider = Web3Service.getProvider();
    expect(provider).toBeDefined();
  });

  it('should throw error when getting provider with no provider', () => {
    // Guardar y eliminar proveedor temporalmente
    const originalProvider = Web3Service['provider'];
    Web3Service['provider'] = null;
    
    expect(() => Web3Service.getProvider()).toThrow('Web3 provider not available');
    
    // Restaurar
    Web3Service['provider'] = originalProvider;
  });

  it('should check wallet connection status', () => {
    expect(Web3Service.isWalletConnected()).toBe(false);
    
    // Conectar wallet
    (window as any).ethereum.request.mockResolvedValue(['0x1234567890123456789012345678901234567890']);
    Web3Service.connectWallet();
    
    // El estado de conexión se actualiza después de conectar
    expect(Web3Service.isWalletConnected()).toBe(true);
  });

  it('should get network information', async () => {
    // Mock del método getNetwork del provider
    const mockProvider = {
      getNetwork: jest.fn().mockResolvedValue({
        name: 'hardhat',
        chainId: 31337
      })
    };
    
    // Reemplazar el provider temporalmente
    Web3Service['provider'] = mockProvider as any;
    
    const network = await Web3Service.getNetwork();
    expect(network.chainId).toBe(31337);
    expect(network.name).toBe('hardhat');
  });

  it('should get account balance', async () => {
    // Mock del método getBalance del provider
    const mockProvider = {
      getBalance: jest.fn().mockResolvedValue('1000000000000000000'), // 1 ETH
      getNetwork: jest.fn()
    };
    
    // Reemplazar el provider temporalmente
    Web3Service['provider'] = mockProvider as any;
    
    const balance = await Web3Service.getBalance('0x1234567890123456789012345678901234567890');
    expect(balance).toBe('1.0');
  });
});