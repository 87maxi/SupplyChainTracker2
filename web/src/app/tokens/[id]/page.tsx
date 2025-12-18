"use client";

import { useWeb3 } from '@/hooks/useWeb3';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import * as SupplyChainService from '@/services/SupplyChainService';
import { useParams, useRouter } from 'next/navigation';
import { State } from '@/types/contract';
import { useState, useEffect } from 'react';
import { Netbook } from '@/types/contract';

export default function NetbookDetailsPage() {
  const { id } = useParams();
  const { isConnected } = useWeb3();
  const router = useRouter();
  const [netbook, setNetbook] = useState<Netbook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const stateLabels = {
    0: 'FABRICADA',
    1: 'HW_APROBADO',
    2: 'SW_VALIDADO',
    3: 'DISTRIBUIDA'
  } as const;

  const stateColors = {
    0: 'bg-gray-100 text-gray-800',
    1: 'bg-blue-100 text-blue-800',
    2: 'bg-yellow-100 text-yellow-800',
    3: 'bg-green-100 text-green-800'
  } as const;

  useEffect(() => {
    const fetchNetbook = async () => {
      if (!isConnected || !id || typeof id !== 'string') return;

      setLoading(true);
      setError('');

      try {
        const serial = id;
        const state = await SupplyChainService.getNetbookState(serial);
        const report = await SupplyChainService.getNetbookReport(serial);

        setNetbook({
          ...(report as Netbook),
          serialNumber: serial,
          currentState: state as State
        });
      } catch (err) {
        console.error('Error fetching netbook:', err);
        setError('Failed to load netbook details');
      } finally {
        setLoading(false);
      }
    };

    fetchNetbook();
  }, [isConnected, id]);

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg mb-4">Por favor, conecta tu wallet para ver los detalles del netbook.</p>
            <Button onClick={() => window.location.reload()}>Conectar Wallet</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p>Cargando detalles del netbook...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-red-500">{error}</p>
            <Button onClick={() => router.push('/tokens')}>Volver a la lista</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!netbook) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p>Netbook no encontrado</p>
            <Button onClick={() => router.push('/tokens')}>Volver a la lista</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Detalles del Netbook</h1>
        <Button onClick={() => router.push('/tokens')}>Volver a la lista</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{netbook?.serialNumber}</CardTitle>
          <CardDescription>
            <span className={`px-2 py-1 rounded text-xs ${stateColors[netbook?.currentState as keyof typeof stateColors || 0]}`}>
              {stateLabels[netbook?.currentState as keyof typeof stateLabels || 0]}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Información General</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lote:</span>
                  <span>{netbook?.batchId || 'No especificado'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Modelo:</span>
                  <span>{netbook?.initialModelSpecs || 'No especificado'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha de Registro:</span>
                  <span>{netbook?.serialNumber ? 'Registrado' : 'No especificada'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Estado del Ciclo de Vida</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fabricación:</span>
                  <span>{netbook?.serialNumber ? 'Completada' : 'Pendiente'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Auditoría HW:</span>
                  <span>{netbook?.hwAuditor !== '0x0000000000000000000000000000000000000000' ? 'Completada' : 'Pendiente'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Validación SW:</span>
                  <span>{netbook?.swTechnician !== '0x0000000000000000000000000000000000000000' ? 'Completada' : 'Pendiente'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Distribución:</span>
                  <span>{netbook?.currentState === 3 ? 'Completada' : 'Pendiente'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Historial de Transiciones</h3>
            <div className="space-y-2">
              <p className="text-muted-foreground">El historial de transiciones se puede ver en los eventos del contrato.</p>
            </div>
          </div>

          <div className="flex justify-between pt-6 border-t">
            <Button variant="outline" asChild>
              <Link href={`/tokens/${netbook?.serialNumber}/transfer`}>Transferir Netbook</Link>
            </Button>

            <Button asChild>
              <Link href="/tokens">Volver a la lista</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}