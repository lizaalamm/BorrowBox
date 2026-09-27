import { Link } from 'react-router-dom';

/**
 * BorrowBox brand mark.
 * A gradient tile holding an open, shared box with an outward hand-off arrow.
 * Rendered as pure inline SVG so it stays crisp at every size.
 */
export function LogoMark({ size = 40, className = '', rounded = 'rounded-[13px]' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={`${rounded} ${className}`}
      role="img"
      aria-label="BorrowBox logo"
      focusable="false"
    >
      <defs>
        <linearGradient id="bb-tile" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="55%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
        <linearGradient id="bb-face" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.12" />
        </linearGradient>
      </defs>

      <rect width="48" height="48" rx="13" fill="url(#bb-tile)" />
      <rect x="0.75" y="0.75" width="46.5" height="46.5" rx="12.5" fill="none" stroke="#ffffff" strokeOpacity="0.22" strokeWidth="1.5" />

      {/* open box body */}
      <path d="M24 14.5 36 21v10.8L24 37.6 12 31.8V21Z" fill="url(#bb-face)" />
      <path d="M12 21 24 14.5 36 21 24 27.4Z" fill="#ffffff" fillOpacity="0.55" />
      <path
        d="M24 27.4v10.2M12 21l12 6.4L36 21M24 14.5 36 21v10.8L24 37.6 12 31.8V21Z"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* hand-off arrow rising out of the box */}
      <path
        d="M28.6 22.4 37.4 13.6"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.3"
        strokeLinecap="round"
      />
      <path
        d="M31.6 13.4h6.2v6.2"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Full lockup: mark + wordmark (+ optional tagline).
 */
export default function Logo({
  to = '/',
  size = 40,
  showTagline = true,
  className = '',
  wordmarkClass = 'text-[21px]',
}) {
  const content = (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <span className="relative inline-flex flex-shrink-0">
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-[13px] bg-gradient-to-br from-brand-600 via-violet-600 to-cyan-500 opacity-25 blur-md transition-opacity duration-300 group-hover:opacity-45"
        />
        <LogoMark size={size} className="relative" />
      </span>
      <span className="flex flex-col leading-none">
        <span className={`font-display font-bold tracking-tight text-foreground ${wordmarkClass}`}>
          Borrow<span className="text-brand-600 dark:text-brand-400">Box</span>
        </span>
        {showTagline && (
          <span className="mt-1 text-[9.5px] font-bold uppercase tracking-[0.22em] text-zinc-400 dark:text-zinc-500">
            Community lending
          </span>
        )}
      </span>
    </span>
  );

  if (!to) return content;
  return (
    <Link to={to} className="group inline-flex items-center" aria-label="BorrowBox home">
      {content}
    </Link>
  );
}
