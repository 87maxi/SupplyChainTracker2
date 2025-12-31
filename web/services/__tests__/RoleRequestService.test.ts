'use server';

import { roleRequestService } from '@/services/RoleRequestService';
import { eventBus, EVENTS } from '@/lib/events';

// Setup and teardown
beforeAll(async () => {
  // Setup test database connection if needed
  // This would typically be handled by a test database setup
});

afterAll(async () => {
  // Cleanup test database if needed
});

// Clear any listeners between tests
afterEach(() => {
  eventBus.clear();
});

describe('RoleRequestService', () => {
  let testId: string;
  const testAddress = '0x1234567890123456789012345678901234567890';
  const testRole = 'FABRICANTE_ROLE';

  test('should create a new role request', async () => {
    const request = await roleRequestService.createRequest({
      userAddress: testAddress,
      role: testRole,
      signature: '0x123signature'
    });
    
    expect(request).toBeDefined();
    expect(request.userAddress).toBe(testAddress);
    expect(request.role).toBe(testRole);
    expect(request.status).toBe('pending');
    expect(request.requestDate).toBeDefined();
    
    testId = request.id;
  });

  test('should get all role requests', async () => {
    const requests = await roleRequestService.getAllRequests();
    
    expect(Array.isArray(requests)).toBe(true);
    expect(requests.length).toBeGreaterThan(0);
    
    const request = requests.find(r => r.id === testId);
    expect(request).toBeDefined();
    expect(request?.userAddress).toBe(testAddress);
  });

  test('should get role requests by status', async () => {
    const pendingRequests = await roleRequestService.getRequestsByStatus('pending');
    const approvedRequests = await roleRequestService.getRequestsByStatus('approved');
    
    expect(Array.isArray(pendingRequests)).toBe(true);
    expect(pendingRequests.length).toBeGreaterThan(0);
    
    expect(Array.isArray(approvedRequests)).toBe(true);
    expect(approvedRequests.length).toBeGreaterThanOrEqual(0);
    
    const request = pendingRequests.find(r => r.id === testId);
    expect(request).toBeDefined();
  });

  test('should get role requests by user', async () => {
    const requests = await roleRequestService.getRequestsByUser(testAddress);
    
    expect(Array.isArray(requests)).toBe(true);
    expect(requests.length).toBeGreaterThan(0);
    
    const request = requests.find(r => r.id === testId);
    expect(request).toBeDefined();
    expect(request?.role).toBe(testRole);
  });

  test('should update request status to approved', async () => {
    const transactionHash = '0x1234567890abcdef';
    
    const updatedRequest = await roleRequestService.updateRequestStatus(
      testId,
      'approved',
      transactionHash
    );
    
    expect(updatedRequest).toBeDefined();
    expect(updatedRequest.status).toBe('approved');
    expect(updatedRequest.transactionHash).toBe(transactionHash);
    expect(updatedRequest.processedDate).toBeDefined();
  });

  test('should update request status to rejected', async () => {
    // Create a new pending request for rejection test
    const newRequest = await roleRequestService.createRequest({
      userAddress: '0x0987654321098765432109876543210987654321',
      role: 'AUDITOR_HW_ROLE'
    });
    
    const updatedRequest = await roleRequestService.updateRequestStatus(
      newRequest.id,
      'rejected'
    );
    
    expect(updatedRequest).toBeDefined();
    expect(updatedRequest.status).toBe('rejected');
    expect(updatedRequest.transactionHash).toBeUndefined();
    expect(updatedRequest.processedDate).toBeDefined();
  });

  test('should delete a role request', async () => {
    // Create a request to delete
    const requestToBeDeleted = await roleRequestService.createRequest({
      userAddress: '0x1111111111111111111111111111111111111111',
      role: 'TECNICO_SW_ROLE'
    });
    
    const result = await roleRequestService.deleteRequest(requestToBeDeleted.id);
    expect(result).toBe(true);
    
    // Verify it's gone
    const allRequests = await roleRequestService.getAllRequests();
    const deletedRequest = allRequests.find(r => r.id === requestToBeDeleted.id);
    expect(deletedRequest).toBeUndefined();
  });
});
