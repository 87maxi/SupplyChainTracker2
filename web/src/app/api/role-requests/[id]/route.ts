import { deleteRoleRequest } from '@/services/RoleRequestService';
import { NextRequest, NextResponse } from 'next/server';

// DELETE /api/role-requests/[id] - Delete a role request
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await deleteRoleRequest(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/role-requests/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to delete request' }, 
      { status: 500 }
    );
  }
}