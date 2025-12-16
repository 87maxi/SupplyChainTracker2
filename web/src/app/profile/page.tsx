"use client";

import { useWeb3 } from '@/contexts/Web3Context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SupplyChainService } from '@/services/SupplyChainService';
import { useState, useEffect } from 'react';
import { State } from '@/types/contract';

export default function ProfilePage() {
  const { address, isConnected, disconnect } = useWeb3();
  const [balance, setBalance] = useState<string>('0');
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const rolesMap = {
    '0xc9d9e6b172513355070360451450413840810234077175348639291479838649': 'FABRICANTE_ROLE',
    '0x69abb1d469219997098950756a29849743111a44297561274841978723934425': 'AUDITOR_HW_ROLE',
    '0xd25c992a48858314113753611945045859423533313842771219981911994373': 'TECNICO_SW_ROLE',
    '0x8a56fd3344097613215665977667319753531132276132611988941251823874': 'ESCUELA_ROLE',
    '0x0000000000000000000000000000000000000000000000000000000000000000': 'DEFAULT_ADMIN_ROLE'
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isConnected || !address) return;
      
      setLoading(true);
      setError('');
      
      try {
        // Get wallet balance
        const balance = await SupplyChainService.getAccountBalance(address);
        setBalance(balance);
        
        // Get roles for this address
        const userRoles: string[] = [];
        const roleKeys = Object.keys(rolesMap);
        
        for (const roleKey of roleKeys) {
          const hasRole = await SupplyChainService.hasRole(roleKey, address);
          if (hasRole) {
            userRoles.push(rolesMap[roleKey]);
          }
        }
        
        setRoles(userRoles);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile information');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [isConnected, address]);

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg mb-4">Por favor, conecta tu wallet para ver tu perfil.</p>
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
            <p>Cargando perfil...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Mi Perfil</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Información de la Cuenta</CardTitle>
          <CardDescription>Detalles de tu wallet y permisos en el sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && <div className="text-red-500 p-4 rounded-md bg-red-50">{error}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Dirección de la Wallet</Label>
              <div className="p-4 bg-gray-50 rounded-md font-mono text-sm">{address}</div>
            </div>
            
            <div className="space-y-2">
              <Label>Saldo ETH</Label>
              <div className="p-4 bg-gray-50 rounded-md">{balance} ETH</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Roles en el Sistema</Label>
            <div className="flex flex-wrap gap-2">
              {roles.length > 0 ? (
                roles.map((role, index) => (
                  <span 
                    key={index} 
                    className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                  >
                    {role}
                  </span>
                ))
              ) : (
                <span className="text-muted-foreground text-sm">No tienes roles asignados</span>
              )}
            </div>
          </div>
          
          <Button variant="outline" onClick={disconnect} className="mt-4">
            Desconectar Wallet
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}