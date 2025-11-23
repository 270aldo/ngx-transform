import * as React from "react";
import { cn } from "@/lib/utils";

const Progress = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value?: number }>(
  ({ className, value = 0, ...props }, ref) => (
    <div ref={ref} className={cn("w-full h-2 rounded bg-neutral-800 overflow-hidden", className)} {...props}>
      <div className="h-full bg-[#6D00FF]" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  )
);
Progress.displayName = "Progress";

export { Progress };
