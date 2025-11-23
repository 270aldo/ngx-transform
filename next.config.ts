import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "storage.googleapis.com" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
    ],
  },
  // Ensure Next/Turbopack uses this project as the workspace root, not the home directory
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
