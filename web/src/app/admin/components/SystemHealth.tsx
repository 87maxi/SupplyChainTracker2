'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAccount, useReadContract } from 'wagmi';
import { config } from '@/lib/wagmi/config';
import SupplyChainTrackerABI from '@/contracts/abi/SupplyChainTracker.json';
import { NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS } from '@/lib/env';
import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { getRoleHashes } from '@/lib/roleUtils';

const contractAddress = NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS as `0x${string}`;

export function SystemHealth() {
    const { address, chainId } = useAccount();
    const [localHashes, setLocalHashes] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // 1. Check Contract Connection (Read Name)
    const { data: contractName, isError: isContractError, refetch: refetchName } = useReadContract({
        address: contractAddress,
        abi: SupplyChainTrackerABI,
        functionName: 'name',
    });

    // 2. Check Admin Role
    const { data: defaultAdminRole } = useReadContract({
        address: contractAddress,
        abi: SupplyChainTrackerABI,
        functionName: 'DEFAULT_ADMIN_ROLE',
    });

    const { data: isAdmin, refetch: refetchAdmin } = useReadContract({
        address: contractAddress,
        abi: SupplyChainTrackerABI,
        functionName: 'hasRole',
        args: [defaultAdminRole, address],
        query: {
            enabled: !!address && !!defaultAdminRole,
        }
    });

    // 3. Check Fabricante Role Hash (Contract vs Local)
    const { data: contractFabricanteHash, refetch: refetchHash } = useReadContract({
        address: contractAddress,
        abi: SupplyChainTrackerABI,
        functionName: 'FABRICANTE_ROLE',
    });

    const checkHealth = async () => {
        setLoading(true);
        try {
            refetchName();
            refetchAdmin();
            refetchHash();
            const hashes = await getRoleHashes();
            setLocalHashes(hashes);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkHealth();
    }, [address]);

    const isNetworkCorrect = chainId === 31337;
    const isHashConsistent = localHashes?.FABRICANTE === contractFabricanteHash;

    return (
        <Card className="mb-6 border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg flex items-center gap-2">
                        🏥 Diagnóstico del Sistema
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={checkHealth} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Network Status */}
                    <div className="p-3 bg-muted/20 rounded-lg border">
                        <div className="text-xs text-muted-foreground mb-1">Red (Chain ID)</div>
                        <div className="flex items-center gap-2 font-mono text-sm">
                            {isNetworkCorrect ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                            )}
                            {chainId || 'Desconectado'}
                            {!isNetworkCorrect && chainId && <span className="text-xs text-red-500">(Esperado: 31337)</span>}
                        </div>
                    </div>

                    {/* Contract Status */}
                    <div className="p-3 bg-muted/20 rounded-lg border">
                        <div className="text-xs text-muted-foreground mb-1">Contrato</div>
                        <div className="flex items-center gap-2 font-mono text-sm">
                            {!isContractError && contractName ? (
                                <>
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    Conectado ({contractName as string})
                                </>
                            ) : (
                                <>
                                    <XCircle className="h-4 w-4 text-red-500" />
                                    Error de Conexión
                                </>
                            )}
                        </div>
                    </div>

                    {/* Admin Status */}
                    <div className="p-3 bg-muted/20 rounded-lg border">
                        <div className="text-xs text-muted-foreground mb-1">Permiso Admin</div>
                        <div className="flex items-center gap-2 font-mono text-sm">
                            {isAdmin ? (
                                <>
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    Verificado
                                </>
                            ) : (
                                <>
                                    <XCircle className="h-4 w-4 text-red-500" />
                                    No es Admin
                                </>
                            )}
                        </div>
                    </div>

                    {/* Hash Consistency */}
                    <div className="p-3 bg-muted/20 rounded-lg border">
                        <div className="text-xs text-muted-foreground mb-1">Consistencia de Roles</div>
                        <div className="flex items-center gap-2 font-mono text-sm">
                            {isHashConsistent ? (
                                <>
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    Correcto
                                </>
                            ) : (
                                <>
                                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                    Mismatch
                                </>
                            )}
                        </div>
                        {!isHashConsistent && (
                            <div className="text-[10px] mt-1 text-muted-foreground truncate">
                                C: {(contractFabricanteHash as string)?.slice(0, 6)}...
                                L: {localHashes?.FABRICANTE?.slice(0, 6)}...
                            </div>
                        )}
                    </div>
                </div>

                {/* Manual Role Checker */}
                <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium mb-2">Verificar Roles de Usuario</h4>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Dirección (0x...)"
                            className="flex-1 h-8 px-2 text-sm border rounded bg-background"
                            id="role-check-input"
                        />
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                                const input = document.getElementById('role-check-input') as HTMLInputElement;
                                const addr = input.value;
                                if (!addr) return;

                                console.log('Checking roles for:', addr);
                                try {
                                    // Import dynamically to avoid hook rules issues if possible, or just use the service
                                    const { hasRole } = await import('@/services/SupplyChainService');
                                    const { getRoleHashes } = await import('@/lib/roleUtils');
                                    const hashes = await getRoleHashes();

                                    const results = await Promise.all(
                                        Object.entries(hashes).map(async ([name, hash]) => {
                                            const has = await hasRole(hash, addr);
                                            return { name, has };
                                        })
                                    );

                                    console.log('Role Results:', results);
                                    alert(`Roles para ${addr}:\n` + results.map(r => `${r.name}: ${r.has ? '✅' : '❌'}`).join('\n'));
                                } catch (e: any) {
                                    alert('Error: ' + e.message);
                                }
                            }}
                        >
                            Verificar
                        </Button>
                    </div>
                </div>

                {/* Transaction Receipt Checker */}
                <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium mb-2">Verificar Transacción</h4>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Hash (0x...)"
                            className="flex-1 h-8 px-2 text-sm border rounded bg-background"
                            id="tx-check-input"
                        />
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                                const input = document.getElementById('tx-check-input') as HTMLInputElement;
                                const hash = input.value as `0x${string}`;
                                if (!hash) return;

                                console.log('Checking TX:', hash);
                                try {
                                    const { waitForTransactionReceipt } = await import('@wagmi/core');
                                    const { config } = await import('@/lib/wagmi/config');

                                    const receipt = await waitForTransactionReceipt(config, { hash, timeout: 5000 });
                                    console.log('Receipt:', receipt);
                                    alert(`Estado: ${receipt.status === 'success' ? '✅ Éxito' : '❌ Falló'}\nBloque: ${receipt.blockNumber}`);
                                } catch (e: any) {
                                    console.error(e);
                                    alert('Error (probablemente pendiente o no encontrada): ' + e.message);
                                }
                            }}
                        >
                            Verificar TX
                        </Button>
                    </div>
                </div>

                <div className="mt-2 text-[10px] text-muted-foreground font-mono">
                    Wallet: {address}
                </div>
            </CardContent>
        </Card>
    );
}
