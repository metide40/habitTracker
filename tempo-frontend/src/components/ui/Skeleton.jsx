export function Skeleton({ className = '', width, height }) {
  return (
    <div
      className={`animate-pulse bg-border/60 rounded ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}
