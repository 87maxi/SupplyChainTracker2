import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { RoleRequestService } from '@/services/RoleRequestService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const address = searchParams.get('address');

    let requests;
    
    if (address) {
      // Get requests for specific user
      requests = await RoleRequestService.getRoleRequestsByUser(address as `0x${string}`);
    } else if (status === 'pending') {
      // Get only pending requests
      requests = await RoleRequestService.getPendingRoleRequests();
    } else {
      // Get all requests
      requests = await RoleRequestService.getAllRoleRequests();
    }

    return NextResponse.json({
      success: true,
      data: requests,
      count: requests.length
    });

  } catch (error) {
    console.error('Error fetching role requests:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch role requests' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, role, signature } = body;

    if (!address || !role) {
      return NextResponse.json(
        { success: false, error: 'Address and role are required' },
        { status: 400 }
      );
    }

    const newRequest = await RoleRequestService.submitRoleRequest(
      address as `0x${string}`,
      role,
      signature
    );

    return NextResponse.json({
      success: true,
      data: newRequest
    });

  } catch (error) {
    console.error('Error creating role request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create role request' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'ID and status are required' },
        { status: 400 }
      );
    }

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Status must be approved or rejected' },
        { status: 400 }
      );
    }

    await RoleRequestService.updateRoleRequestStatus(id, status);

    return NextResponse.json({
      success: true,
      message: 'Role request status updated'
    });

  } catch (error) {
    console.error('Error updating role request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update role request' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    await RoleRequestService.deleteRoleRequest(id);

    return NextResponse.json({
      success: true,
      message: 'Role request deleted'
    });

  } catch (error) {
    console.error('Error deleting role request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete role request' },
      { status: 500 }
    );
  }
}