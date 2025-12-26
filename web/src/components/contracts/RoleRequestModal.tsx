"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { submitRoleRequest } from '@/services/RoleRequestService';
import { useWeb3 } from '@/contexts/Web3Context';
import { useSignMessage } from 'wagmi';

interface RoleRequestModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function RoleRequestModal({ isOpen, onOpenChange }: RoleRequestModalProps) {
    const { address } = useWeb3();
    const { signMessageAsync } = useSignMessage();
    const [role, setRole] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async () => {
        if (!address) {
            toast({
                title: "Error",
                description: "Por favor conecta tu wallet",
                variant: "destructive",
            });
            return;
        }

        if (!role) {
            toast({
                title: "Error",
                description: "Por favor selecciona un rol",
                variant: "destructive",
            });
            return;
        }

        try {
            setLoading(true);

            // 1. Prompt user to sign a message
            const message = `Solicito el rol de ${role} para mi dirección ${address} en SupplyChainTracker.`;
            const signature = await signMessageAsync({ message });

            // 2. Submit request with signature
            await submitRoleRequest(address, role, signature);

            toast({
                title: "Solicitud enviada",
                description: "Tu solicitud de rol ha sido firmada y enviada correctamente. Está pendiente de aprobación.",
            });

            onOpenChange(false);
        } catch (error: any) {
            console.error('Error submitting role request:', error);

            // Handle user rejection
            if (error.code === 4001 || error.name === 'UserRejectedRequestError') {
                toast({
                    title: "Firma rechazada",
                    description: "Debes firmar el mensaje para enviar la solicitud.",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Error",
                    description: error.message || "No se pudo enviar la solicitud",
                    variant: "destructive",
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Solicitar Rol</DialogTitle>
                    <DialogDescription>
                        Selecciona el rol que deseas solicitar para operar en el sistema.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Select value={role} onValueChange={setRole}>
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccione un rol" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="fabricante">Fabricante</SelectItem>
                            <SelectItem value="auditor_hw">Auditor HW</SelectItem>
                            <SelectItem value="tecnico_sw">Técnico SW</SelectItem>
                            <SelectItem value="escuela">Escuela</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Enviando...' : 'Enviar Solicitud'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
