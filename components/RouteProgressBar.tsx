"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/** Thin progress bar at top of viewport on route change for instant feedback. */
export function RouteProgressBar() {
  const pathname = usePathname();
  const [width, setWidth] = useState(0);

  useEffect(() => {
    setWidth(0);
    const raf = requestAnimationFrame(() => setWidth(90));
    const t1 = setTimeout(() => setWidth(100), 400);
    const t2 = setTimeout(() => setWidth(0), 550);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [pathname]);

  if (width === 0) return null;

  return (
    <div
      className="fixed left-0 top-0 z-50 h-0.5 w-full overflow-hidden bg-transparent"
      aria-hidden
    >
      <div
        className="h-full bg-primary transition-[width] duration-300 ease-out"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
