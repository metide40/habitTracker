export function EmptyState({ title, description, action, illustration }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {illustration || (
        <svg width="80" height="64" viewBox="0 0 80 64" fill="none" className="mb-5 opacity-80">
          <rect x="12" y="16" width="56" height="40" rx="8" stroke="currentColor" strokeWidth="1.5" className="text-border" />
          <path d="M12 28h56" stroke="currentColor" strokeWidth="1.5" className="text-border" />
          <circle cx="24" cy="22" r="2" fill="currentColor" className="text-primary" />
          <circle cx="32" cy="22" r="2" fill="currentColor" className="text-muted" />
          <circle cx="40" cy="22" r="2" fill="currentColor" className="text-muted" />
          <rect x="20" y="36" width="24" height="3" rx="1.5" fill="currentColor" className="text-border" />
          <rect x="20" y="44" width="16" height="3" rx="1.5" fill="currentColor" className="text-border" />
        </svg>
      )}
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      {description && <p className="text-sm text-muted max-w-xs mb-4">{description}</p>}
      {action}
    </div>
  );
}
