import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  turbopack: { root: process.cwd() },
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
};

export default nextConfig;
