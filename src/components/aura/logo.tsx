/**
 * Isotipo de AuraSound.
 * Para cambiar el logo, sustituye este SVG (el nombre está en src/lib/brand.ts).
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="10" fill="none" stroke="currentColor" strokeWidth="2.6" />
      <circle cx="16" cy="16" r="3.1" className="logo-core" />
    </svg>
  );
}
