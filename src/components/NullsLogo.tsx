import { motion } from 'motion/react';

interface NullsLogoProps {
  visible?: boolean;
  animateBoot?: boolean;
  className?: string;
}

/**
 * Exact recreation of the glowing electric-blue & white double-line NULLS boot logo
 * from the reference boot screen, complete with CRT phosphor bloom and scanlines.
 */
export function NullsLogo({ visible = true, animateBoot = true, className = '' }: NullsLogoProps) {
  // Exact stroke paths matching the rounded-geometric NULLS wordmark
  const letterPaths = [
    // N: Vertical left pillar -> rounded arch top -> diagonal down-right flush to baseline
    'M 34 113 L 34 44 C 34 24, 58 21, 69 40 L 103 113',
    // U: Vertical left -> smooth bottom U curve flush at y=100 center (113 bottom) -> vertical right
    'M 134 18 L 134 73 A 27 27 0 0 0 188 73 L 188 18',
    // L (1): Vertical -> curved bottom-left -> horizontal right
    'M 222 18 L 222 82 Q 222 100 240 100 L 274 100',
    // L (2): Vertical -> curved bottom-left -> horizontal right
    'M 304 18 L 304 82 Q 304 100 322 100 L 356 100',
    // S: Evenly spaced top (31), mid (65.5), bottom (100) bars
    'M 456 31 L 403 31 A 17.25 17.25 0 0 0 403 65.5 L 436 65.5 A 17.25 17.25 0 0 1 436 100 L 382 100',
  ];

  if (!visible) return null;

  return (
    <motion.div
      initial={animateBoot ? { opacity: 0, scale: 0.94, filter: 'brightness(1.9) blur(4px)' } : false}
      animate={{ opacity: 1, scale: 1, filter: 'brightness(1) blur(0px)' }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      className={`relative select-none ${className}`}
    >
      {/* Phosphor radial bloom behind logo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -m-4 rounded-full bg-[#1064ff]/25 blur-xl"
      />

      <svg
        viewBox="0 0 490 132"
        className="relative w-full h-auto overflow-visible"
        role="img"
        aria-label="NULLS Logo"
      >
        <defs>
          {/* Neon blue phosphor glow filter */}
          <filter id="nulls-phosphor-glow" x="-25%" y="-35%" width="150%" height="170%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5.5" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Subtle horizontal CRT scanline mask */}
          <pattern id="nulls-scanline-pattern" width="4" height="3.2" patternUnits="userSpaceOnUse">
            <rect width="4" height="1.9" fill="#ffffff" fillOpacity="1" />
            <rect y="1.9" width="4" height="1.3" fill="#ffffff" fillOpacity="0.62" />
          </pattern>

          <mask id="nulls-scanline-mask">
            <rect x="-20" y="-20" width="540" height="175" fill="url(#nulls-scanline-pattern)" />
          </mask>

          <linearGradient id="nulls-blue-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1A75FF" />
            <stop offset="50%" stopColor="#0A5BFF" />
            <stop offset="100%" stopColor="#0042E0" />
          </linearGradient>
        </defs>

        <clipPath id="nulls-baseline-clip">
          <rect x="0" y="18" width="490" height="95" />
        </clipPath>

        <g mask="url(#nulls-scanline-mask)" filter="url(#nulls-phosphor-glow)">
          {/* Outer thick electric-blue letter bodies */}
          {letterPaths.map((d, idx) => (
            <motion.path
              key={`outer-${idx}`}
              d={d}
              clipPath={idx === 0 ? 'url(#nulls-baseline-clip)' : undefined}
              fill="none"
              stroke="url(#nulls-blue-grad)"
              strokeWidth="26"
              strokeLinecap="butt"
              strokeLinejoin="round"
              initial={animateBoot ? { pathLength: 0, opacity: 0.4 } : false}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                duration: 0.55,
                delay: idx * 0.055,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          ))}

          {/* Bright white center-line neon filament inside every letter */}
          {letterPaths.map((d, idx) => (
            <motion.path
              key={`inner-${idx}`}
              d={d}
              clipPath={idx === 0 ? 'url(#nulls-baseline-clip)' : undefined}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="4.6"
              strokeLinecap="butt"
              strokeLinejoin="round"
              initial={animateBoot ? { pathLength: 0, opacity: 0 } : false}
              animate={{ pathLength: 1, opacity: 0.98 }}
              transition={{
                duration: 0.62,
                delay: 0.1 + idx * 0.06,
                ease: [0.16, 1, 0.3, 1],
              }}
            />
          ))}
        </g>
      </svg>
    </motion.div>
  );
}
