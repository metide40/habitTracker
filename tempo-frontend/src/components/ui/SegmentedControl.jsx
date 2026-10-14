export function SegmentedControl({ options, value, onChange, className = '' }) {
  return (
    <div
      role="radiogroup"
      className={`inline-flex p-0.5 rounded bg-background border border-border ${className}`}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={active}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`
              px-3 h-7 text-xs font-medium rounded transition-colors duration-fast
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/40
              ${active ? 'bg-surface text-foreground shadow-soft' : 'text-muted hover:text-foreground'}
            `}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
