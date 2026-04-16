import type { ReactNode } from 'react';

export type BadgeVariant = 'gray' | 'blue' | 'orange' | 'purple' | 'green' | 'red';

export interface BadgeProps {
  variant: BadgeVariant;
  children: ReactNode;
}
