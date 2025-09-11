import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'destructive';
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2',
          {
            'bg-slate-100 text-slate-800': variant === 'default',
            'border border-slate-300 text-slate-700': variant === 'outline',
            'bg-red-100 text-red-800': variant === 'destructive',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';

export { Badge };
