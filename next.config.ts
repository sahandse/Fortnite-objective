import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "fortnite-api.com" },
      { protocol: "https", hostname: "media.fortniteapi.io" },
      { protocol: "https", hostname: "cdn.fnbr.co" },
      { protocol: "https", hostname: "gaming-cdn.com" },
    ],
  },
};

export default nextConfig;
