import type { NextConfig } from "next";

const config: NextConfig = {
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: true },
  // Monorepo için outputFileTracingRoot Next.js 14'te experimental değil, ana seviyede
  outputFileTracingRoot: "../..",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.freepik.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*" },
    ],
    // unoptimized: true, // gerekirse açılır
  },
};
export default config;
