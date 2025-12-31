// web/src/app/api/mongodb/transactions/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('userAddress');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

    // En una implementación real, aquí conectarías a MongoDB
    // Por ahora devolvemos datos mock para desarrollo
    const mockTransactions = [
      {
        transactionHash: '0x1234567890abcdef',
        blockNumber: 12345,
        from: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        to: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        functionName: 'grantRole',
        status: 'success',
        timestamp: new Date(),
        role: 'FABRICANTE_ROLE'
      }
    ];

    // Filtrar por userAddress si se proporciona
    const filteredTransactions = userAddress 
      ? mockTransactions.filter(tx => tx.from.toLowerCase() === userAddress.toLowerCase())
      : mockTransactions;

    return NextResponse.json({
      transactions: filteredTransactions,
      total: filteredTransactions.length
    });

  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const transactionData = await request.json();
    
    // En una implementación real, aquí guardarías en MongoDB
    console.log('Saving transaction to MongoDB:', transactionData);
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Transaction logged successfully',
        id: 'mock-id-123'
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error saving transaction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}