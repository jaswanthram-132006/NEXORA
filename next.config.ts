import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["three"],
  async redirects() {
    return [
      {
        source: "/simulations/neural-net",
        destination: "/simulations/neural-network",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
