'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { uploadToIPFS } from '@/lib/ipfsService';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Esquema de validación para el formulario de auditoría
const auditSchema = z.object({
  serialNumber: z.string().min(1, 'Número de serie requerido'),
  auditDate: z.string().min(1, 'Fecha requerida'),
  auditorName: z.string().min(1, 'Nombre requerido'),
  componentsVerified: z.object({
    cpu: z.object({
      expected: z.string(),
      found: z.string(),
      status: z.enum(['match', 'mismatch'])
    }),
    ram: z.object({
      expected: z.string(),
      found: z.string(),
      status: z.enum(['match', 'mismatch'])
    }),
    storage: z.object({
      expected: z.string(),
      found: z.string(),
      status: z.enum(['match', 'mismatch'])
    }),
    batteryCycleCount: z.number().min(0),
    batteryHealth: z.number().min(0).max(100)
  }),
  physicalCondition: z.object({
    case: z.string().min(1, 'Estado de la carcasa requerido'),
    screen: z.string().min(1, 'Estado de la pantalla requerido'),
    keyboard: z.string().min(1, 'Estado del teclado requerido'),
    ports: z.string().min(1, 'Estado de los puertos requerido')
  }),
  verificationResult: z.boolean(),
  comments: z.string().optional()
});

// Tipos de datos
export type AuditFormData = z.infer<typeof auditSchema>;

interface HardwareAuditFormProps {
  onSuccess: (ipfsHash: string) => void;
}

export function HardwareAuditForm({ onSuccess }: HardwareAuditFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Configuración del formulario
  const { register, handleSubmit, formState: { errors } } = useForm<AuditFormData>({ 
    resolver: zodResolver(auditSchema) 
  });

  // Manejador de envío del formulario
  const onSubmit: SubmitHandler<AuditFormData> = async (data) => {
    setIsSubmitting(true);
    
    try {
      // Añadir información adicional
      const auditData = {
        ...data,
        submittedAt: new Date().toISOString(),
        formatVersion: '1.0'
      };
      
      // Enviar a IPFS
      const result = await uploadToIPFS(auditData);
      
      toast({
        title: "Éxito",
        description: "Informe de auditoría guardado en IPFS",
      });
      
      // Llamar al callback con el hash
      onSuccess(result.hash);
      
    } catch (error) {
      console.error('Error submitting audit:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el informe. Por favor intente nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Formulario de Auditoría de Hardware</CardTitle>
          <CardDescription>
            Complete todos los campos para generar el informe de auditoría
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serialNumber">Número de Serie</Label>
                <Input id="serialNumber" {...register('serialNumber')} />
                {errors.serialNumber && <span className="text-sm text-red-500">{errors.serialNumber.message}</span>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="auditDate">Fecha de Auditoría</Label>
                <Input id="auditDate" type="datetime-local" {...register('auditDate')} />
                {errors.auditDate && <span className="text-sm text-red-500">{errors.auditDate.message}</span>}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="auditorName">Nombre del Auditor</Label>
              <Input id="auditorName" {...register('auditorName')} />
              {errors.auditorName && <span className="text-sm text-red-500">{errors.auditorName.message}</span>}
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-medium mb-4">Componentes Verificados</h3>
              
              <div className="grid gap-4">
                {/* CPU */}
                <div className="border p-4 rounded-md">
                  <h4 className="font-medium mb-2">CPU</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Especificación Esperada</Label>
                      <Input defaultValue="Intel Core i3" {...register('componentsVerified.cpu.expected')} />
                    </div>
                    <div className="space-y-2">
                      <Label>Encontrado</Label>
                      <Input {...register('componentsVerified.cpu.found')} />
                      {errors.componentsVerified?.cpu?.found && <span className="text-sm text-red-500">{errors.componentsVerified.cpu.found.message}</span>}
                    </div>
                    <div className="space-y-2">
                      <Label>Estado</Label>
                      <select className="w-full p-2 border rounded" {...register('componentsVerified.cpu.status')}>
                        <option value="match">Coincide</option>
                        <option value="mismatch">No coincide</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* RAM */}
                <div className="border p-4 rounded-md">
                  <h4 className="font-medium mb-2">RAM</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Especificación Esperada</Label>
                      <Input defaultValue="8GB" {...register('componentsVerified.ram.expected')} />
                    </div>
                    <div className="space-y-2">
                      <Label>Encontrado</Label>
                      <Input {...register('componentsVerified.ram.found')} />
                      {errors.componentsVerified?.ram?.found && <span className="text-sm text-red-500">{errors.componentsVerified.ram.found.message}</span>}
                    </div>
                    <div className="space-y-2">
                      <Label>Estado</Label>
                      <select className="w-full p-2 border rounded" {...register('componentsVerified.ram.status')}>
                        <option value="match">Coincide</option>
                        <option value="mismatch">No coincide</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* Storage */}
                <div className="border p-4 rounded-md">
                  <h4 className="font-medium mb-2">Almacenamiento</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Especificación Esperada</Label>
                      <Input defaultValue="256GB SSD" {...register('