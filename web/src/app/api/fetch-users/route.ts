import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    
    // Get query parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    
    // Build query filter
    const query: any = {};
    
    if (role) {
      query.role = role;
    }
    
    if (search) {
      query.address = { $regex: search, $options: 'i' };
    }
    
    // Get total count for pagination
    const totalCount = await db.collection('role_data').countDocuments(query);
    
    // Get paginated results
    const users = await db.collection('role_data')
      .find(query)
      .sort({ assignedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      success: true,
      data: users.map(user => ({
        ...user,
        id: user._id.toString()
      })),
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}