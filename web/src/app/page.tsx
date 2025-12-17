"use client";

import { useWeb3 } from '@/hooks/useWeb3';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Home() {
  const { address, isConnected } = useWeb3();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-end mb-8">
        <ConnectButton />
      </div>
      
      <div className="flex flex-col items-center justify-center space-y-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Bienvenido al Sistema de Trazabilidad</CardTitle>
            <CardDescription>
              Sistema de trazabilidad de netbooks educativas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isConnected ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Conectado como: <span className="font-mono">{address}</span>
                </p>
                {/* Button removed since ConnectButton handles disconnect */}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Conecta tu wallet para comenzar a interactuar con el sistema de trazabilidad.
                </p>
                {/* Button removed since ConnectButton handles connect */}
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Fabricación</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Registro inicial de netbooks por el fabricante.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Auditoría HW</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Verificación y aprobación del hardware por auditores especializados.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Validación SW</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Instalación y validación del software por técnicos especializados.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Distribución</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Asignación de netbooks a estudiantes por las instituciones educativas.
              </p>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle>Administración</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Gestión de usuarios y roles por el administrador del sistema.
              </p>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle>Trazabilidad</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Historial inmutable de todas las transacciones y estados de cada netbook.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}