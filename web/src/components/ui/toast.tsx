'use client';

import * as React from "react";

interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
  onDismiss: () => void;
}

export function Toast({ title, description, action, variant = "default", onDismiss }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const variantStyles = {
    default: "bg-white border border-gray-200",
    destructive: "bg-red-100 border border-red-200 text-red-900"
  };

  return (
    <div className={`p-4 rounded-md shadow-md ${variantStyles[variant]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {title && <h3 className="font-medium text-sm">{title}</h3>}
          {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
        </div>
        <button
          onClick={onDismiss}
          className="ml-4 text-gray-400 hover:text-gray-600 text-sm"
        >
          ✕
        </button>
      </div>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}