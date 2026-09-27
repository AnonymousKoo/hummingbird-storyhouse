export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={compact ? 'brand brand-compact' : 'brand'}>
      <svg aria-hidden="true" className="brand-symbol" viewBox="0 0 40 40">
        <path d="M7 20h11M22 20h11M20 7v26" />
        <path d="M9 20c4-1 8-5 11-11 3 6 7 10 11 11-4 1-8 5-11 11-3-6-7-10-11-11Z" />
        <circle cx="20" cy="20" r="2.5" />
      </svg>
      <span><b>Hummingbird</b>{!compact && <small>Storyhouse</small>}</span>
    </span>
  );
}
