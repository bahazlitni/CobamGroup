import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@cobam/db", "@cobam/media-storage"],
  images: {
    localPatterns: [
      {
        pathname: "/images/**",
        search: "",
      },
      {
        pathname: "/api/media/**",
        search: "",
      },
      {
        pathname: "/api/media/**",
        search: "?variant=thumbnail",
      },
    ],
  },
};

export default nextConfig;
