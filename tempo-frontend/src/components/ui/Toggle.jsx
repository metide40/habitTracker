export function Toggle({ checked, onChange, label, id, disabled }) {
  return (
    <label
      htmlFor={id}
      className={`inline-flex items-center gap-3 cursor-pointer ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <button
        type="button"
        role="switch"
        id={id}
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`
          relative w-10 h-6 rounded-full transition-colors duration-fast
          focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/40
          ${checked ? 'bg-primary' : 'bg-border'}
        `}
      >
        <span
          className={`
            absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-soft
            transition-transform duration-fast
            ${checked ? 'translate-x-4' : 'translate-x-0'}
          `}
        />
      </button>
      {label && <span className="text-sm text-foreground">{label}</span>}
    </label>
  );
}
