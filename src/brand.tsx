export function LogoMark({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Rozgaar Saathi logo"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="saathi-bridge" x1="10" y1="8" x2="54" y2="58">
          <stop offset="0" stopColor="#2f8b72" />
          <stop offset="1" stopColor="#d98a2b" />
        </linearGradient>
      </defs>
      <rect x="5" y="5" width="54" height="54" rx="17" fill="url(#saathi-bridge)" />
      <path
        d="M15 39c7.5-10.2 25.5-10.2 34 0"
        fill="none"
        stroke="#fff8e8"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M19 42h26"
        fill="none"
        stroke="#fff8e8"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.85"
      />
      <circle cx="32" cy="21" r="8" fill="#fff8e8" />
      <path
        d="M29 21h7m-6-4h5m-4 0c2.8.4 4.2 1.7 4.2 3.8 0 2.5-2.2 4-5.5 4H29l6 5"
        fill="none"
        stroke="#246f5a"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 48h20"
        fill="none"
        stroke="#fff8e8"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  )
}

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="wordmark">
      <LogoMark className="logo-mark" />
      {!compact && (
        <div>
          <strong>Rozgaar Saathi</strong>
          <span>Work, income, dignity</span>
        </div>
      )}
    </div>
  )
}
