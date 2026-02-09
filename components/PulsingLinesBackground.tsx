"use client";

/**
 * Animated background: grid of horizontal and vertical lines that pulse
 * in a continuous, staggered wave. Orange/amber accent, works in light and dark.
 */
const ROWS = 14;
const COLS = 20;

export function PulsingLinesBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden bg-background"
      aria-hidden
    >
      {/* Horizontal lines – gradient fades at edges, pulse opacity */}
      <div className="absolute inset-0 flex flex-col justify-between gap-0">
        {Array.from({ length: ROWS }).map((_, i) => (
          <div
            key={`h-${i}`}
            className="h-[2px] w-full shrink-0 bg-gradient-to-r from-transparent via-orange-500/70 to-transparent dark:via-orange-400/60"
            style={{
              animation: "pulse-line 2.2s ease-in-out infinite",
              animationDelay: `${(i / ROWS) * 2.2}s`,
            }}
          />
        ))}
      </div>
      {/* Vertical lines – staggered delay for wave effect */}
      <div className="absolute inset-0 flex justify-between gap-0">
        {Array.from({ length: COLS }).map((_, i) => (
          <div
            key={`v-${i}`}
            className="w-[2px] shrink-0 bg-gradient-to-b from-transparent via-amber-500/60 to-transparent dark:via-amber-400/50"
            style={{
              animation: "pulse-line 2.2s ease-in-out infinite",
              animationDelay: `${(i / COLS) * 2.2 + 0.6}s`,
            }}
          />
        ))}
      </div>
      {/* Soft vignette so center content stays clear */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-background/25 via-transparent to-background/40"
        aria-hidden
      />
    </div>
  );
}
