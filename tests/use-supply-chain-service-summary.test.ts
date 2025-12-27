import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSupplyChainService } from '@/hooks/useSupplyChainService';
import { readContract } from '@wagmi/core';

// Mock @wagmi/core
vi.mock('@wagmi/core', () => ({
  readContract: vi.fn(),
  getAccount: vi.fn(() => ({ address: '0x1234567890123456789012345678901234567890' })),
  simulateContract: vi.fn()
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock roleUtils
vi.mock('@/lib/roleUtils', () => ({
  getRoleHashes: vi.fn(() => ({
    ADMIN: '0x123...',
    FABRICANTE: '0x456...',
    AUDITOR_HW: '0x789...',
    TECNICO_SW: '0xabc...',
    ESCUELA: '0xdef...'
  }))
}));

// Mock services
vi.mock('@/services/SupplyChainService', () => ({
  getAllMembers: vi.fn()
}));

// Mock wagmi config
vi.mock('@/lib/wagmi/config', () => ({
  config: {}
}));

describe('useSupplyChainService - getAllRolesSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get all roles summary from contract when no cache available', async () => {
    // Arrange
    const { getAllRolesSummary } = useSupplyChainService();
    
    // Mock localStorage with no cache
    localStorageMock.getItem.mockReturnValue(null);
    
    // Mock getAllMembers to return members
    const { getAllMembers } = require('@/services/SupplyChainService');
    getAllMembers.mockResolvedValue(['0x123', '0x456']);
    
    // Act
    const summary = await getAllRolesSummary();
    
    // Assert
    expect(summary).toBeDefined();
    expect(summary.DEFAULT_ADMIN_ROLE.count).toBe(2);
    expect(summary.FABRICANTE_ROLE.count).toBe(2);
    expect(summary.AUDITOR_HW_ROLE.count).toBe(2);
    expect(summary.TECNICO_SW_ROLE.count).toBe(2);
    expect(summary.ESCUELA_ROLE.count).toBe(2);
    // Verify cache was set
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should use cached data when available and not expired', async () => {
    // Arrange
    const { getAllRolesSummary } = useSupplyChainService();
    
    // Create mock cached data
    const mockCachedData = {
      data: {
        DEFAULT_ADMIN_ROLE: { count: 5, members: ['0x1', '0x2', '0x3', '0x4', '0x5'] },
        FABRICANTE_ROLE: { count: 3, members: ['0x6', '0x7', '0x8'] },
        AUDITOR_HW_ROLE: { count: 2, members: ['0x9', '0xa'] },
        TECNICO_SW_ROLE: { count: 4, members: ['0xb', '0xc', '0xd', '0xe'] },
        ESCUELA_ROLE: { count: 1, members: ['0xf'] }
      },
      timestamp: Date.now()
    };
    
    // Mock localStorage with valid cache
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockCachedData));
    
    // Act
    const summary = await getAllRolesSummary();
    
    // Assert
    expect(summary).toEqual(mockCachedData.data);
    // Verify contract method was not called
    const { getAllMembers } = require('@/services/SupplyChainService');
    expect(getAllMembers).not.toHaveBeenCalled();
  });

  it('should fetch fresh data when cache is expired', async () => {
    // Arrange
    const { getAllRolesSummary } = useSupplyChainService();
    
    // Create expired cache (5 minutes ago)
    const expiredTimestamp = Date.now() - 6 * 60 * 1000; // 6 minutes ago
    const expiredCache = {
      data: {
        DEFAULT_ADMIN_ROLE: { count: 1, members: ['0x1'] }
      },
      timestamp: expiredTimestamp
    };
    
    // Mock localStorage with expired cache
    localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredCache));
    
    // Mock getAllMembers to return members
    const { getAllMembers } = require('@/services/SupplyChainService');
    getAllMembers.mockResolvedValue(['0x123', '0x456']);
    
    // Act
    const summary = await getAllRolesSummary();
    
    // Assert
    expect(summary).toBeDefined();
    expect(summary.DEFAULT_ADMIN_ROLE.count).toBe(2);
    // Verify cache was updated
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should handle errors when fetching role members', async () => {
    // Arrange
    const { getAllRolesSummary } = useSupplyChainService();
    
    // Mock localStorage with no cache
    localStorageMock.getItem.mockReturnValue(null);
    
    // Mock getAllMembers to throw error
    const { getAllMembers } = require('@/services/SupplyChainService');
    getAllMembers.mockRejectedValue(new Error('Network error'));
    
    // Act
    const summary = await getAllRolesSummary();
    
    // Assert
    expect(summary).toBeDefined();
    // All roles should have 0 members due to error
    expect(summary.DEFAULT_ADMIN_ROLE.count).toBe(0);
    expect(summary.FABRICANTE_ROLE.count).toBe(0);
    expect(summary.AUDITOR_HW_ROLE.count).toBe(0);
    expect(summary.TECNICO_SW_ROLE.count).toBe(0);
    expect(summary.ESCUELA_ROLE.count).toBe(0);
  });
});