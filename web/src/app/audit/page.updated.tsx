'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useSupplyChainService } from '@/hooks/useSupplyChainService';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useWeb3 } from '@/contexts/Web3Context';

export default function HardwareAuditPage() {
  const { toast } = useToast();
  const { auditHardware } = useSupplyChainService();
  const { address } = useWeb3();
  const [isRegistering, setIsRegistering] = useState(false);
  const [currentSerial, setCurrentSerial] = useState('');
  const [auditPassed, setAuditPassed] = useState(true);
  const [auditDetails, setAuditDetails] = useState('');

  // Manejador para registrar el hash en la blockchain
  const handleRegisterOnChain = async () => {
    if (!currentSerial || !address) {
      toast({
        title: "Error",
        description: "Primero debe completar todos los campos",
        variant: "destructive"
      });
      return;
    }

    setIsRegistering(true);
    
    try {
      // Create a hash from the audit details for blockchain storage
      const encoder = new TextEncoder();
      const data = encoder.encode(auditDetails);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      const reportHash = `0x${hashHex.padStart(64, '0')}`;

      // Registrar el hash en la blockchain
      await auditHardware(currentSerial, auditPassed, reportHash, address);
      
      toast({
        title: "Registro completado",
        description: "El informe de auditoría se ha registrado en la blockchain",
      });
      
      // Reset form
      setCurrentSerial('');
      setAuditPassed(true);
      setAuditDetails('');
      
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
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="auditDetails">
                  Detalles de la Auditoría
                </Label>
                <Textarea
                  id="auditDetails"
                  value={auditDetails}
                  onChange={(e) => setAuditDetails(e.target.value)}
                  placeholder="Ingrese los detalles completos de la auditoría..."
                  className="min-h-[200px]"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Los detalles completos se almacenarán en la base de datos MongoDB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Registre en Blockchain</CardTitle>
            <CardDescription>
              Complete los campos y registre en la blockchain
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="serial" className="text-right">
                  Serial
                </Label>
                <Input
                  id="serial"
                  value={currentSerial}
                  onChange={(e) => setCurrentSerial(e.target.value)}
                  className="col-span-3"
                  placeholder="NB-001"
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="auditPassed"
                  checked={auditPassed}
                  onChange={(e) => setAuditPassed(e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="auditPassed">
                  Auditoría Aprobada
                </Label>
              </div>
              
              <Button 
                onClick={handleRegisterOnChain}
                disabled={isRegistering || !currentSerial || !auditDetails || !address}
                className="w-full"
              >
                {isRegistering ? 'Registrando...' : 'Registrar en Blockchain'}
              </Button>
            </div>
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
            <li><strong>Almacenamiento en MongoDB</strong>: Los datos completos se almacenan en la base de datos</li>
            <li><strong>Registro en blockchain</strong>: Un hash del informe se registra en la blockchain</li>
            <li><strong>Verificación</strong>: Cualquiera puede verificar la integridad del informe</li>
          </ol>
          <div className="mt-4 p-4 bg-muted rounded-md">
            <h4 className="font-medium mb-2">Ventajas de este enfoque:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Reducción de costos</strong>: Los datos grandes se almacenan fuera de cadena</li>
              <li><strong>Privacidad</strong>: Los detalles sensibles se almacenan en MongoDB con control de acceso</li>
              <li><strong>Verificación</strong>: Cualquiera puede comprobar que el informe no ha sido alterado</li>
              <li><strong>Accesibilidad</strong>: Los datos están disponibles para roles autorizados</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}