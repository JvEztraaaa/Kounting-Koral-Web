import { cn } from '../../lib/utils';

function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'surface-card overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-raise)] dark:bg-slate-800/95',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function CardHeader({ className, children, ...props }) {
  return (
    <div
      className={cn('px-5 sm:px-6 py-4 border-b border-slate-200/90 dark:border-slate-700/80', className)}
      {...props}
    >
      {children}
    </div>
  );
}

function CardTitle({ className, children, ...props }) {
  return (
    <h3
      className={cn('text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100', className)}
      {...props}
    >
      {children}
    </h3>
  );
}

function CardDescription({ className, children, ...props }) {
  return (
    <p
      className={cn('text-sm text-slate-500 dark:text-slate-400 mt-1', className)}
      {...props}
    >
      {children}
    </p>
  );
}

function CardContent({ className, children, ...props }) {
  return (
    <div className={cn('px-5 sm:px-6 py-4 sm:py-5', className)} {...props}>
      {children}
    </div>
  );
}

function CardFooter({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'px-5 sm:px-6 py-4 border-t border-slate-200/90 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/60',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
export default Card;
