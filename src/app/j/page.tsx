import { LandingPage } from "@/components/landing";
import type { Metadata } from "next";
import { getVariant } from "@/config/landing";

const variant = getVariant("jovenes");

export const metadata: Metadata = {
  title: variant.meta.title,
  description: variant.meta.description,
};

export default function JovenesPage() {
  return <LandingPage variant="jovenes" />;
}
