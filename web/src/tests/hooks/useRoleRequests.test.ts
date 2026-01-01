'use client';

// useRoleRequests.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useRoleRequests } from '@/hooks/useRoleRequests';
import * as SupplyChainContract from '@/lib/contracts/SupplyChainContract';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act } from 'react-dom/test-utils';
import { ToastProvider } from '@/components/ui/toast';

// Mock the contract functions
jest.mock('@/lib/contracts/SupplyChainContract', () => ({
  getPendingRoleRequests: jest.fn(),
  getRoleRequest: jest.fn(),
  getRoleHashes: jest.fn()
}));

// Mock the event bus
jest.mock('@/lib/events', () => ({
  eventBus: {
    on: jest.fn(),
    emit: jest.fn(),
    off: jest.fn()
  },
  EVENTS: {
    ROLE_UPDATED: 'ROLE_UPDATED',
    REFRESH_DATA: 'REFRESH_DATA'
  }
}));

// Mock the toast
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}));

// Mock the supply chain service
jest.mock('@/hooks/useSupplyChainService', () => ({
  useSupplyChainService: () => ({
    grantRoleByHash: jest.fn(),
    checkConnection: jest.fn()
  })
}));

// Test wrapper component
const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        {children}
      </ToastProvider>
    </QueryClientProvider>
  );
};

describe('useRoleRequests hook', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock getRoleHashes to return known values
    (SupplyChainContract.getRoleHashes as jest.Mock).mockResolvedValue({
      FABRICANTE: '0x01',
      AUDITOR_HW: '0x02',
      TECNICO_SW: '0x03',
      ESCUELA: '0x04',
      ADMIN: '0x05'
    });
  });

  test('should fetch pending role requests from blockchain', async () => {
    // Mock contract responses
    (SupplyChainContract.getPendingRoleRequests as jest.Mock).mockResolvedValue([1, 2]);
    
    // Mock getRoleRequest for request 1
    (SupplyChainContract.getRoleRequest as jest.Mock)
      .mockImplementation((requestId: number) => {
        if (requestId === 1) {
          return [
            '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // address
            '0x01', // roleHash (FABRICANTE)
            0, // status (pending)
            1640995200, // timestamp
            'metadata1' // metadata
          ];
        } else if (requestId === 2) {
          return [
            '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', // address
            '0x02', // roleHash (AUDITOR_HW)
            0, // status (pending)
            1640995300, // timestamp
            'metadata2' // metadata
          ];
        }
      });

    // Render the hook
    const { result } = renderHook(() => useRoleRequests(), { wrapper });
    
    // Wait for the requests to be fetched
    await waitFor(() => {
      expect(result.current.requests.length).toBeGreaterThan(0);
    });
    
    // Verify the requests were fetched from the contract
    expect(SupplyChainContract.getPendingRoleRequests).toHaveBeenCalledTimes(1);
    expect(SupplyChainContract.getRoleRequest).toHaveBeenCalledTimes(2);
    
    // Verify the data structure
    expect(result.current.requests).toHaveLength(2);
    expect(result.current.requests[0]).toMatchObject({
      id: '1',
      address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      role: 'FABRICANTE_ROLE',
      status: 'pending',
      timestamp: 1640995200000
    });
    
    expect(result.current.requests[1]).toMatchObject({
      id: '2',
      address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      role: 'AUDITOR_HW_ROLE',
      status: 'pending',
      timestamp: 1640995300000
    });
  });

  test('should handle empty pending requests', async () => {
    // Mock contract responses
    (SupplyChainContract.getPendingRoleRequests as jest.Mock).mockResolvedValue([]);
    
    // Render the hook
    const { result } = renderHook(() => useRoleRequests(), { wrapper });
    
    // Wait for the requests to be fetched
    await waitFor(() => {
      expect(result.current.requests.length).toBe(0);
    });
    
    // Verify the contract was called
    expect(SupplyChainContract.getPendingRoleRequests).toHaveBeenCalledTimes(1);
    expect(SupplyChainContract.getRoleRequest).not.toHaveBeenCalled();
    
    // Verify empty state
    expect(result.current.requests).toHaveLength(0);
  });

  test('should handle failed contract call', async () => {
    // Mock contract to throw an error
    (SupplyChainContract.getPendingRoleRequests as jest.Mock).mockRejectedValue(new Error('Contract error'));
    
    // Render the hook
    const { result } = renderHook(() => useRoleRequests(), { wrapper });
    
    // Wait for the requests to be fetched
    await waitFor(() => {
      expect(result.current.requests.length).toBe(0);
    });
    
    // Verify the contract was called
    expect(SupplyChainContract.getPendingRoleRequests).toHaveBeenCalledTimes(1);
    
    // Verify empty state on error
    expect(result.current.requests).toHaveLength(0);
  });

  test('should approve role request successfully', async () => {
    // Mock contract responses
    (SupplyChainContract.getPendingRoleRequests as jest.Mock).mockResolvedValue([1]);
    (SupplyChainContract.getRoleRequest as jest.Mock).mockResolvedValue([
      '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      '0x01',
      0,
      1640995200,
      'metadata1'
    ]);
    
    // Mock supply chain service
    const mockGrantRoleByHash = jest.fn().mockResolvedValue({
      success: true,
      hash: '0x123'
    });
    
    jest.spyOn(require('@/hooks/useSupplyChainService'), 'useSupplyChainService').mockReturnValue({
      grantRoleByHash: mockGrantRoleByHash,
      checkConnection: jest.fn().mockResolvedValue(true)
    });
    
    // Render the hook
    const { result } = renderHook(() => useRoleRequests(), { wrapper });
    
    // Wait for data to load
    await waitFor(() => {
      expect(result.current.requests.length).toBeGreaterThan(0);
    });
    
    // Execute approve mutation
    await act(async () => {
      await result.current.approveMutation.mutateAsync({
        requestId: '1',
        role: 'FABRICANTE_ROLE',
        userAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
      });
    });
    
