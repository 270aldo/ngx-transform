"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "full" | "mark";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_MAP: Record<NonNullable<LogoProps["size"]>, number> = {
  sm: 24,
  md: 32,
  lg: 48,
};

export function Logo({ variant = "full", size = "md", className }: LogoProps) {
  const [errored, setErrored] = useState(false);
  const h = SIZE_MAP[size];
  const src =
    variant === "full"
      ? "/images/brand/logo-white.png"
      : "/images/brand/ngx-mark-purple.png";
  const width = useMemo(() => (variant === "full" ? Math.round(h * 4.7) : h), [h, variant]);

  if (errored) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-2 font-black tracking-tight text-[#6D00FF]",
          "font-mono",
          size === "sm" && "text-lg",
          size === "md" && "text-xl",
          size === "lg" && "text-3xl",
          className
        )}
      >
        NGX
        {variant === "full" && (
          <span className="font-medium tracking-[0.18em] text-white/75">
            TRANSFORM
          </span>
        )}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt="NGX"
      height={h}
      width={width}
      className={cn("object-contain", className)}
      onError={() => setErrored(true)}
      priority={size === "lg"}
    />
  );
}
