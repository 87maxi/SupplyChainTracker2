import { Netbook, NetbookState } from '@/types/supply-chain-types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, ShieldCheck, Monitor, Truck, Calendar, Box, Settings } from 'lucide-react';
import { useUserRoles } from '@/hooks/useUserRoles';

// Reusable Status Badge Component (Local to avoid circular deps if possible, or import if shared)
function StatusBadge({ status }: { status: NetbookState }) {
    const getStatusConfig = (status: NetbookState) => {
        switch (status) {
            case 'FABRICADA':
                return { variant: 'secondary' as const, icon: Package, label: 'Fabricada' };
            case 'HW_APROBADO':
                return { variant: 'outline-glow' as const, icon: ShieldCheck, label: 'HW Aprobado' };
            case 'SW_VALIDADO':
                return { variant: 'success' as const, icon: Monitor, label: 'SW Validado' };
            case 'DISTRIBUIDA':
                return { variant: 'gradient' as any, icon: Truck, label: 'Distribuida' };
            default:
                return { variant: 'outline' as const, icon: Package, label: status };
        }
    };

    const { variant, icon: Icon, label } = getStatusConfig(status);

    return (
        <Badge variant={variant} className="gap-1.5 px-3 py-1">
            <Icon className="h-3.5 w-3.5" />
            {label}
        </Badge>
    );
}

interface TrackingCardProps {
    netbook: Netbook;
    onAction?: (action: string, serial: string) => void;
}

export function TrackingCard({ netbook, onAction }: TrackingCardProps) {
    const { isHardwareAuditor, isSoftwareTechnician, isSchool, isAdmin } = useUserRoles();

    if (!netbook) return null;

    // Format date helper
    const formatDate = (timestamp: string | number) => {
        if (!timestamp || timestamp === '0') return 'Pendiente';
        try {
            return new Date(Number(timestamp) * 1000).toLocaleDateString();
        } catch (e) {
            return 'Fecha inválida';
        }
    };

    return (
        <Card className="hover:bg-white/5 transition-all duration-200 border-white/5 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

            <CardContent className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Main Info Section */}
                    <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Serial Number</span>
                                    <Badge variant="outline" className="font-mono text-sm font-bold tracking-tight border-primary/20 text-primary bg-primary/5">
                                        {netbook.serialNumber}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    <span>
                                        {netbook.currentState === 'FABRICADA' ? 'Registrado: ' : 'Actualizado: '}
                                        {formatDate(netbook.distributionTimestamp)}
                                    </span>
                                </div>
                            </div>
                            <StatusBadge status={netbook.currentState as NetbookState} />
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/5">
                                <div className="p-2 rounded-md bg-blue-500/10 text-blue-400">
                                    <Box className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Lote (Batch ID)</p>
                                    <p className="text-sm font-medium truncate" title={netbook.batchId || 'N/A'}>
                                        {netbook.batchId || 'N/A'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/5">
                                <div className="p-2 rounded-md bg-purple-500/10 text-purple-400">
                                    <Settings className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Especificaciones</p>
                                    <p className="text-sm font-medium truncate" title={netbook.initialModelSpecs || 'N/A'}>
                                        {netbook.initialModelSpecs || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions Section */}
                    {onAction && (
                        <div className="flex items-center justify-end lg:border-l lg:border-white/10 lg:pl-6">
                            {(netbook.currentState === 'FABRICADA') && (isHardwareAuditor || isAdmin) && (
                                <Button
                                    size="default"
                                    className="w-full lg:w-auto bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/50 shadow-[0_0_15px_-3px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_-3px_rgba(16,185,129,0.2)] transition-all"
                                    onClick={() => onAction('audit', netbook.serialNumber)}
                                >
                                    <ShieldCheck className="mr-2 h-4 w-4" />
                                    Realizar Auditoría HW
                                </Button>
                            )}

                            {(netbook.currentState === 'HW_APROBADO') && (isSoftwareTechnician || isAdmin) && (
                                <Button
                                    size="default"
                                    className="w-full lg:w-auto bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/50 shadow-[0_0_15px_-3px_rgba(168,85,247,0.1)] hover:shadow-[0_0_20px_-3px_rgba(168,85,247,0.2)] transition-all"
                                    onClick={() => onAction('validate', netbook.serialNumber)}
                                >
                                    <Monitor className="mr-2 h-4 w-4" />
                                    Validar Software
                                </Button>
                            )}

                            {(netbook.currentState === 'SW_VALIDADO') && (isSchool || isAdmin) && (
                                <Button
                                    size="default"
                                    className="w-full lg:w-auto bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/50 shadow-[0_0_15px_-3px_rgba(245,158,11,0.1)] hover:shadow-[0_0_20px_-3px_rgba(245,158,11,0.2)] transition-all"
                                    onClick={() => onAction('assign', netbook.serialNumber)}
                                >
                                    <Truck className="mr-2 h-4 w-4" />
                                    Asignar a Estudiante
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
