// web/src/hooks/use-notifications.ts

import { useState, useCallback, useRef } from 'react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: Date;
}

export interface UseNotificationsReturn {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

// Duración por defecto para cada tipo de notificación
const DEFAULT_DURATIONS = {
  success: 5000,
  error: 7000,
  warning: 6000,
  info: 4000
};

export const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const timeoutRefs = useRef<Record<string, NodeJS.Timeout>>({});

  const addNotification = useCallback((
    notification: Omit<Notification, 'id' | 'timestamp'>
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const timestamp = new Date();
    const duration = notification.duration || DEFAULT_DURATIONS[notification.type];

    const newNotification: Notification = {
      ...notification,
      id,
      timestamp
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remover notificación después de la duración
    if (duration > 0) {
      timeoutRefs.current[id] = setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    
    // Limpiar timeout si existe
    if (timeoutRefs.current[id]) {
      clearTimeout(timeoutRefs.current[id]);
      delete timeoutRefs.current[id];
    }
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    
    // Limpiar todos los timeouts
    Object.values(timeoutRefs.current).forEach(clearTimeout);
    timeoutRefs.current = {};
  }, []);

  // Helper functions para tipos específicos
  const notify = {
    success: (title: string, message: string, duration?: number) => 
      addNotification({ type: 'success', title, message, duration }),
    
    error: (title: string, message: string, duration?: number) => 
      addNotification({ type: 'error', title, message, duration }),
    
    warning: (title: string, message: string, duration?: number) => 
      addNotification({ type: 'warning', title, message, duration }),
    
    info: (title: string, message: string, duration?: number) => 
      addNotification({ type: 'info', title, message, duration })
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    notify
  };
};

// Hook para notificaciones de transacciones
export const useTransactionNotifications = () => {
  const { notify } = useNotifications();

  const transaction = {
    started: (txHash: string, message = 'Transacción enviada') => {
      return notify.info(
        'Transacción en progreso',
        `${message}. Hash: ${txHash.substr(0, 10)}...`,
        0 // No auto-close
      );
    },

    success: (txHash: string, message = 'Transacción exitosa') => {
      return notify.success(
        '¡Éxito!',
        `${message}. Hash: ${txHash.substr(0, 10)}...`
      );
    },

    error: (error: any, message = 'Error en transacción') => {
      const errorMessage = error.message || error.toString();
      return notify.error(
        'Error',
        `${message}: ${errorMessage}`
      );
    },

    rejected: (message = 'Transacción rechazada') => {
      return notify.warning(
        'Transacción cancelada',
        message
      );
    }
  };

  return { transaction };
};