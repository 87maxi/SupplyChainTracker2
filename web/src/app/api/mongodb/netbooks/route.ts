import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    
    // Get query parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const manufacturer = searchParams.get('manufacturer');
    const search = searchParams.get('search');
    
    // Build query filter
    const query: any = {};
    
    if (status) {
      query.status = status;
    }
    
    if (manufacturer) {
      query.manufacturer = manufacturer;
    }
    
    if (search) {
      query.serialNumber = { $regex: search, $options: 'i' };
    }
    
    // Get total count for pagination
    const totalCount = await db.collection('netbook_data').countDocuments(query);
    
    // Get paginated results
    const netbooks = await db.collection('netbook_data')
      .find(query)
      .sort({ productionDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      success: true,
      data: netbooks,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
      }
    });
  } catch (error) {
    console.error('Error fetching netbooks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch netbooks' },
      { status: 500 }
    );
  }
}