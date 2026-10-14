import { formatDisplayDate } from '../../utils/dates';

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-8">
      <div>
        <h1 className="font-serif text-[28px] leading-tight text-foreground tracking-tight">
          {title}
        </h1>
        <p className="text-sm text-muted mt-1">{subtitle || formatDisplayDate()}</p>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
