import { NextResponse } from 'next/server';
import { RoleDataService } from '@/services/RoleDataService';
import { ContractRoles } from '@/types/contract';
import { Address } from 'viem';

/**
 * API Route to handle supply chain actions that require MongoDB persistence
 * 
 * This route handles operations that need to be performed on the server
 * to avoid exposing MongoDB dependencies to client components.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.serialNumber && !body.serials) {
      return NextResponse.json(
        { error: 'Missing serialNumber or serials' },
        { status: 400 }
      );
    }
    
    if (!body.transactionHash) {
      return NextResponse.json(
        { error: 'Missing transactionHash' },
        { status: 400 }
      );
    }
    
    if (!body.role) {
      return NextResponse.json(
        { error: 'Missing role' },
        { status: 400 }
      );
    }
    
    if (!body.userAddress) {
      return NextResponse.json(
        { error: 'Missing userAddress' },
        { status: 400 }
      );
    }
    
    const { serialNumber, serials, transactionHash, role, userAddress, data } = body;
    
    // Determine which operation to perform based on input
    let result;
    
    if (serials && serials.length > 0) {
      // Handle register netbooks (multiple)
      const firstSerial = serials[0]; // Use first serial as reference
      result = await RoleDataService.saveNetbookData({
        serialNumber: firstSerial,
        transactionHash: transactionHash as `0x${string}`,
        role: role as ContractRoles,
        userAddress: userAddress as Address,
        data: { serials, ...data },
      });
    } else if (serialNumber) {
      // Handle single netbook operations
      result = await RoleDataService.saveNetbookData({
        serialNumber,
        transactionHash: transactionHash as `0x${string}`,
        role: role as ContractRoles,
        userAddress: userAddress as Address,
        data: data || {},
      });
    }
    
    return NextResponse.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('Error in supply-chain-actions API route:', error);
    return NextResponse.json(
      { error: 'Failed to process supply chain action' },
      { status: 500 }
    );
  }
}