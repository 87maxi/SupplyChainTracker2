import { getRoleRequests, submitRoleRequest } from '@/services/RoleRequestService';
import { NextResponse } from 'next/server';

// GET /api/role-requests - Get all role requests
export async function GET() {
  try {
    const requests = await getRoleRequests();
    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error in GET /api/role-requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch role requests' }, 
      { status: 500 }
    );
  }
}

// POST /api/role-requests - Submit a new role request
export async function POST(request: Request) {
  try {
    const { address, role } = await request.json();
    
    if (!address || !role) {
      return NextResponse.json(
        { error: 'Address and role are required' },
        { status: 400 }
      );
    }
    
    const newRequest = await submitRoleRequest(address, role);
    
    return NextResponse.json(newRequest, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/role-requests:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit role request' },
      { status: 500 }
    );
  }
}