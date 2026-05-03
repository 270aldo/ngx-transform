"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface AnimatedCounterProps {
  /** The final value to count to. Can be a number or string like "IA +" */
  value: string;
  /** Suffix appended after the number (e.g., " min", " semanas") */
  suffix?: string;
  /** Duration of the animation in ms */
  duration?: number;
  /** CSS class for the container */
  className?: string;
  /** Color for the suffix */
  suffixStyle?: React.CSSProperties;
}

/**
 * Animated counter that counts up from 0 to the target value when it enters the viewport.
 * If the value is non-numeric (e.g., "IA +", "Acceso"), it renders immediately without animation.
 */
export function AnimatedCounter({
  value,
  suffix = "",
  duration = 1500,
  className = "",
  suffixStyle,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [displayValue, setDisplayValue] = useState<string>("0");
  const [hasAnimated, setHasAnimated] = useState(false);

  // Extract numeric part from value
  const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
  const isNumeric = !isNaN(numericValue) && /^\d/.test(value.trim());

  const animate = useCallback(() => {
    if (hasAnimated || !isNumeric) return;
    setHasAnimated(true);

    const startTime = performance.now();
    const isInteger = Number.isInteger(numericValue);

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * numericValue;

      setDisplayValue(isInteger ? Math.round(current).toString() : current.toFixed(1));

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplayValue(isInteger ? numericValue.toString() : numericValue.toFixed(1));
      }
    };

    requestAnimationFrame(step);
  }, [hasAnimated, isNumeric, numericValue, duration]);

  useEffect(() => {
    if (!isNumeric) {
      setDisplayValue(value);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate();
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [isNumeric, value, animate]);

  return (
    <div ref={ref} className={className}>
      {displayValue}
      {suffix && <span style={suffixStyle}>{suffix}</span>}
    </div>
  );
}
