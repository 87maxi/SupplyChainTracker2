'use client';

import { Toast, ToastClose, ToastProvider, ToastViewport } from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <Toast.Title>{title}</Toast.Title>}
              {description && (<Toast.Description>{description}</Toast.Description>)}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}