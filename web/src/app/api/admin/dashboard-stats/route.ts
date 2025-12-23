import { NextRequest, NextResponse } from 'next/server';
import { getDashboardData } from '@/app/admin/components/server/actions';

export async function GET(request: NextRequest) {
  try {
    const dashboardData = await getDashboardData();
    
    return NextResponse.json(dashboardData, {
      headers: {
        'Cache-Control': 's-maxage=30, stale-while-revalidate=60'
      }
    });
  } catch (error) {
    console.error('Error in dashboard-stats API:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
