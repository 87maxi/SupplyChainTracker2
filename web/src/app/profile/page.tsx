// web/src/app/profile/page.tsx
"use client";

import { useWeb3 } from '@/contexts/Web3Context';
import { useSupplyChainService } from '@/hooks/useSupplyChainService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wallet, User, ShieldQuestion, ClipboardCopy, Link as LinkIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ContractRoles } from '@/types/supply-chain-types';
import { getRoleHashes } from '@/lib/roleUtils';
import Link from 'next/link';
import { Address } from 'viem';

export default function ProfilePage() {
  const { address, isConnected, disconnect, connectWallet } = useWeb3();
  const { hasRole, getAccountBalance } = useSupplyChainService();
  const { toast } = useToast();

  const [balance, setBalance] = useState<string | null>(null);
  const [userRoles, setUserRoles] = useState<ContractRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProfileData = useCallback(async () => {
    if (!isConnected || !address) {
      setLoading(false);
      setError('Wallet no conectada.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Fetch balance
      const fetchedBalance = await getAccountBalance(address);
      setBalance(fetchedBalance);

      // Fetch user roles
      // First get all role hashes from the contract
      const roleHashes = await getRoleHashes();
      
      // Define a mapping of our expected role keys to their actual hashes in the contract
      const roleKeysToCheck: Array<keyof typeof roleHashes> = ['FABRICANTE', 'AUDITOR_HW', 'TECNICO_SW', 'ESCUELA', 'ADMIN'];
      
      const rolesFound: ContractRoles[] = [];
      
      // Check each role by its hash
      if (roleHashes.FABRICANTE && await hasRole(roleHashes.FABRICANTE, address)) {
        rolesFound.push('FABRICANTE_ROLE');
      }
      if (roleHashes.AUDITOR_HW && await hasRole(roleHashes.AUDITOR_HW, address)) {
        rolesFound.push('AUDITOR_HW_ROLE');
      }
      if (roleHashes.TECNICO_SW && await hasRole(roleHashes.TECNICO_SW, address)) {
        rolesFound.push('TECNICO_SW_ROLE');
      }
      if (roleHashes.ESCUELA && await hasRole(roleHashes.ESCUELA, address)) {
        rolesFound.push('ESCUELA_ROLE');
      }
      if (roleHashes.ADMIN && await hasRole(roleHashes.ADMIN, address)) {
        rolesFound.push('DEFAULT_ADMIN_ROLE');
      }
      setUserRoles(rolesFound.sort()); // Ordenar roles alfabéticamente
    } catch (err: any) {
      console.error('Error fetching profile data:', err);
      setError(`No se pudo cargar la información del perfil: ${err.message}`);
      setBalance(null);
      setUserRoles([]);
    } finally {
      setLoading(false);
    }
  }, [isConnected, address, getAccountBalance, hasRole]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado al portapapeles", description: text });
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-6">
            <h3 className="text-xl font-medium text-foreground mb-2">Acceso Restringido</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Por favor, conecta tu wallet para ver la información de tu perfil.
            </p>
            <Button size="lg" variant="gradient" onClick={() => connectWallet()} className="h-12 px-8 gap-2">
              <LinkIcon className="h-4 w-4" /> Conectar Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="text-lg text-muted-foreground animate-pulse">Cargando información del perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Mi Perfil</h1>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Cuenta</CardTitle>
          <CardDescription>Detalles de tu wallet y roles asignados en el sistema.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && <div className="text-red-500 p-4 rounded-md bg-red-50 mb-4">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Dirección de la Wallet</Label>
              <div className="p-3 bg-card-foreground/5 rounded-md font-mono text-sm flex items-center justify-between">
                <span>{address}</span>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => address && copyToClipboard(address)}>
                  <ClipboardCopy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Saldo ETH</Label>
              <div className="p-3 bg-card-foreground/5 rounded-md flex items-center gap-2">
                <Wallet className="h-4 w-4 text-primary" />
                <span className="font-semibold">{balance !== null ? `${parseFloat(balance).toFixed(4)} ETH` : 'Cargando...'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Roles en el Sistema</Label>
            <div className="flex flex-wrap gap-2 p-3 bg-card-foreground/5 rounded-md">
              {userRoles.length > 0 ? (
                userRoles.map((role, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1 text-sm gap-1">
                    <User className="h-3.5 w-3.5" /> {role.replace(/_/g, ' ')}
                  </Badge>
                ))
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <ShieldQuestion className="h-4 w-4" /> No tienes roles asignados.
                </div>
              )}
            </div>
          </div>

          <div className="border-t pt-6 mt-6">
            <Button variant="outline" onClick={disconnect} className="gap-2">
              Desconectar Wallet
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}