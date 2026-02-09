"use client";

const svgClass = "size-full";

/** Laptop SVG – screen + base + keyboard hint */
export function LaptopSvg({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className ?? svgClass}
      aria-hidden
    >
      <rect x="4" y="2" width="56" height="32" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M 2 34 L 62 34 L 58 38 L 6 38 Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <rect x="10" y="8" width="44" height="20" rx="1" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="0.8" />
      <line x1="18" y1="14" x2="46" y2="14" stroke="currentColor" strokeWidth="0.6" opacity="0.7" />
      <line x1="18" y1="18" x2="40" y2="18" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
      <line x1="18" y1="22" x2="44" y2="22" stroke="currentColor" strokeWidth="0.6" opacity="0.4" />
    </svg>
  );
}

/** Server rack SVG – stacked trays / units */
export function ServerSvg({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className ?? svgClass}
      aria-hidden
    >
      <rect x="8" y="4" width="48" height="40" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
      {/* Three server units */}
      <line x1="8" y1="16" x2="56" y2="16" stroke="currentColor" strokeWidth="1" />
      <line x1="8" y1="28" x2="56" y2="28" stroke="currentColor" strokeWidth="1" />
      <line x1="8" y1="40" x2="56" y2="40" stroke="currentColor" strokeWidth="1" />
      {/* Blink lights */}
      <circle cx="16" cy="10" r="1.5" fill="currentColor" fillOpacity="0.8" />
      <circle cx="22" cy="10" r="1.5" fill="currentColor" fillOpacity="0.4" />
      <circle cx="28" cy="10" r="1.5" fill="currentColor" fillOpacity="0.8" />
      <circle cx="16" cy="22" r="1.5" fill="currentColor" fillOpacity="0.4" />
      <circle cx="22" cy="22" r="1.5" fill="currentColor" fillOpacity="0.8" />
      <circle cx="28" cy="22" r="1.5" fill="currentColor" fillOpacity="0.4" />
      <circle cx="16" cy="34" r="1.5" fill="currentColor" fillOpacity="0.8" />
      <circle cx="22" cy="34" r="1.5" fill="currentColor" fillOpacity="0.4" />
      <circle cx="28" cy="34" r="1.5" fill="currentColor" fillOpacity="0.8" />
      {/* Vent lines */}
      <line x1="38" y1="10" x2="52" y2="10" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
      <line x1="38" y1="14" x2="50" y2="14" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
      <line x1="38" y1="22" x2="52" y2="22" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
      <line x1="38" y1="26" x2="48" y2="26" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
      <line x1="38" y1="34" x2="52" y2="34" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
      <line x1="38" y1="38" x2="50" y2="38" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
    </svg>
  );
}

/** Code block SVG – document with brackets/code lines */
export function CodeSvg({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className ?? svgClass}
      aria-hidden
    >
      <path d="M 12 4 L 52 4 L 52 44 L 12 44 Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M 12 4 L 12 14 L 52 14" stroke="currentColor" strokeWidth="1" />
      {/* Code lines */}
      <path d="M 18 22 L 22 26 L 18 30" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 46 22 L 42 26 L 46 30" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="26" y1="26" x2="38" y2="26" stroke="currentColor" strokeWidth="0.8" />
      <line x1="20" y1="34" x2="44" y2="34" stroke="currentColor" strokeWidth="0.6" opacity="0.7" />
      <line x1="20" y1="38" x2="36" y2="38" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
    </svg>
  );
}

/** Database / storage cylinder – optional fourth IT element */
export function DatabaseSvg({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className ?? svgClass}
      aria-hidden
    >
      <ellipse cx="32" cy="12" rx="16" ry="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M 16 12 L 16 36 Q 16 42 32 42 Q 48 42 48 36 L 48 12" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <ellipse cx="32" cy="36" rx="16" ry="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <line x1="16" y1="24" x2="48" y2="24" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
    </svg>
  );
}
