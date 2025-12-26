// web/src/services/contracts/__tests__/base-contract.service.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BaseContractService } from '../base-contract.service';
import { PublicClient, WalletClient } from 'viem';
import { config } from '@/lib/wagmi/config';
import { CacheService } from '@/lib/cache/cache-service';
import { ErrorHandler } from '@/lib/errors/error-handler';

// Mocks
vi.mock('@/lib/wagmi/config', () => ({
  config: {
    publicClient: {
      readContract: vi.fn(),
      waitForTransactionReceipt: vi.fn()
    },
    getClient: vi.fn()
  }
}));

vi.mock('@/lib/cache/cache-service', () => ({
  CacheService: {
    get: vi.fn(),
    set: vi.fn()
  }
}));

vi.mock('@/lib/errors/error-handler', () => ({
  ErrorHandler: {
    handleWeb3Error: vi.fn()
  }
}));

// Datos de prueba
const mockContractAddress = '0x1234567890123456789012345678901234567890' as `0x${string}`;
const mockAbi = [{ name: 'testFunction', type: 'function' }];
const mockCachePrefix = 'test';

// Mock para el wallet client
const mockWalletClient = {
  writeContract: vi.fn()
};

// Configurar el mock de getClient para devolver el wallet client
vi.mocked(config.getClient).mockReturnValue(mockWalletClient);

// Configurar el mock de handleWeb3Error para devolver el error original
vi.mocked(ErrorHandler.handleWeb3Error).mockImplementation(error => error);

// Servicio mockeado para pruebas
class TestContractService extends BaseContractService {
  constructor() {
    super(mockContractAddress, mockAbi, mockCachePrefix);
  }

  // Métodos públicos para testear métodos protegidos
  public async testRead<T>(fn: string, args: any[] = [], useCache: boolean = true): Promise<T> {
    return this.read(fn, args, useCache);
  }

  public async testWrite(fn: string, args: any[] = []): Promise<{ hash: `0x${string}` }> {
    return this.write(fn, args);
  }
}

describe('BaseContractService', () => {
  let service: TestContractService;

  beforeEach(() => {
    service = new TestContractService();
    
    // Resetear mocks
    vi.clearAllMocks();
  });

  describe('read', () => {
    it('should read from contract and cache result when cache miss', async () => {
      const mockResult = { data: 'test' };
      
      // Configurar el mock de readContract
      vi.mocked(config.publicClient.readContract).mockResolvedValue(mockResult);
      
      // Configurar el mock de CacheService.get para simular cache miss
      vi.mocked(CacheService.get).mockReturnValue(null);
      
      const result = await service.testRead('testFunction', ['arg1'], true);
      
      expect(result).toEqual(mockResult);
      expect(CacheService.get).toHaveBeenCalledWith('test:testFunction:["arg1"]');
      expect(config.publicClient.readContract).toHaveBeenCalledWith({
        address: mockContractAddress,
        abi: mockAbi,
        functionName: 'testFunction',
        args: ['arg1']
      });
      expect(CacheService.set).toHaveBeenCalledWith('test:testFunction:["arg1"]', mockResult);
    });

    it('should return cached result when cache hit', async () => {
      const mockCachedResult = { data: 'cached' };
      
      // Configurar el mock de CacheService.get para simular cache hit
      vi.mocked(CacheService.get).mockReturnValue(mockCachedResult);
      
      const result = await service.testRead('testFunction', ['arg1'], true);
      
      expect(result).toEqual(mockCachedResult);
      expect(CacheService.get).toHaveBeenCalledWith('test:testFunction:["arg1"]');
      expect(config.publicClient.readContract).not.toHaveBeenCalled();
      expect(CacheService.set).not.toHaveBeenCalled();
    });

    it('should not use cache when disabled', async () => {
      const mockResult = { data: 'test' };
      
      // Configurar el mock de readContract
      vi.mocked(config.publicClient.readContract).mockResolvedValue(mockResult);
      
      const result = await service.testRead('testFunction', ['arg1'], false);
      
      expect(result).toEqual(mockResult);
      expect(CacheService.get).not.toHaveBeenCalled();
      expect(CacheService.set).not.toHaveBeenCalled();
    });

    it('should handle errors and throw AppError', async () => {
      const mockError = new Error('Contract error');
      
      // Configurar el mock de readContract para lanzar un error
      vi.mocked(config.publicClient.readContract).mockRejectedValue(mockError);
      
      // Configurar el mock de handleWeb3Error para devolver el error original
      vi.mocked(ErrorHandler.handleWeb3Error).mockReturnValue(mockError);
      
      await expect(service.testRead('testFunction'))
        .rejects
        .toBe(mockError);
      
      expect(ErrorHandler.handleWeb3Error).toHaveBeenCalledWith(mockError);
    });
  });

  describe('write', () => {
    it('should write to contract and return hash', async () => {
      const mockHash = '0x123' as `0x${string}`;
      
      // Configurar el mock de writeContract
      vi.mocked(mockWalletClient.writeContract).mockResolvedValue(mockHash);
      
      const result = await service.testWrite('testFunction', ['arg1']);
      
      expect(result).toEqual({ hash: mockHash });
      expect(mockWalletClient.writeContract).toHaveBeenCalledWith({
        address: mockContractAddress,
        abi: mockAbi,
        functionName: 'testFunction',
        args: ['arg1']
      });
    });

    it('should throw error when wallet client is not available', async () => {
      // Crear una instancia del servicio sin wallet client
      const noWalletConfig = {
        publicClient: config.publicClient,
        getClient: vi.fn().mockReturnValue(undefined)
      };
      
      vi.mocked(config.getClient).mockReturnValue(undefined);
      
      // Reemplazar temporalmente el config
      const originalConfig = global.config;
      global.config = noWalletConfig;
      
      const serviceWithoutWallet = new TestContractService();
      
      await expect(serviceWithoutWallet.testWrite('testFunction'))
        .rejects
        .toThrow('No hay conexión con la wallet');
      
      // Restaurar el config original
      global.config = originalConfig;
    });

    it('should handle write errors and throw AppError', async () => {
      const mockError = new Error('Write error');
      
      // Configurar el mock de writeContract para lanzar un error
      vi.mocked(mockWalletClient.writeContract).mockRejectedValue(mockError);
      
      // Configurar el mock de handleWeb3Error para devolver el error original
      vi.mocked(ErrorHandler.handleWeb3Error).mockReturnValue(mockError);
      
      await expect(service.testWrite('testFunction'))
        .rejects
        .toBe(mockError);
      
      expect(ErrorHandler.handleWeb3Error).toHaveBeenCalledWith(mockError);
    });
  });

  describe('waitForTransaction', () => {
    it('should wait for transaction receipt', async () => {
      const mockHash = '0x123' as `0x${string}`;
      const mockReceipt = { transactionHash: mockHash };
      
      // Configurar el mock de waitForTransactionReceipt
      vi.mocked(config.publicClient.waitForTransactionReceipt).mockResolvedValue(mockReceipt);
      
      const result = await service['waitForTransaction'](mockHash);
      
      expect(result).toEqual(mockReceipt);
      expect(config.publicClient.waitForTransactionReceipt).toHaveBeenCalledWith({
        hash: mockHash,
        timeout: 60
      });
    });

    it('should handle wait errors and throw AppError', async () => {
      const mockError = new Error('Wait error');
      const mockHash = '0