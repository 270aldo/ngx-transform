"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export function Tooltip({ children, content, className }: { children: React.ReactNode; content: React.ReactNode; className?: string }) {
  const [visible, setVisible] = React.useState(false);
  return (
    <div className="relative inline-block" onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
      {children}
      {visible && (
        <div className={cn("absolute left-1/2 -translate-x-1/2 mt-2 whitespace-pre rounded bg-neutral-900 text-neutral-100 text-xs px-2 py-1 border border-neutral-800 shadow", className)}>
          {content}
        </div>
      )}
    </div>
  );
}
