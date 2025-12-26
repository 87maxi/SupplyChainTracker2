import { updateRoleRequestStatus } from '@/services/RoleRequestService';
import { NextRequest, NextResponse } from 'next/server';

// PATCH /api/role-requests/[id]/status - Update request status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json();
    
    if (!status || (status !== 'approved' && status !== 'rejected')) {
      return NextResponse.json(
        { error: 'Status must be either "approved" or "rejected"' },
        { status: 400 }
      );
    }
    
    await updateRoleRequestStatus(id, status);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in PATCH /api/role-requests/[id]/status:', error);
    return NextResponse.json(
      { error: 'Failed to update request status' }, 
      { status: 500 }
    );
  }
}