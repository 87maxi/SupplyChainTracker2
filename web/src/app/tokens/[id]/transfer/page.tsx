"use client";

import { useWeb3 } from '@/contexts/Web3Context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { SupplyChainService } from '@/services/SupplyChainService';
import { useParams } from 'next/navigation';

export default function TransferTokenPage() {
  const { address, isConnected } = useWeb3();
  const { id } = useParams();
  const [serial, setSerial] = useState<string | null>(null);
  const [toAddress, setToAddress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [netbookState, setNetbookState] = useState<number | null>(null);
  
  useEffect(() => {
    if (id && typeof id === 'string') {
      setSerial(id);
    }
  }, [id]);

  const handleTransfer = async () => {
    if (!isConnected || !address) {
      setError('Please connect your wallet');
      return;
    }

    if (!serial || !toAddress) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Check if the netbook exists and get its current state
      const state = await SupplyChainService.getNetbookState(serial);
      setNetbookState(state);
      
      // Check if the netbook is in a state that allows transfer (DISTRIBUIDA)
      // Assuming state 3 is DISTRIBUIDA (as per the state machine in the requirements)
      if (state !== 3) {
        setError('The netbook must be in DISTRIBUIDA state to be transferred');
        setLoading(false);
        return;
      }

      // Transfer the netbook
      const tx = await SupplyChainService.assignToStudent(serial, toAddress, toAddress);
      await tx.wait();

      setSuccess(`Successfully transferred netbook ${serial} to ${toAddress}! Transaction: ${tx.hash}`);
      setToAddress('');
    } catch (error: any) {
      console.error('Error transferring netbook:', error);
      setError(error.message || 'Failed to transfer netbook');
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg mb-4">Por favor, conecta tu wallet para transferir netbooks.</p>
            <Button onClick={() => window.location.reload()}>Conectar Wallet</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Transferir Netbook</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Transferir Netbook {serial}</CardTitle>
          <CardDescription>Transferir un netbook a una nueva institución educativa</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="serial">Número de Serie</Label>
              <Input
                id="serial"
                type="text"
                value={serial || ''}
                readOnly
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="toAddress">Dirección de la Institución</Label>
              <Input
                id="toAddress"
                type="text"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                placeholder="0x..."
              />
            </div>
            
            {netbookState !== null && (
              <div className="p-4 bg-gray-50 rounded-md">
                <p className="font-medium">Estado actual: {netbookState === 0 ? 'FABRICADA' : netbookState === 1 ? 'HW_APROBADO' : netbookState === 2 ? 'SW_VALIDADO' : netbookState === 3 ? 'DISTRIBUIDA' : 'Desconocido'}</p>
                <p className="text-sm text-muted-foreground">
                  Solo los netbooks en estado DISTRIBUIDA pueden ser transferidos.
                </p>
              </div>
            )}
          </div>
          
          {error && <div className="text-red-500 p-4 rounded-md bg-red-50">{error}</div>}
          {success && <div className="text-green-500 p-4 rounded-md bg-green-50">{success}</div>}
          
          <Button 
            onClick={handleTransfer} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Transferiendo...' : 'Transferir Netbook'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}