"use client";

export function AnimatedBlobs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
    </div>
  );
}
