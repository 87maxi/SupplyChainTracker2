import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { RoleData } from '@/types/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const transactionHash = searchParams.get('transactionHash');
    const role = searchParams.get('role');
    const userAddress = searchParams.get('userAddress');
    
    // Build query filter
    const query: Record<string, any> = {};
    
    if (transactionHash) {
      query.transactionHash = transactionHash;
    }
    
    if (role) {
      query.role = role;
    }
    
    if (userAddress) {
      query.userAddress = userAddress.toLowerCase();
    }
    
    // Get role data from MongoDB
    const roleData = await db.collection('role_data')
      .find(query)
      .sort({ timestamp: -1 })
      .toArray();

    return NextResponse.json(
      roleData.map(data => ({ 
        ...data, 
        _id: data._id?.toString() 
      }))
    );
  } catch (error) {
    console.error('Error fetching role data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch role data' },
      { status: 500 }
    );
  }
}