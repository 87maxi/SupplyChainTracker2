import { NextRequest, NextResponse } from 'next/server';
import { RoleRequestService } from '@/services/RoleRequestService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const userAddress = searchParams.get('userAddress');
    
    let requests;
    
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      requests = await RoleRequestService.getRequestsByStatus(status);
    } else if (userAddress) {
      requests = await RoleRequestService.getRequestsByUser(userAddress);
    } else {
      requests = await RoleRequestService.getAllRequests();
    }
    
    return NextResponse.json({
      success: true,
      data: requests
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
    const data = await request.json();
    
    const requestObj = {
      userAddress: data.userAddress,
      role: data.role,
      signature: data.signature
    };
    
    const newRequest = await RoleRequestService.createRequest(requestObj);
    
    return NextResponse.json({
      success: true,
      data: newRequest
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating role request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create role request' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, status, transactionHash } = data;
    
    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const updatedRequest = await RoleRequestService.updateRequestStatus(
      id,
      status,
      transactionHash
    );
    
    return NextResponse.json({
      success: true,
      data: updatedRequest
    });
    
  } catch (error) {
    console.error('Error updating role request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update role request' },
      { status: 500 }
    );
  }
}
