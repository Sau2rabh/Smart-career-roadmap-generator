import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export', // Removed for web support (enables middleware)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
