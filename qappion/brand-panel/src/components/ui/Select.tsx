import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  className?: string;
  children: React.ReactNode;
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', children, placeholder, id, name, ...props }, ref) => {
    const autoId = React.useId();
    const resolvedId = id ?? autoId;
    const resolvedName = name ?? resolvedId;
    return (
      <select
        ref={ref}
        id={resolvedId}
        name={resolvedName}
        className={`
          flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm 
          focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent 
          disabled:cursor-not-allowed disabled:opacity-50
          ${className}
        `}
        {...props}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {children}
      </select>
    );
  }
);

Select.displayName = 'Select';