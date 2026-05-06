'use client';

/**
 * Genesis Plan Page
 * Shows PlanPreview with Day 1 + locked days, followed by ComparisonCTA
 */

import React from 'react';
import { useParams } from 'next/navigation';
import { PlanPreview } from '@/components/genesis/PlanPreview';
import { ComparisonCTA } from '@/components/results/ComparisonCTA';

export default function PlanPage() {
  const params = useParams();
  const shareId = params.shareId as string;

  const handleUnlock = () => {
    // Navigate to booking/conversion page
    const bookingUrl =
      process.env.NEXT_PUBLIC_CALENDLY_URL ||
      process.env.NEXT_PUBLIC_BOOKING_URL ||
      'https://calendly.com/ngx-genesis';
    window.open(bookingUrl, '_blank');
  };

  return (
    <main className="min-h-screen bg-transparent">
      {/* Plan Preview */}
      <PlanPreview shareId={shareId} onUnlock={handleUnlock} />

      {/* Comparison CTA - Fixed at bottom */}
      <div
        className="fixed bottom-0 left-0 right-0 backdrop-blur-xl border-t border-[color:var(--ngx-border-subtle)]"
        style={{ backgroundColor: "rgba(5,5,8,0.85)" }}
      >
        <div className="max-w-2xl mx-auto p-4">
          <ComparisonCTA onSubscribe={handleUnlock} />
        </div>
      </div>
    </main>
  );
}
