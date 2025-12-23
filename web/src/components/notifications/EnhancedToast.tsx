"use client";

import { useToast } from '@/hooks/use-toast';
import { Toast } from '@/components/ui/toast';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

export function EnhancedToast() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-2 max-w-sm">
      {toasts.map(function ({ id, title, description, action, ...props }) {
        // Determine icon based on variant
        let IconComponent = Info;
        const variant = props.variant || 'default';
        
        if (variant === 'destructive') {
          IconComponent = XCircle;
        } else if (variant === 'default') {
          IconComponent = Info;
        }
        
        // For custom variants, we'll use different icons
        // Note: The Toast component only supports 'default' and 'destructive' officially
        // but we can extend the logic here for visual purposes
        const customVariant = props.variant as string;
        if (customVariant === 'success') {
          IconComponent = CheckCircle;
        } else if (customVariant === 'warning') {
          IconComponent = AlertCircle;
        }

        return (
          <div className="flex items-start gap-3 p-4 border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-md">
            <div className="mt-0.5">
              <IconComponent 
                className={`h-5 w-5 ${
                  variant === 'destructive' ? 'text-destructive' :
                  customVariant === 'success' ? 'text-green-500' :
                  customVariant === 'warning' ? 'text-yellow-500' :
                  'text-blue-500'
                }`} 
              />
            </div>
            <div className="flex-1 space-y-1">
              {title && <h3 className="font-medium text-sm">{title}</h3>}
              {description && (
                <p className="text-sm text-gray-600 mt-1">
                  {typeof description === 'string' ? description : description}
                </p>
              )}
            </div>
            <button
              onClick={() => dismiss(id)}
              className="ml-4 text-gray-400 hover:text-gray-600 text-sm"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
