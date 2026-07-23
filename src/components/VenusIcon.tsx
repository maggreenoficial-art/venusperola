export function VenusIcon({ className = "" }: { className?: string }) {
  return (
    <div className={`venus-icon ${className}`} aria-hidden>
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="venus-planet-body" cx="38%" cy="32%" r="65%">
            <stop offset="0%" stopColor="#f8f0e4" />
            <stop offset="35%" stopColor="#e8c89a" />
            <stop offset="65%" stopColor="#c9a06a" />
            <stop offset="100%" stopColor="#7a5a38" />
          </radialGradient>
          <radialGradient id="venus-atmosphere" cx="50%" cy="50%" r="50%">
            <stop offset="70%" stopColor="transparent" />
            <stop offset="88%" stopColor="#d4a0a8" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#d4a0a8" stopOpacity="0.45" />
          </radialGradient>
          <clipPath id="venus-clip">
            <circle cx="60" cy="60" r="30" />
          </clipPath>
        </defs>

        <circle
          className="venus-orbit"
          cx="60"
          cy="60"
          r="52"
          stroke="currentColor"
          strokeWidth="0.5"
          opacity="0.2"
        />
        <circle
          className="venus-orbit venus-orbit--delay"
          cx="60"
          cy="60"
          r="44"
          stroke="currentColor"
          strokeWidth="0.5"
          opacity="0.12"
        />

        <circle className="venus-glow" cx="60" cy="60" r="38" fill="currentColor" opacity="0.1" />

        <g className="venus-planet">
          <circle cx="60" cy="60" r="30" fill="url(#venus-planet-body)" />
          <circle cx="60" cy="60" r="30" fill="url(#venus-atmosphere)" />

          <g className="venus-clouds" clipPath="url(#venus-clip)">
            <ellipse cx="48" cy="52" rx="14" ry="5" fill="#f5ead8" opacity="0.35" />
            <ellipse cx="72" cy="58" rx="11" ry="4" fill="#d4b88a" opacity="0.3" />
            <ellipse cx="55" cy="68" rx="16" ry="4.5" fill="#c9a87c" opacity="0.25" />
            <ellipse cx="68" cy="48" rx="9" ry="3" fill="#fff8f0" opacity="0.4" />
            <ellipse cx="42" cy="62" rx="8" ry="3.5" fill="#e8d4b8" opacity="0.3" />
          </g>

          <ellipse
            cx="72"
            cy="68"
            rx="10"
            ry="18"
            fill="#000000"
            opacity="0.18"
            clipPath="url(#venus-clip)"
          />
        </g>

        <circle className="venus-spark venus-spark--1" cx="98" cy="32" r="1.5" fill="currentColor" />
        <circle className="venus-spark venus-spark--2" cx="18" cy="48" r="1" fill="currentColor" />
        <circle className="venus-spark venus-spark--3" cx="92" cy="82" r="1.2" fill="currentColor" />
        <circle className="venus-spark venus-spark--4" cx="26" cy="88" r="0.8" fill="currentColor" />
      </svg>
    </div>
  );
}
