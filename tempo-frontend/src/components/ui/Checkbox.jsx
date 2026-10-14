export function Checkbox({ checked, onChange, id, label, disabled }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      id={id}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`
        relative flex-shrink-0 w-5 h-5 rounded border-2 transition-all duration-fast
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/40 focus-visible:outline-offset-2
        disabled:opacity-50
        ${checked
          ? 'bg-primary border-primary scale-100'
          : 'bg-surface border-border hover:border-muted'
        }
      `}
      style={checked ? { animation: 'scale-in 0.15s ease-out' } : undefined}
    >
      {checked && (
        <svg
          className="absolute inset-0 w-full h-full p-0.5 text-white"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            d="M2.5 6.5L5 9L9.5 3.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="12"
            style={{ animation: 'check-draw 0.18s ease-out forwards' }}
          />
        </svg>
      )}
      {label && <span className="sr-only">{label}</span>}
    </button>
  );
}
