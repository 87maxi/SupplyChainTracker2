import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRoleRequests } from '@/hooks/useRoleRequests';
import { fetch } from 'undici';

// Mock @tanstack/react-query
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn()
}));

// Mock useSupplyChainService
vi.mock('@/hooks/useSupplyChainService', () => ({
  useSupplyChainService: vi.fn(() => ({
    grantRole: vi.fn()
  }))
}));

// Mock useToast
vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn()
  }))
}));

// Mock @wagmi/core
vi.mock('@wagmi/core', () => ({
  waitForTransactionReceipt: vi.fn()
}));

// Mock events
vi.mock('@/lib/events', () => ({
  eventBus: {
    emit: vi.fn()
  },
  EVENTS: {
    ROLE_UPDATED: 'role_updated'
  }
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock fetch API
vi.stubGlobal('fetch', fetch);

// Setup mocks before each test
describe('useRoleRequests', () => {
  const mockQueryClient = {
    cancelQueries: vi.fn(),
    getQueryData: vi.fn(),
    setQueryData: vi.fn(),
    invalidateQueries: vi.fn()
  };
  
  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock useQueryClient
    vi.mocked(useQueryClient).mockReturnValue(mockQueryClient);
    
    // Mock localStorage
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
    
    // Mock useQuery to return empty requests
    vi.mocked(useQuery).mockReturnValue({
      data: [],
      isLoading: false,
      refetch: vi.fn()
    });
  });

  it('should initialize with empty processed IDs when no localStorage data', () => {
    // Arrange
    localStorageMock.getItem.mockReturnValue(null);
    
    // Act
    const { requests } = useRoleRequests();
    
    // Assert
    expect(localStorage.getItem).toHaveBeenCalledWith('processed_request_ids');
    expect(requests).toEqual([]);
  });

  it('should load processed IDs from localStorage', () => {
    // Arrange
    const processedIds = ['req-123', 'req-456'];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(processedIds));
    
    // Act
    const { requests } = useRoleRequests();
    
    // Assert
    expect(JSON.parse(localStorageMock.getItem('processed_request_ids'))).toEqual(processedIds);
    expect(requests).toEqual([]);
  });

  it('should filter out processed requests', () => {
    // Arrange
    const processedIds = ['req-123'];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(processedIds));
    
    vi.mocked(useQuery).mockReturnValue({
      data: [
        { id: 'req-123', status: 'pending' }, // Should be filtered out
        { id: 'req-456', status: 'pending' }  // Should remain
      ],
      isLoading: false,
      refetch: vi.fn()
    });
    
    // Act
    const { requests } = useRoleRequests();
    
    // Assert
    expect(requests).toHaveLength(1);
    expect(requests[0].id).toBe('req-456');
  });

  it('should approve request and call grantRole with normalized role', async () => {
    // Arrange
    const mockGrantRole = vi.fn().mockResolvedValue({
      success: true,
      hash: '0xdeadbeef'
    });
    
    vi.mocked(useSupplyChainService).mockReturnValue({
      grantRole: mockGrantRole
    });
    
    vi.mocked(useQuery).mockReturnValue({
      data: [{ id: 'req-123', role: 'FABRICANTE_ROLE', userAddress: '0x123' }],
      isLoading: false,
      refetch: vi.fn()
    });
    
    // Act
    const { approveRequest } = useRoleRequests();
    const success = await approveRequest('req-123', 'FABRICANTE_ROLE', '0x123');
    
    // Assert
    expect(success).toBe(true);
    expect(mockGrantRole).toHaveBeenCalledWith('FABRICANTE', '0x123'); // Role should be normalized
    expect(localStorage.setItem).toHaveBeenCalledWith('processed_request_ids', '["req-123"]');
  });

  it('should handle approval failure gracefully', async () => {
    // Arrange
    const mockGrantRole = vi.fn().mockRejectedValue(new Error('Transaction reverted'));
    
    vi.mocked(useSupplyChainService).mockReturnValue({
      grantRole: mockGrantRole
    });
    
    vi.mocked(useQuery).mockReturnValue({
      data: [{ id: 'req-123', role: 'FABRICANTE_ROLE', userAddress: '0x123' }],
      isLoading: false,
      refetch: vi.fn()
    });
    
    // Act
    const { approveRequest } = useRoleRequests();
    const success = await approveRequest('req-123', 'FABRICANTE_ROLE', '0x123');
    
    // Assert
    expect(success).toBe(false);
    expect(mockGrantRole).toHaveBeenCalledWith('FABRICANTE', '0x123');
    expect(localStorage.setItem).toHaveBeenCalledWith('processed_request_ids', '["req-123"]');
  });

  it('should reject request and delete from server', async () => {
    // Arrange
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn()
    });
    
    vi.mocked(useQuery).mockReturnValue({
      data: [{ id: 'req-123', role: 'FABRICANTE_ROLE', userAddress: '0x123' }],
      isLoading: false,
      refetch: vi.fn()
    });
    
    // Act
    const { rejectRequest } = useRoleRequests();
    const success = await rejectRequest('req-123');
    
    // Assert
    expect(success).toBe(true);
    expect(fetch).toHaveBeenCalledWith('/api/role-requests/req-123/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'rejected' })
    });
    expect(localStorage.setItem).toHaveBeenCalledWith('processed_request_ids', '["req-123"]');
  });

  it('should delete request', async () => {
    // Arrange
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn()
    });
    
    vi.mocked(useQuery).mockReturnValue({
      data: [{ id: 'req-123', role: 'FABRICANTE_ROLE', userAddress: '0x123' }],
      isLoading: false,
      refetch: vi.fn()
    });
    
    // Act
    const { deleteRequest } = useRoleRequests();
    const success = await deleteRequest('req-123');
    
    // Assert
    expect(success).toBe(true);
    expect(fetch).toHaveBeenCalledWith('/api/role-requests/req-123', {
      method: 'DELETE'
    });
    expect(localStorage.setItem).toHaveBeenCalledWith('processed_request_ids', '["req-123"]');
  });
});