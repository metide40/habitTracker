const vars = {
  sage: 'var(--color-sage)',
  coral: 'var(--color-coral)',
  amber: 'var(--color-amber)',
  sky: 'var(--color-sky)',
  rose: 'var(--color-rose)',
  primary: 'var(--color-primary)',
};

export function Badge({ children, color = 'muted', className = '' }) {
  const c = vars[color];
  const style = c
    ? { color: c, background: `color-mix(in srgb, ${c} 14%, transparent)` }
    : { color: 'var(--color-muted)', border: '1px solid var(--color-border)' };
  return (
    <span
      style={style}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-2xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}
