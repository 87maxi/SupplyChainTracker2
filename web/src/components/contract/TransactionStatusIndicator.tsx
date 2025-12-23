import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';

interface TransactionStatusIndicatorProps {
  status: 'idle' | 'pending' | 'success' | 'error';
  message?: string;
  className?: string;
}

export function TransactionStatusIndicator({ 
  status, 
  message, 
  className = '' 
}: TransactionStatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          variant: 'secondary',
          text: message || 'Procesando...',
          className: 'bg-yellow-100 text-yellow-800'
        };
      case 'success':
        return {
          variant: 'default',
          text: message || 'Completado',
          className: 'bg-green-100 text-green-800'
        };
      case 'error':
        return {
          variant: 'destructive',
          text: message || 'Error',
          className: 'bg-red-100 text-red-800'
        };
      default:
        return {
          variant: 'secondary',
          text: message || 'Listo',
          className: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge 
      variant="outline" 
      className={`${config.className} ${className}`}
    >
      {config.text}
    </Badge>
  );
}