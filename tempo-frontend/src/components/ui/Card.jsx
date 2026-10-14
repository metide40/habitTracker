export function Card({ children, className = '', padding = true, ...props }) {
  return (
    <div
      className={`
        bg-surface border border-border rounded-lg shadow-soft
        ${padding ? 'p-4' : ''} ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
