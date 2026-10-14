import { forwardRef } from 'react';

export const Input = forwardRef(function Input(
  { label, error, className = '', id, ...props },
  ref
) {
  const inputId = id || props.name;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`
          h-9 px-3 rounded bg-surface border border-border text-sm text-foreground
          placeholder:text-muted
          focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary
          disabled:opacity-50
          ${error ? 'border-category-coral' : ''} ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-category-coral">{error}</p>}
    </div>
  );
});
