import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const variants = {
  default: 'bg-surface-hover text-foreground-muted border-border',
  primary: 'bg-primary-light text-primary border-primary/20',
  success: 'bg-success-light text-success border-success/20',
  warning: 'bg-warning-light text-amber-700 border-warning/20',
  danger: 'bg-danger-light text-danger border-danger/20',
} as const;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants;
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
