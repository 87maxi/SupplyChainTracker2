'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { uploadToIPFS } from '@/lib/ipfsClient';
import { SubmitHandler, useForm } from 'react-hook-form';

// Interfaz para el formulario
interface FormValues {
  content: string;
}

interface FormUploaderProps {
  onUploadComplete: (hash: string) => void;
  formTitle?: string;
  formDescription?: string;
}

export function FormUploader({ onUploadComplete, formTitle = "Subir Formulario a IPFS", formDescription = "Complete el formulario y suba sus datos a IPFS" }: FormUploaderProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedHash, setUploadedHash] = useState<string | null>(null);
  
  // Configurar el formulario
  const { register, handleSubmit, reset } = useForm<FormValues>();

  // Manejador de envío
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsSubmitting(true);
    
    try {
      // Validar JSON
      let jsonContent;
      try {
        jsonContent = JSON.parse(data.content);
      } catch (e) {
        toast({
          title: "Error",
          description: "El contenido debe ser JSON válido",
          variant: "destructive"
        });
        return;
      }
      
      // Subir a IPFS
      const result = await uploadToIPFS({
        ...jsonContent,
        timestamp: new Date().toISOString()
      });
      
      setUploadedHash(result.hash);
      
      toast({
        title: "Éxito",
        description: "Datos subidos a IPFS correctamente",
      });
      
      // Notificar al padre con el hash
      onUploadComplete(result.hash);
      
      // Resetear el formulario
      reset();
      
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      toast({
        title: "Error",
        description: "No se pudieron subir los datos a IPFS",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{formTitle}</CardTitle>
        <CardDescription>{formDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">
              Contenido (JSON)
            </label>
            <Textarea
              id="content"
              {...register('content')}
              placeholder='{\n  "serialNumber": "SN-ABC123XYZ789",\n  "auditDate": "2024-01-15T10:30:00Z",\n  "components": {\n    "cpu": "Intel Core i3",\n    "ram": "8GB"\n  }\n}'
              className="font-mono h-32"
              required
            />
            <p className="text-sm text-muted-foreground">
              Ingrese los datos en formato JSON
            </p>
          </div>
          
          {uploadedHash && (
            <div className="p-3 bg-muted rounded-md text-sm">
              <strong>Hash IPFS:</strong> {uploadedHash}
              <div className="mt-1">
                <a 
                  href={`https://ipfs.io/ipfs/${uploadedHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Ver en IPFS
                </a>
              </div>
            </div>
          )}
          
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Subiendo...' : 'Subir a IPFS'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}