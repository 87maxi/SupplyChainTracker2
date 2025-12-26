// web/src/services/contracts/__tests__/role.service.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RoleService } from '../role.service';
import { getRoleHashes } from '@/lib/roleUtils';
import { CacheService } from '@/lib/cache/cache-service';
import { ErrorHandler } from '@/lib/errors/error-handler';

// Mocks
vi.mock('@/lib/roleUtils', () => ({
  getRoleHashes: vi.fn()
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

// Datos de prueba
const mockUserAddress = '0x1234567890123456789012345678901234567890' as `0x${string}`;
const mockAdminRoleHash = '0x1234567890123456789012345678901234567890123456789012345678901234';
const mockFabricanteRoleHash = '0x2345678901234567890123456789012345678901234567890123456789012345';
const mockAuditorRoleHash = '0x3456789012345678901234567890123456789012345678901234567890123456';
const mockTecnicoRoleHash = '0x4567890123456789012345678901234567890123456789012345678901234567';
const mockEscuelaRoleHash = '0x5678901234567890123456789012345678901234567890123456789012345678';

const mockTransactionHash = '0x1234567890123456789012345678901234567890123456789012345678901234' as `0x${string}`;

const mockRoleHashes = {
  ADMIN: mockAdminRoleHash,
  FABRICANTE: mockFabricanteRoleHash,
  AUDITOR_HW: mockAuditorRoleHash,
  TECNICO_SW: mockTecnicoRoleHash,
  ESCUELA: mockEscuelaRoleHash
};

const mockMembers = [
  '0x1234567890123456789012345678901234567890',
  '0x2345678901234567890123456789012345678901',
  '0x3456789012345678901234567890123456789012'
];

const mockAllRolesSummary = {
  'DEFAULT_ADMIN_ROLE': {
    role: 'DEFAULT_ADMIN_ROLE',
    members: mockMembers,
    count: mockMembers.length
  },
  'FABRICANTE_ROLE': {
    role: 'FABRICANTE_ROLE',
    members: mockMembers,
    count: mockMembers.length
  },
  'AUDITOR_HW_ROLE': {
    role: 'AUDITOR_HW_ROLE',
    members: mockMembers,
    count: mockMembers.length
  },
  'TECNICO_SW_ROLE': {
    role: 'TECNICO_SW_ROLE',
    members: mockMembers,
    count: mockMembers.length
  },
  'ESCUELA_ROLE': {
    role: 'ESCUELA_ROLE',
    members: mockMembers,
    count: mockMembers.length
  }
};

describe('RoleService', () => {
  let service: RoleService;

  beforeEach(() => {
    service = new RoleService();
    
    // Resetear mocks
    vi.clearAllMocks();
    
    // Configurar mocks por defecto
    vi.mocked(service['read']).mockResolvedValue(undefined);
    vi.mocked(service['write']).mockResolvedValue({ hash: mockTransactionHash });
    vi.mocked(service['waitForTransaction']).mockResolvedValue({ status: 'success' });
    
    // Mock predeterminado de getRoleHashes
    vi.mocked(getRoleHashes).mockResolvedValue(mockRoleHashes);
  });

  describe('hasRole', () => {
    it('should return true when user has role', async () => {
      vi.mocked(service['read']).mockResolvedValue(true);
      
      const result = await service.hasRole('DEFAULT_ADMIN_ROLE', mockUserAddress);
      
      expect(result).toBe(true);
      expect(getRoleHashes).toHaveBeenCalled();
      expect(service['read']).toHaveBeenCalledWith(
        'hasRole',
        [mockAdminRoleHash, mockUserAddress]
      );
    });

    it('should return false when user does not have role', async () => {
      vi.mocked(service['read']).mockResolvedValue(false);
      
      const result = await service.hasRole('FABRICANTE_ROLE', mockUserAddress);
      
      expect(result).toBe(false);
      expect(getRoleHashes).toHaveBeenCalled();
      expect(service['read']).toHaveBeenCalledWith(
        'hasRole',
        [mockFabricanteRoleHash, mockUserAddress]
      );
    });

    it('should throw error when role not found', async () => {
      // Mock para que getRoleHashes devuelva un objeto sin la clave necesaria
      vi.mocked(getRoleHashes).mockResolvedValue({} as any);
      
      await expect(service.hasRole('DEFAULT_ADMIN_ROLE', mockUserAddress))
        .rejects
        .toThrow('Rol DEFAULT_ADMIN_ROLE no encontrado');
      
      expect(getRoleHashes).toHaveBeenCalled();
      expect(service['read']).not.toHaveBeenCalled();
    });

    it('should handle contract errors', async () => {
      const mockError = new Error('Contract error');
      vi.mocked(service['read']).mockRejectedValue(mockError);
      
      vi.mocked(ErrorHandler.handleWeb3Error).mockReturnValue(mockError);
      
      await expect(service.hasRole('DEFAULT_ADMIN_ROLE', mockUserAddress))
        .rejects
        .toBe(mockError);
      
      expect(service['read']).toHaveBeenCalledWith(
        'hasRole',
        [mockAdminRoleHash, mockUserAddress]
      );
    });
  });

  describe('grantRole', () => {
    it('should grant role successfully', async () => {
      const result = await service.grantRole('ESCUELA_ROLE', mockUserAddress);
      
      expect(result).toEqual({
        success: true,
        hash: mockTransactionHash