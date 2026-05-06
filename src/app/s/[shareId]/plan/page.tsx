'use client';

/**
 * Genesis Plan Page
 * Shows PlanPreview with Day 1 + locked days, followed by ComparisonCTA
 */

import React from 'react';
import { useParams } from 'next/navigation';
import { PlanPreview } from '@/components/genesis/PlanPreview';

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
      <PlanPreview shareId={shareId} onUnlock={handleUnlock} />
    </main>
  );
}
