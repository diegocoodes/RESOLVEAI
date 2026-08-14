import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Prisma Compute consumes Next.js' standalone server. Vercel builds and
  // deploys its own optimized functions, so it must use Next.js' native output.
  ...(process.env.VERCEL ? {} : { output: "standalone" as const }),
  turbopack: { root: process.cwd() },
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
};

export default nextConfig;
