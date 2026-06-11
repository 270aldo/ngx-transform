import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import { assertLegalConfigForProductionDeploy } from "./src/lib/legalConfig";
import { assertImageConfigForProductionDeploy } from "./src/lib/imageConfig";

// Fail a real production deploy (Vercel VERCEL_ENV=production) if the legal
// responsible-party data is missing. No-op on local dev and CI.
assertLegalConfigForProductionDeploy();

// Fail the build if Identity Chain is enabled but the configured image model
// can't support it (would 503 every image-generation request in production).
assertImageConfigForProductionDeploy();

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: __dirname,
  },
  images: {
    qualities: [75, 88],
    remotePatterns: [
      { protocol: "https", hostname: "storage.googleapis.com" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "grainy-gradients.vercel.app" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  authToken: process.env.SENTRY_AUTH_TOKEN,
});
