import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Input = forwardRef(
  ({ className, type = 'text', error, label, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={cn(
            'block w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400',
            'focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20',
            'disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed',
            'dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-500',
            'dark:focus:border-[var(--color-primary)] dark:focus:ring-[var(--color-primary)]/20',
            'transition-all',
            error && 'border-red-300 focus:border-red-400 focus:ring-red-400/20',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-red-500 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
