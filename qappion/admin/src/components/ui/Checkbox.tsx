import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        className={cn(
          'h-4 w-4 rounded border-slate-300 text-slate-600 focus:ring-slate-500 focus:ring-offset-0',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
