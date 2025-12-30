import { NextResponse } from 'next/server';
import { mongodbService } from '@/lib/mongodb';
import { RoleData, NetbookData } from '@/types/mongodb';
import { ContractRoles } from '@/types/contract';

// POST /api/mongodb/save-netbook-data
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.serialNumber || !body.transactionHash || !body.role || !body.userAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Save to MongoDB
    const result = await mongodbService.saveNetbookData({
      serialNumber: body.serialNumber,
      transactionHash: body.transactionHash,
      role: body.role,
      userAddress: body.userAddress,
      data: body.data || {},
      timestamp: body.timestamp ? new Date(body.timestamp) : new Date()
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error saving netbook data:', error);
    return NextResponse.json(
      { error: 'Failed to save netbook data' },
      { status: 500 }
    );
  }
}

// GET /api/mongodb/netbook-data?serialNumber=...
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const serialNumber = searchParams.get('serialNumber');
    
    if (!serialNumber) {
      return NextResponse.json(
        { error: 'Serial number is required' },
        { status: 400 }
      );
    }

    // Get netbook data from MongoDB
    const data = await mongodbService.getNetbookDataBySerial(serialNumber);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching netbook data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch netbook data' },
      { status: 500 }
    );
  }
}