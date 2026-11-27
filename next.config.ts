import type { NextConfig } from "next";

const publicMediaUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
const publicMediaPattern = publicMediaUrl && URL.canParse(publicMediaUrl) ? new URL(publicMediaUrl) : undefined;

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      ...(publicMediaPattern?.protocol === "https:" && !publicMediaPattern.username && !publicMediaPattern.password && !publicMediaPattern.port
        ? [{ protocol: "https" as const, hostname: publicMediaPattern.hostname, pathname: "/**" }]
        : []),
    ],
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
