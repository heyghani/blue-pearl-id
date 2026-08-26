/**
 * Decorative seasonal layer for the Halloween / Saints' Day catalog.
 * Pure CSS + inline SVG — no image assets required.
 */
export function HalloweenAtmosphere() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Ambient glow */}
      <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(255,122,24,0.22),transparent_70%)] blur-2xl" />
      <div className="absolute -right-16 top-32 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(120,40,160,0.18),transparent_70%)] blur-2xl" />
      <div className="absolute bottom-24 left-1/3 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(34,120,60,0.12),transparent_70%)] blur-2xl" />

      {/* Soft night mist wash */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(18,12,28,0.35),transparent_55%)]" />

      {/* Hanging string lights / garland across top */}
      <svg
        className="absolute left-0 top-0 h-16 w-full opacity-80 sm:h-20"
        viewBox="0 0 1200 80"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M0 18 C150 48 250 0 400 22 C550 44 650 4 800 26 C950 48 1050 8 1200 28"
          stroke="rgba(255,200,120,0.35)"
          strokeWidth="1.5"
        />
        {[80, 180, 300, 420, 540, 660, 780, 900, 1020, 1120].map((x, i) => (
          <g key={x} className={i % 2 === 0 ? "halloween-sway" : "halloween-sway-delayed"}>
            <line
              x1={x}
              y1={i % 3 === 0 ? 10 : 22}
              x2={x}
              y2={i % 3 === 0 ? 28 : 40}
              stroke="rgba(255,200,120,0.4)"
              strokeWidth="1"
            />
            <circle
              cx={x}
              cy={i % 3 === 0 ? 34 : 46}
              r={i % 2 === 0 ? 5 : 4}
              fill={
                i % 3 === 0
                  ? "rgba(255,140,40,0.85)"
                  : i % 3 === 1
                    ? "rgba(220,40,40,0.75)"
                    : "rgba(50,160,80,0.75)"
              }
            />
            <circle
              cx={x}
              cy={i % 3 === 0 ? 34 : 46}
              r={i % 2 === 0 ? 8 : 7}
              fill={
                i % 3 === 0
                  ? "rgba(255,140,40,0.2)"
                  : i % 3 === 1
                    ? "rgba(220,40,40,0.15)"
                    : "rgba(50,160,80,0.15)"
              }
            />
          </g>
        ))}
      </svg>

      {/* Floating bats */}
      <Bat className="halloween-float absolute left-[6%] top-28 h-7 w-10 text-black/35 sm:h-9 sm:w-12" />
      <Bat className="halloween-float-delayed absolute right-[10%] top-40 h-6 w-9 text-black/30 sm:h-8 sm:w-11" />
      <Bat className="halloween-float absolute right-[22%] top-[58%] hidden h-5 w-8 text-black/25 md:block" />

      {/* Corner pumpkins */}
      <Pumpkin className="absolute bottom-8 left-3 h-14 w-14 opacity-70 sm:left-6 sm:h-20 sm:w-20" />
      <Pumpkin className="absolute bottom-16 right-4 h-10 w-10 opacity-55 sm:right-8 sm:h-14 sm:w-14" />

      {/* Sparkles / stars in empty margins */}
      <Sparkle className="halloween-twinkle absolute left-[14%] top-[42%] h-3 w-3 text-amber-200/70" />
      <Sparkle className="halloween-twinkle-delayed absolute right-[16%] top-[48%] h-2.5 w-2.5 text-orange-200/60" />
      <Sparkle className="halloween-twinkle absolute left-[8%] top-[70%] h-2 w-2 text-amber-100/50" />
      <Sparkle className="halloween-twinkle-delayed absolute right-[6%] top-[72%] h-3 w-3 text-rose-200/50" />

      {/* Snow / ember particles — Christmas-adjacent sparkle rain */}
      <div className="halloween-embers absolute inset-0" />

      {/* Ghost silhouette in far empty side */}
      <Ghost className="halloween-float absolute left-[3%] top-[52%] hidden h-16 w-12 text-white/15 lg:block" />
      <Ghost className="halloween-float-delayed absolute right-[4%] top-[38%] hidden h-12 w-9 text-white/12 xl:block" />
    </div>
  );
}

function Bat({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 40" fill="currentColor">
      <path d="M32 22c-2 0-4 2-4 4 0 1.5 1 3 2.5 3.5-.5 1.5-1.5 2.5-2.5 2.5s-2-1-2.5-2.5C24 29 23 27.5 23 26c0-2 2-4 4-4h5zm0 0c2 0 4 2 4 4 0 1.5-1 3-2.5 3.5.5 1.5 1.5 2.5 2.5 2.5s2-1 2.5-2.5C40 29 41 27.5 41 26c0-2-2-4-4-4h-5z" />
      <path d="M4 18c6-2 12 2 16 6 2-6 6-10 12-10s10 4 12 10c4-4 10-8 16-6-4 4-6 10-6 14-4-4-10-6-14-4-2-4-6-6-8-6s-6 2-8 6c-4-2-10 0-14 4 0-4-2-10-6-14z" />
    </svg>
  );
}

function Pumpkin({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none">
      <ellipse cx="32" cy="38" rx="22" ry="18" fill="#e67a1a" />
      <ellipse cx="22" cy="38" rx="12" ry="16" fill="#d4650f" opacity="0.85" />
      <ellipse cx="42" cy="38" rx="12" ry="16" fill="#f08a28" opacity="0.9" />
      <path d="M30 18c0-6 4-10 8-10 0 4-2 8-4 10" stroke="#3d7a3a" strokeWidth="3" strokeLinecap="round" />
      <path d="M24 34l4 4-4 4M40 34l-4 4 4 4M28 46h8" stroke="#2a1808" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Sparkle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 0l1.5 5.5L15 7l-5.5 1.5L8 14l-1.5-5.5L1 7l5.5-1.5L8 0z" />
    </svg>
  );
}

function Ghost({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 64" fill="currentColor">
      <path d="M24 4c-10 0-18 8-18 20v28c0 2 2.5 2 3.5 0l3.5-5 3.5 5c1 2 3.5 2 3.5 0l3.5-5 3.5 5c1 2 3.5 2 3.5 0l3.5-5 3.5 5c1 2 3.5 2 3.5 0V24C42 12 34 4 24 4z" />
      <circle cx="17" cy="26" r="3" fill="#1a1020" />
      <circle cx="31" cy="26" r="3" fill="#1a1020" />
      <ellipse cx="24" cy="36" rx="4" ry="3" fill="#1a1020" />
    </svg>
  );
}
