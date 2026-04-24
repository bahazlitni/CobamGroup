import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  htmlLimitedBots: /.*/,
  images: {
    localPatterns: [
      {
        pathname: "/images/**",
      },
      {
        pathname: "/api/media/**",
      },
      {
        pathname: "/api/staff/medias/**",
      },
    ],
  },
};

export default nextConfig;
