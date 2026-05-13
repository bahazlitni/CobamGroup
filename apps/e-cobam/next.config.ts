import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@cobam/db", "@cobam/media-storage"],
};

export default nextConfig;
