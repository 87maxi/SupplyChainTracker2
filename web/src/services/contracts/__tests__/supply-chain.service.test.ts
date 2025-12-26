// web/src/services/contracts/__tests__/supply-chain.service.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupplyChainService } from '../supply-chain.service';
import { SupplyChainService as OldSupplyChainService } from '@/services/SupplyChainService';
import { truncateAddress } from '@/lib/utils';
import { CacheService } from '@/lib/cache/cache-service';
import { ErrorHandler } from '@/lib/errors/error-handler';

// Mocks
vi.mock('@/services/SupplyChainService', () => ({
  registerNetbooks: vi.fn(),
  auditHardware: vi.fn(),
  validateSoftware: vi.fn(),
  assignToStudent: vi.fn(),
  getNetbookState: vi.fn(),
  getNetbookReport: vi.fn(),
  getAllSerialNumbers: vi.fn()
}));

vi.mock('@/lib/utils', () => ({
  truncateAddress: vi.fn().mockImplementation(address => address.slice(0, 8))
}));

vi.mock('@/lib/cache/cache-service', () => ({
  CacheService: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
    clear: vi
  }
}));

vi.mock('@/lib/errors/error-handler', () => ({
  ErrorHandler: {
    handleWeb3Error: vi.fn()
  }
}));

// Mock para zod para validación
const mockParse = vi.fn();
vi.mock('zod', () => ({
  object: vi.fn().mockReturnThis(),
  array: vi.fn().mockReturnThis(),
  string: vi.fn().mockReturnThis(),
  min: vi.fn().mockReturnThis(),
  max: vi.fn().mockReturnThis(),
  regex: vi.fn().mockReturnThis(),
  refine: vi.fn().mockReturnThis(),
  enum: vi.fn().mockReturnThis(),
  describe: vi.fn().mockReturnThis(),
  infer: vi.fn(),
  z: {
    object: vi.fn().mockReturnThis(),
    array: vi.fn().mockReturnThis(),
    string: vi.fn().mockReturnThis(),
    min: vi.fn().mockReturnThis(),
    max: vi.fn().mockReturnThis(),
    regex: vi.fn().mockReturnThis(),
    refine: vi.fn().mockReturnThis(),
    enum: vi.fn().mockReturnThis(),
    describe: vi.fn().mockReturnThis(),
    infer: vi.fn()
  },
  // Mock del parse para todas las validaciones
  ZodSchema: class {
    parse = mockParse;
  },
  // Mock de los schemas directamente
  RegisterNetbooksSchema: {
    parse: mockParse
  },
  AuditHardwareSchema: {
    parse: mockParse
  },
  ValidateSoftwareSchema: {
    parse: mockParse
  },
  AssignToStudentSchema: {
    parse: mockParse
  }
}));

// Datos de prueba
const mockSerials = ['NB-001', 'NB-002'];
const mockBatches = ['BATCH-001', 'BATCH-002'];
const mockSpecs = ['SPEC-001', 'SPEC-002'];
const mockReportHash = '0x1234567890123456789012345678901234567890123456789012345678901234';
const mockOsVersion = '1.0.0';
const mockSchoolHash = '0x5678901234567890123456789012345678901234567890123456789012345678';
const mockStudentHash = '0x9012345678901234567890123456789012345678901234567890123456789012';

const mockTransactionHash = '0x1234567890123456789012345678901234567890123456789012345678901234' as `0x${string}`;

const mockNetbook = {
  serialNumber: 'NB-001',
  batchId: 'BATCH-001',
  initialModelSpecs: 'SPEC-001',
  hwAuditor: '0x1234567890123456789012345678901234567890',
  hwIntegrityPassed: true,
  hwReportHash: mockReportHash,
  swTechnician: '0x2345678901234567890123456789012345678901',
  osVersion: '1.0.0',
  swValidationPassed: true,
  destinationSchoolHash: mockSchoolHash,
  studentIdHash: mockStudentHash,
  distributionTimestamp: '1700000000',
  currentState: 'DISTRIBUIDA'
};

const mockState = 3; // DISTRIBUIDA
const mockStates = ['FABRICADA', 'HW_APROBADO', 'SW_VALIDADO', 'DISTRIBUIDA'];

// Mock del servicio
const mockService = {};
vi.mock('../base-contract.service', () => ({
  BaseContractService: class {
    protected publicClient = {
      readContract: vi.fn(),
      waitForTransactionReceipt: vi.fn()
    };
    
    protected walletClient = {
      writeContract: vi.fn()
    };
    
    protected read = vi.fn();
    protected write = vi.fn();
    protected waitForTransaction = vi.fn();
    protected invalidateCache = vi.fn();
    
    constructor() {}
  }
}));

describe('SupplyChainService', () => {
  let service: SupplyChainService;

  beforeEach(() => {
    service = new SupplyChainService();
    
    // Resetear mocks
    vi.clearAllMocks();
    
    // Configurar mocks por defecto
    vi.mocked(service['read']).mockResolvedValue(undefined);
    vi.mocked(service['write']).mockResolvedValue({ hash: mockTransactionHash });
    vi.mocked(service['waitForTransaction']).mockResolvedValue({ status: 'success' });
  });

  describe('registerNetbooks', () => {
    it('should register multiple netbooks successfully', async () => {
      // Configurar mocks
      mockParse.mockReturnValue(undefined); // Validación exitosa
      vi.mocked(service['write']).mockResolvedValue({ hash: mockTransactionHash });
      vi.mocked(service['waitForTransaction']).mockResolvedValue({ status: 'success' });
      
      const result = await service.registerNetbooks(mockSerials, mockBatches, mockSpecs);
      
      expect(result).toEqual({
        success: true,
        hash: mockTransactionHash
      });
      
      // Verificar que se llamó a write con los argumentos correctos
      expect(service['write']).toHaveBeenCalledWith(
        'registerNetbooks', 
        [mockSerials, mockBatches, mockSpecs]
      );
      
      // Verificar que se esperó la confirmación
      expect(service['waitForTransaction']).toHaveBeenCalledWith(mockTransactionHash);
      
      // Verificar que se invalidó la caché
      expect(service['invalidateCache']).toHaveBeenCalledWith('getNetbook');
      expect(service['invalidateCache']).toHaveBeenCalledWith('getAllSerialNumbers');
    });

    it('should return error when validation fails', async () => {
      // Configurar mock para que la validación falle
      const validationError = new Error('Validation failed');
      mockParse.mockImplementation(() => { throw validationError; });
      
      const result = await service.registerNetbooks(mockSerials, mockBatches, mockSpecs