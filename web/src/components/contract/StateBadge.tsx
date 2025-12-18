'use client';

import { type State } from '@/types/contract';
import { Badge } from '@/components/ui/badge';

interface StateBadgeProps {
  state: State;
  className?: string;
}

export function StateBadge({ state, className = '' }: StateBadgeProps) {
  const getStateInfo = () => {
    switch (state) {
      case 0:
        return { label: 'Fabricada', variant: 'outline' as const };
      case 1:
        return { label: 'HW Aprobado', variant: 'success' as const };
      case 2:
        return { label: 'SW Validado', variant: 'warning' as const };
      case 3:
        return { label: 'Distribuida', variant: 'default' as const };
      default:
        return { label: 'Desconocido', variant: 'secondary' as const };
    }
  };

  const { label, variant } = getStateInfo();

  return <Badge variant={variant} className={className}>{label}</Badge>;
}