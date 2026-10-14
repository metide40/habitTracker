import { forwardRef } from 'react';

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-hover shadow-soft',
  secondary: 'bg-surface text-foreground border border-border hover:bg-background shadow-soft',
  ghost: 'bg-transparent text-muted hover:text-foreground hover:bg-background',
  danger: 'bg-category-coral/10 text-category-coral hover:bg-category-coral/20',
};

const sizes = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
  lg: 'h-10 px-5 text-sm gap-2',
};

export const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', className = '', children, disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center font-medium rounded
        transition-colors duration-fast
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/40 focus-visible:outline-offset-2
        disabled:opacity-50 disabled:pointer-events-none
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
});
