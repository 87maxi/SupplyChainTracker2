import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Web3Provider } from '@/contexts/Web3Context';
import { PendingRoleRequests } from '@/app/admin/components/PendingRoleRequests';
import { useRoleRequests } from '@/hooks/useRoleRequests';
import { useWeb3 } from '@/hooks/useWeb3';
import { useToast } from '@/hooks/use-toast';

// Mock the hooks
vi.mock('@/hooks/useRoleRequests', () => ({
  useRoleRequests: vi.fn()
}));

vi.mock('@/hooks/useWeb3', () => ({
  useWeb3: vi.fn()
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn()
  }))
}));

// Mock the components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children }) => <div data-testid="card">{children}</div>,
  CardHeader: ({ children }) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }) => <h2 data-testid="card-title">{children}</h2>,
  CardContent: ({ children }) => <div data-testid="card-content">{children}</div>
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled }) => (
    <button data-testid="button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant }) => (
    <span data-testid="badge" data-variant={variant}>{children}</span>
  )
}));

// Create a wrapper component for providers
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  });

  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <Web3Provider>{children}</Web3Provider>
    </QueryClientProvider>
  );
};

describe('PendingRoleRequests', () => {
  const wrapper = createWrapper();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state when requests are loading', () => {
    // Arrange
    (useRoleRequests as any).mockReturnValue({
      requests: [],
      loading: true,
      approveRequest: vi.fn(),
      rejectRequest: vi.fn(),
      reload: vi.fn()
    });

    // Act
    render(<PendingRoleRequests />, { wrapper });

    // Assert
    expect(screen.getByText('Cargando solicitudes...')).toBeInTheDocument();
  });

  it('should render no pending requests message when there are no pending requests', () => {
    // Arrange
    (useRoleRequests as any).mockReturnValue({
      requests: [],
      loading: false,
      approveRequest: vi.fn(),
      rejectRequest: vi.fn(),
      reload: vi.fn()
    });

    // Act
    render(<PendingRoleRequests />, { wrapper });

    // Assert
    expect(screen.getByText('No hay solicitudes pendientes')).toBeInTheDocument();
    expect(screen.getByText('Todas las solicitudes han sido procesadas. ¡Buen trabajo!')).toBeInTheDocument();
  });

  it('should render pending requests when there are requests with status pending', () => {
    // Arrange
    const mockRequests = [
      {
        id: '1',
        address: '0x1234567890123456789012345678901234567890',
        role: 'FABRICANTE',
        status: 'pending',
        timestamp: new Date().toISOString()
      }
    ];

    (useRoleRequests as any).mockReturnValue({
      requests: mockRequests,
      loading: false,
      approveRequest: vi.fn(),
      rejectRequest: vi.fn(),
      reload: vi.fn()
    });

    // Act
    render(<PendingRoleRequests />, { wrapper });

    // Assert
    expect(screen.getByText('Solicitudes Pendientes')).toBeInTheDocument();
    expect(screen.getByText('0x1234...7890')).toBeInTheDocument();
    expect(screen.getByText('Fabricante')).toBeInTheDocument();
  });

  it('should call approveRequest when approve button is clicked', async () => {
    // Arrange
    const mockRequests = [
      {
        id: '1',
        address: '0x1234567890123456789012345678901234567890',
        role: 'FABRICANTE',
        status: 'pending',
        timestamp: new Date().toISOString()
      }
    ];

    const mockApproveRequest = vi.fn().mockResolvedValue(true);

    (useRoleRequests as any).mockReturnValue({
      requests: mockRequests,
      loading: false,
      approveRequest: mockApproveRequest,
      rejectRequest: vi.fn(),
      reload: vi.fn()
    });

    // Act
    render(<PendingRoleRequests />, { wrapper });
    const approveButton = screen.getByText('Aprobar');
    approveButton.click();

    // Assert
    await waitFor(() => {
      expect(mockApproveRequest).toHaveBeenCalledWith(
        '1',
        'FABRICANTE',
        '0x1234567890123456789012345678901234567890'
      );
    });
  });

  it('should call rejectRequest when reject button is clicked', async () => {
    // Arrange
    const mockRequests = [
      {
        id: '1',
        address: '0x1234567890123456789012345678901234567890',
        role: 'FABRICANTE',
        status: 'pending',
        timestamp: new Date().toISOString()
      }
    ];

    const mockRejectRequest = vi.fn().mockResolvedValue(true);

    (useRoleRequests as any).mockReturnValue({
      requests: mockRequests,
      loading: false,
      approveRequest: vi.fn(),
      rejectRequest: mockRejectRequest,
      reload: vi.fn()
    });

    // Act
    render(<PendingRoleRequests />, { wrapper });
    const rejectButton = screen.getByText('Rechazar');
    rejectButton.click();

    // Assert
    await waitFor(() => {
      expect(mockRejectRequest).toHaveBeenCalledWith('1');
    });
  });

  it('should show recently processed requests after approval', async () => {
    // Arrange
    const mockRequests = [
      {
        id: '1',
        address: '0x1234567890123456789012345678901234567890',
        role: 'FABRICANTE',
        status: 'pending',
        timestamp: new Date().toISOString()
      }
    ];

    const mockApproveRequest = vi.fn().mockResolvedValue(true);

    (useRoleRequests as any).mockReturnValue({
      requests: mockRequests,
      loading: false,
      approveRequest: mockApproveRequest,
      rejectRequest: vi.fn(),
      reload: vi.fn()
    });

    // Act
    render(<PendingRoleRequests />, { wrapper });
    const approveButton = screen.getByText('Aprobar');
    approveButton.click();

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Procesados Recientemente')).toBeInTheDocument();
      expect(screen.getByText('Aprobado')).toBeInTheDocument();
    });
  });

  it('should filter requests by search query