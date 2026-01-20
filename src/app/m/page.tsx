import { LandingPage } from "@/components/landing";
import type { Metadata } from "next";
import { getVariant } from "@/config/landing";

const variant = getVariant("mayores");

export const metadata: Metadata = {
  title: variant.meta.title,
  description: variant.meta.description,
};

export default function MayoresPage() {
  return <LandingPage variant="mayores" />;
}
