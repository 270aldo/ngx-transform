"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

interface RiveOrbProps {
  /** Max pixel size on desktop. Scales down on mobile via clamp(). */
  size?: number;
  /** Min size on small viewports. Default 180. */
  minSize?: number;
  /** Viewport-relative size between min and max. Default 48vw. */
  fluid?: string;
  className?: string;
  /** Optional center overlay (e.g. progress percentage). */
  children?: React.ReactNode;
}

/** Zero-weight static ring — the orb's resting/fallback state. */
function StaticOrbRing() {
  return (
    <div className="relative z-10 flex h-full w-full items-center justify-center">
      <div
        className="h-[70%] w-[70%] rounded-full"
        style={{
          border: "2px solid rgba(109,0,255,0.45)",
          boxShadow:
            "0 0 60px rgba(109,0,255,0.35), inset 0 0 40px rgba(109,0,255,0.20)",
        }}
      />
    </div>
  );
}

// The Rive runtime (@rive-app/react-canvas) + the 8.9MB orb.riv + 1.8MB
// rive.wasm live in a separate async chunk, loaded only when we choose to
// animate. The static ring shows while it loads and on the static path (fix-21).
const RiveOrbAnimated = dynamic(
  () => import("./RiveOrbAnimated").then((m) => m.RiveOrbAnimated),
  { ssr: false, loading: () => <StaticOrbRing /> },
);

/**
 * Decide whether to fetch the (heavy) animated orb. Phones, Data Saver, and
 * sub-4G links get the zero-weight static ring instead of ~11MB on the very
 * screen where we ask the user to wait.
 */
function shouldAnimateOrb(): boolean {
  if (typeof navigator === "undefined") return false;
  const conn = (
    navigator as Navigator & {
      connection?: { effectiveType?: string; saveData?: boolean };
    }
  ).connection;
  if (conn) {
    if (conn.saveData) return false;
    if (conn.effectiveType && conn.effectiveType !== "4g") return false;
    return true;
  }
  // No Network Information API (e.g. Safari/iOS): conservative — only animate on
  // desktop-width viewports; phones keep the static ring.
  return typeof window !== "undefined" && window.innerWidth >= 768;
}

/**
 * GENESIS orb — ambient animation above a soft purple halo. Loads the Rive
 * runtime + assets only on fast/desktop clients; otherwise renders a static
 * ring of identical footprint. Public API (props) is unchanged.
 */
export function RiveOrb({
  size = 280,
  minSize = 180,
  fluid = "48vw",
  className,
  children,
}: RiveOrbProps) {
  // navigator.connection / innerWidth are client-only; decide after mount.
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    setAnimate(shouldAnimateOrb());
  }, []);

  return (
    <div
      className={cn("relative flex-shrink-0", className)}
      style={{
        width: `clamp(${minSize}px, ${fluid}, ${size}px)`,
        aspectRatio: "1 / 1",
      }}
      aria-hidden
    >
      {/* Soft halo behind the orb */}
      <div
        className="pointer-events-none absolute inset-[-15%] rounded-full blur-[80px]"
        style={{
          background:
            "radial-gradient(closest-side, rgba(109,0,255,0.55), rgba(109,0,255,0.18) 55%, transparent 80%)",
        }}
      />

      {animate ? <RiveOrbAnimated size={size} /> : <StaticOrbRing />}

      {/* Optional centered overlay (e.g. percentage) */}
      {children ? (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          {children}
        </div>
      ) : null}
    </div>
  );
}
