"use client";

import { useWeb3 } from '@/hooks/useWeb3';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import * as SupplyChainService from '@/services/SupplyChainService';

export default function CreateTokensPage() {
  const { address, isConnected } = useWeb3();
  const [serials, setSerials] = useState('');
  const [batches, setBatches] = useState('');
  const [modelSpecs, setModelSpecs] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegisterNetbooks = async () => {
    if (!isConnected || !address) {
      setError('Please connect your wallet');
      return;
    }

    if (!serials || !batches || !modelSpecs) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Parse inputs as arrays
      const serialArray = serials.split(',').map(s => s.trim()).filter(s => s.length > 0);
      const batchArray = batches.split(',').map(b => b.trim()).filter(b => b.length > 0);
      const modelArray = modelSpecs.split(',').map(m => m.trim()).filter(m => m.length > 0);

      // Validate arrays have same length
      if (serialArray.length !== batchArray.length || serialArray.length !== modelArray.length) {
        setError('All arrays must have the same number of elements');
        setLoading(false);
        return;
      }

      // Register netbooks
      const receipt = await SupplyChainService.registerNetbooks(
        serialArray, 
        batchArray, 
        modelArray,
        address as `0x${string}`
      );

      setSuccess(`Successfully registered ${serialArray.length} netbooks! Transaction: ${receipt.transactionHash}`);
      setSerials('');
      setBatches('');
      setModelSpecs('');
    } catch (error: any) {
      console.error('Error registering netbooks:', error);
      setError(error.message || 'Failed to register netbooks');
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg mb-4">Por favor, conecta tu wallet para crear NFTs de netbooks.</p>
            <Button onClick={() => window.location.reload()}>Conectar Wallet</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Crear NFTs de Netbooks</h1>

      <Card>
        <CardHeader>
          <CardTitle>Registrar Nuevos Netbooks</CardTitle>
          <CardDescription>Registra múltiples netbooks en el sistema de trazabilidad</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="serials">Números de Serie (separados por comas)</Label>
              <Input
                id="serials"
                type="text"
                value={serials}
                onChange={(e) => setSerials(e.target.value)}
                placeholder="S12345,S67890,S11223,..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="batches">Lotes (separados por comas)</Label>
              <Input
                id="batches"
                type="text"
                value={batches}
                onChange={(e) => setBatches(e.target.value)}
                placeholder="Lote1,Lote2,Lote3,..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modelSpecs">Especificaciones del Modelo (separadas por comas)</Label>
              <Input
                id="modelSpecs"
                type="text"
                value={modelSpecs}
                onChange={(e) => setModelSpecs(e.target.value)}
                placeholder="ModeloA,ModeloB,ModeloC,..."
              />
            </div>
          </div>

          {error && <div className="text-red-500 p-4 rounded-md bg-red-50">{error}</div>}
          {success && <div className="text-green-500 p-4 rounded-md bg-green-50">{success}</div>}

          <Button
            onClick={handleRegisterNetbooks}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Registrando...' : 'Registrar Netbooks'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
