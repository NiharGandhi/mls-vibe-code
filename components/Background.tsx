"use client";

export function Background() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Light off-white base */}
      <div
        className="absolute inset-0 dark:hidden"
        style={{
          background:
            "linear-gradient(165deg, oklch(0.985 0.002 90) 0%, oklch(0.97 0.004 100) 50%, oklch(0.98 0.003 85) 100%)",
        }}
      />
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          background:
            "linear-gradient(165deg, oklch(0.18 0.01 260) 0%, oklch(0.16 0.012 270) 100%)",
        }}
      />

      {/* Abstract flowing ribbon – soft gradient blobs for iridescent shape (toned down in dark) */}
      <div className="absolute inset-0 overflow-hidden dark:opacity-50">
        {/* Pink/magenta – center-left of the ribbon */}
        <div
          className="absolute -top-[20%] left-[15%] h-[70vmax] w-[70vmax] rounded-[45%_55%_60%_40%_/50%_50%_50%_50%] opacity-[0.35] blur-3xl"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 50%, oklch(0.75 0.18 350 / 0.5), oklch(0.8 0.12 340 / 0.2), transparent 70%)",
          }}
        />
        {/* Orange/peach – main body of the ribbon */}
        <div
          className="absolute top-[10%] right-[5%] h-[65vmax] w-[55vmax] rounded-[40%_60%_55%_45%_/60%_40%_60%_40%] opacity-[0.4] blur-3xl"
          style={{
            background:
              "radial-gradient(ellipse 55% 45% at 40% 55%, oklch(0.82 0.14 55 / 0.45), oklch(0.85 0.1 70 / 0.2), transparent 65%)",
          }}
        />
        {/* Light blue/cyan – reflection / cooler edge */}
        <div
          className="absolute top-[25%] right-[20%] h-[50vmax] w-[45vmax] rounded-[55%_45%_50%_50%_/45%_55%_45%_55%] opacity-[0.3] blur-3xl"
          style={{
            background:
              "radial-gradient(ellipse 50% 50% at 60% 40%, oklch(0.88 0.08 220 / 0.35), oklch(0.9 0.05 200 / 0.15), transparent 60%)",
          }}
        />
        {/* Extra soft pink accent for depth */}
        <div
          className="absolute bottom-[15%] left-[25%] h-[40vmax] w-[50vmax] rounded-[50%_50%_50%_50%_/40%_60%_40%_60%] opacity-[0.25] blur-[80px]"
          style={{
            background:
              "radial-gradient(ellipse 50% 50% at 50% 50%, oklch(0.78 0.15 360 / 0.4), transparent 70%)",
          }}
        />
      </div>

      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.35] mix-blend-soft-light dark:opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />

      {/* Very soft vignette (light mode only) so the ribbon doesn’t feel harsh at edges */}
      <div
        className="pointer-events-none absolute inset-0 dark:hidden"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 50%, oklch(0.98 0.002 90 / 0.12) 100%)",
        }}
      />
    </div>
  );
}
