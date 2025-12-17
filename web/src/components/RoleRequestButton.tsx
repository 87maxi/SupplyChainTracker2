"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useWeb3 } from '@/lib/web3';
import { RoleRequestService } from '@/services/RoleRequestService';

const roles = [
  { value: '0xc9d9e6b172513355070360451450413840810234077175348639291479838649', label: 'FABRICANTE_ROLE' },
  { value: '0x69abb1d469219997098950756a29849743111a44297561274841978723934425', label: 'AUDITOR_HW_ROLE' },
  { value: '0xd25c992a48858314113753611945045859423533313842771219981911994373', label: 'TECNICO_SW_ROLE' },
  { value: '0x8a56fd3344097613215665977667319753531132276132611988941251823874', label: 'ESCUELA_ROLE' }
];

export function RoleRequestButton() {
  const { address, isConnected } = useWeb3();
  const [selectedRole, setSelectedRole] = useState(roles[0].value);
  const [requestStatus, setRequestStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const currentRequest = RoleRequestService.getRequestByAddress(address || '');

  const handleRequest = () => {
    if (!isConnected || !address) return;

    try {
      RoleRequestService.addRequest(
        address,
        selectedRole,
        roles.find(r => r.value === selectedRole)?.label || ''
      );
      setRequestStatus('success');
      setTimeout(() => {
        setRequestStatus('idle');
        setSelectedRole(roles[0].value);
      }, 3000);
    } catch (error: any) {
      console.error('Error requesting role:', error);
      setErrorMsg(error.message || 'Failed to request role');
      setRequestStatus('error');
      setTimeout(() => {
        setRequestStatus('idle');
        setErrorMsg('');
      }, 3000);
    }
  };

  const handleCancel = () => {
    if (address) {
      RoleRequestService.removeRequest(address);
      setRequestStatus('success');
      setTimeout(() => {
        setRequestStatus('idle');
      }, 3000);
    }
  };

  if (!isConnected) {
    return null;
  }

  if (currentRequest) {
    if (currentRequest.status === 'pending') {
      return (
        <Card className="bg-yellow-500/10 border-yellow-500/30 max-w-sm mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-triangle text-yellow-600">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
              Solicitud Pendiente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Has solicitado el rol <strong>{currentRequest.roleName}</strong>. Un administrador lo revisará pronto.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleCancel}
              variant="outline"
              size="sm"
              className="text-yellow-700 border-yellow-500/50 hover:bg-yellow-500/20"
            >
              Cancelar Solicitud
            </Button>
          </CardFooter>
        </Card>
      );
    } else if (currentRequest.status === 'approved') {
      return (
        <Card className="bg-green-500/10 border-green-500/30 max-w-sm mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle-2 text-green-600">
                <path d="M18 6 7 17l-5-5" />
                <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              Rol Aprobado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              ¡Felicidades! Tu solicitud para el rol <strong>{currentRequest.roleName}</strong> ha sido aprobada.
            </p>
          </CardContent>
        </Card>
      );
    } else if (currentRequest.status === 'rejected') {
      return (
        <Card className="bg-red-500/10 border-red-500/30 max-w-sm mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x-circle text-red-600">
                <circle cx="12" cy="12" r="10" />
                <path d="m15 9-6 6" />
                <path d="m9 9 6 6" />
              </svg>
              Rol Rechazado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Lo sentimos, tu solicitud para el rol <strong>{currentRequest.roleName}</strong> ha sido rechazada.
            </p>
          </CardContent>
        </Card>
      );
    }
  }

  return (
    <Card className="max-w-sm mx-auto">
      <CardHeader>
        <CardTitle>Solicitar Rol</CardTitle>
        <CardDescription>
          Solicita acceso para realizar acciones específicas en el sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="role">Seleccionar Rol</Label>
          <select
            id="role"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full p-2 border rounded-lg bg-background"
          >
