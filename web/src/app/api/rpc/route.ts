import { NextRequest, NextResponse } from 'next/server';
import { SupplyChainService } from '@/services/SupplyChainService';

// Handler for POST requests to /api/rpc
export async function POST(request: NextRequest) {
  try {
    const { method, params } = await request.json();

    // Validate request
    if (!method || typeof method !== 'string') {
      return NextResponse.json(
        { error: 'Method is required and must be a string' },
        { status: 400 }
      );
    }

    // Handle different RPC methods
    let result;
    switch (method) {
      case 'getNetbookState':
        if (!params?.serial) {
          return NextResponse.json(
            { error: 'Serial number is required' },
            { status: 400 }
          );
        }
        result = await SupplyChainService.getNetbookState(params.serial);
        break;

      case 'getNetbookReport':
        if (!params?.serial) {
          return NextResponse.json(
            { error: 'Serial number is required' },
            { status: 400 }
          );
        }
        result = await SupplyChainService.getNetbookReport(params.serial);
        break;

      case 'getAllSerialNumbers':
        result = await SupplyChainService.getAllSerialNumbers();
        break;

      case 'hasRole':
        if (!params?.roleHash || !params?.address) {
          return NextResponse.json(
            { error: 'Role hash and address are required' },
            { status: 400 }
          );
        }
        result = await SupplyChainService.hasRole(params.roleHash, params.address);
        break;

      default:
        return NextResponse.json(
          { error: `Unknown method: ${method}` },
          { status: 400 }
        );
    }

    return NextResponse.json({ data: result, error: null });

  } catch (error) {
    console.error('RPC API error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: Add support for other HTTP methods if needed
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST instead.' },
    { status: 405 }
  );
}