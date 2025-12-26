// web/src/app/page.tsx
"use client";

import { useWeb3 } from '@/contexts/Web3Context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { address, isConnected, connectWallet } = useWeb3();

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex flex-col items-center justify-center text-center space-y-12">
        <div className="max-w-4xl space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Rastrea la
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500 ml-4">Trazabilidad</span>
            de Netbooks
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Sistema descentralizado para el seguimiento completo del ciclo de vida de netbooks educativas, desde su fabricación hasta su distribución a estudiantes.
          </p>
          {!isConnected ? (
            <Button
              size="lg"
              className="h-12 px-8 text-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              onClick={() => connectWallet()}
            >
              <Wallet className="mr-3 h-5 w-5" />
              Conectar Wallet
            </Button>
          ) : (
            <div className="space-y-4">
              <p className="text-lg text-muted-foreground">Conectado como: {address?.slice(0, 6)}...{address?.slice(-4)}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="h-12 px-8">
                  <Link href="/dashboard">
                    Ir al Dashboard
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 px-8">
                  <Link href="/tokens">
                    Gestionar Netbooks
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl w-full">
          <Card>
            <CardHeader>
              <CardTitle>Fabricación</CardTitle>
              <CardDescription>Registro de netbooks</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Los fabricantes registran cada netbook con sus especificaciones y lote de producción.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Auditoría</CardTitle>
              <CardDescription>Verificación de calidad</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Auditores verifican la integridad del hardware y técnicos validan el software instalado.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Distribución</CardTitle>
              <CardDescription>Entrega a estudiantes</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Las escuelas asignan netbooks a estudiantes finales, completando el ciclo de vida.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}