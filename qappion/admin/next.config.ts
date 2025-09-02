import type { NextConfig } from "next";

const config: NextConfig = {
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: true },
  // Monorepo için outputFileTracingRoot Next.js 14'te experimental değil, ana seviyede
  outputFileTracingRoot: "../..",
};
export default config;
