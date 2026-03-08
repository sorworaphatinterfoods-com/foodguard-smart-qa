import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatusIndicatorProps {
  status: 'pass' | 'warning' | 'fail' | 'hold' | 'info';
  children?: ReactNode;
  className?: string;
  pulse?: boolean;
}

export function StatusIndicator({ status, children, className, pulse }: StatusIndicatorProps) {
  const dotColor = {
    pass: 'bg-status-pass',
    warning: 'bg-status-warning',
    fail: 'bg-status-fail',
    hold: 'bg-status-hold',
    info: 'bg-status-info',
  };

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className={cn(
        'w-2 h-2 rounded-full',
        dotColor[status],
        pulse && 'animate-pulse-alert'
      )} />
      {children && <span className="text-xs font-medium">{children}</span>}
    </span>
  );
}
