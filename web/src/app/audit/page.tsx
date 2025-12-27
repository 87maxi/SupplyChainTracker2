'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormUploader } from '@/components/ipfs/FormUploader';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { registerAuditReport } from '@/services/SupplyChainService';

export default function HardwareAuditPage() {
  const { toast } = useToast();
  const [ipfsHash, setIpfsHash] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  // Manejador para cuando se completa la subida a IPFS
  const handleUploadComplete = (hash: string) => {
    setIpfsHash(hash);
    toast({
      title: "Informe subido",
      description: "El informe de auditoría se ha subido a IPFS",
    });
  };

  // Manejador para registrar el hash en la blockchain
  const handleRegisterOnChain = async () => {
    if (!ipfsHash) {
      toast({
        title: "Error",
        description: "Primero debe subir el informe a IPFS",
        variant: "destructive"
      });
      return;
    }

    setIsRegistering(true);
    
    try {
      // Registrar el hash en la blockchain
      // Aquí el rol de auditor de hardware llamaría a la función auditHardware del contrato
      await registerAuditReport(ipfsHash);
      
      toast({
        title: "Registro completado",
        description: "El hash del informe se ha registrado en la blockchain",
      });
      
    } catch (error) {
      console.error('Error registering on blockchain:', error);
      toast({
        title: "Error",
        description: "No se pudo registrar en la blockchain",
        variant: "destructive"
      });
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Auditoría de Hardware</h1>
          <p className="text-muted-foreground">
            Registre y almacene informes de auditoría de hardware
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>1. Complete el Informe</CardTitle>
            <CardDescription>
              Ingrese los datos del dispositivo y sus hallazgos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormUploader 
              onUploadComplete={handleUploadComplete}
              formTitle="Formulario de Auditoría de Hardware"
              formDescription="Complete los detalles de la inspección del dispositivo"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Registre en Blockchain</CardTitle>
            <CardDescription>
              Una vez subido a IPFS, registre el hash en la blockchain
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {ipfsHash ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-md">
                  <h3 className="font-medium mb-2">Hash IPFS</h3>
                  <p className="text-sm font-mono break-all">{ipfsHash}</p>
                  <div className="mt-2">
                    <a 
                      href={`https://ipfs.io/ipfs/${ipfsHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Ver informe completo
                    </a>
                  </div>
                </div>
                <Button 
                  onClick={handleRegisterOnChain}
                  disabled={isRegistering}
                  className="w-full"
                >
                  {isRegistering ? 'Registrando...' : 'Registrar en Blockchain'}
                </Button>
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                <p>Primero complete y suba el informe a IPFS</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>¿Cómo funciona?</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li><strong>Complete el formulario</strong>: Ingrese todos los detalles del dispositivo y sus hallazgos</li>
            <li><strong>Suba a IPFS</strong>: Los datos completos se almacenan de forma descentralizada</li>
            <li><strong>Registre el hash en blockchain</strong>: Solo el identificador único (hash) se guarda en la blockchain</li>
            <li><strong>Verificación</strong>: Cualquier parte puede verificar la integridad del informe comparando el hash</li>
          </ol>
          <div className="mt-4 p-4 bg-muted rounded-md">
            <h4 className="font-medium mb-2">Ventajas de este enfoque:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Reducción de costos</strong>: Los datos grandes se almacenan fuera de cadena</li>
              <li><strong>Privacidad</strong>: Los detalles sensibles no están completamente expuestos</li>
              <li><strong>Verificación</strong>: Cualquiera puede comprobar que el informe no ha sido alterado</li>
              <li><strong>Permanencia</strong>: Los datos en IPFS son inmutables y permanentes</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}