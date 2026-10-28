export const input =
  'mt-2 w-full rounded-lg border border-line bg-paper px-3 py-3 text-base text-ink placeholder:text-muted/70 sm:text-sm';
export const sheet = 'rounded-xl border border-line bg-paper p-5 sm:p-7';
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold tracking-[.2em] text-gold">
      {children}
    </p>
  );
}
export function Feedback({
  error,
  success,
}: {
  error?: string;
  success?: string;
}) {
  if (!error && !success) return null;
  return (
    <p
      role={error ? 'alert' : 'status'}
      className={`mt-4 rounded-lg p-3 text-sm ${error ? 'bg-soft text-burgundy' : 'bg-cream text-ink'}`}
    >
      {error || success}
    </p>
  );
}
