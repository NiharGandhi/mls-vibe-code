"use client";

/** Circuit line/pad color: dark in light mode, light in dark mode. */
const CIRCUIT_COLOR_LIGHT = "rgba(30, 41, 59, 0.35)";
const CIRCUIT_COLOR_DARK = "rgba(226, 232, 240, 0.4)";

/**
 * Circuit-board / schematic style background: thin lines, chip outlines, and pads
 * in a technical, monochromatic style.
 */
export function CircuitBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden [--circuit:var(--circuit-light)] dark:[--circuit:var(--circuit-dark)]"
      style={
        {
          ["--circuit-light"]: CIRCUIT_COLOR_LIGHT,
          ["--circuit-dark"]: CIRCUIT_COLOR_DARK,
        } as React.CSSProperties
      }
      aria-hidden
    >
      <svg
        className="h-full w-full"
        viewBox="0 0 1200 1600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern
            id="circuit-grid-landing"
            x="0"
            y="0"
            width="120"
            height="120"
            patternUnits="userSpaceOnUse"
          >
            {/* Vertical traces */}
            <path d="M 20 0 v 120" stroke="var(--circuit)" strokeWidth="0.8" />
            <path d="M 40 0 v 120" stroke="var(--circuit)" strokeWidth="0.7" />
            <path d="M 60 0 v 120" stroke="var(--circuit)" strokeWidth="0.8" />
            <path d="M 80 0 v 120" stroke="var(--circuit)" strokeWidth="0.7" />
            <path d="M 100 0 v 120" stroke="var(--circuit)" strokeWidth="0.8" />
            {/* Horizontal traces */}
            <path d="M 0 20 h 120" stroke="var(--circuit)" strokeWidth="0.7" />
            <path d="M 0 40 h 120" stroke="var(--circuit)" strokeWidth="0.8" />
            <path d="M 0 60 h 120" stroke="var(--circuit)" strokeWidth="0.7" />
            <path d="M 0 80 h 120" stroke="var(--circuit)" strokeWidth="0.8" />
            <path d="M 0 100 h 120" stroke="var(--circuit)" strokeWidth="0.7" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#circuit-grid-landing)" />

        {/* Large IC / processor outline – upper right */}
        <g stroke="var(--circuit)" strokeWidth="0.8" fill="none">
          <rect x="820" y="120" width="180" height="140" rx="2" />
          <rect x="830" y="130" width="160" height="120" />
          {/* Pins */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <circle key={`ic1-t-${i}`} cx={830 + i * 22} cy="125" r="2" fill="var(--circuit)" />
          ))}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <circle key={`ic1-r-${i}`} cx="995" cy={140 + i * 22} r="2" fill="var(--circuit)" />
          ))}
        </g>

        {/* Smaller chip – left */}
        <g stroke="var(--circuit)" strokeWidth="0.6" fill="none">
          <rect x="80" y="340" width="100" height="64" rx="1" />
          <circle cx="85" cy="345" r="1.5" fill="var(--circuit)" />
          <circle cx="95" cy="345" r="1.5" fill="var(--circuit)" />
          <circle cx="105" cy="345" r="1.5" fill="var(--circuit)" />
          <circle cx="170" cy="370" r="1.5" fill="var(--circuit)" />
        </g>

        {/* Trace runs – right side */}
        <path
          d="M 900 400 L 980 400 L 980 480 L 1100 480"
          stroke="var(--circuit)"
          strokeWidth="1"
          fill="none"
        />
        <path
          d="M 920 520 L 1000 520 L 1000 600 L 1150 600"
          stroke="var(--circuit)"
          strokeWidth="0.9"
          fill="none"
        />

        {/* Second large IC – lower middle */}
        <g stroke="var(--circuit)" strokeWidth="0.7" fill="none">
          <rect x="420" y="920" width="200" height="120" rx="2" />
          <rect x="435" y="935" width="170" height="90" />
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <circle key={`ic2-b-${i}`} cx={445 + i * 20} cy="1030" r="1.8" fill="var(--circuit)" />
          ))}
        </g>

        {/* Pads / test points scattered */}
        {[
          [200, 200], [380, 280], [600, 180], [1100, 320], [150, 600], [300, 720],
          [700, 800], [950, 880], [180, 1000], [800, 1100], [1050, 1200],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2" fill="var(--circuit)" />
        ))}

        {/* Horizontal trace segments */}
        <path d="M 200 200 L 400 200" stroke="var(--circuit)" strokeWidth="0.8" fill="none" />
        <path d="M 600 180 L 750 180 L 750 260" stroke="var(--circuit)" strokeWidth="0.8" fill="none" />
        <path d="M 150 600 L 280 600" stroke="var(--circuit)" strokeWidth="0.7" fill="none" />
        <path d="M 420 920 L 420 860 L 350 860" stroke="var(--circuit)" strokeWidth="1" fill="none" />
      </svg>
    </div>
  );
}
