import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {},
};

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  cacheOnFrontEndNav: true,
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: /\/images\/rfm\/.*\.(?:png|jpg|jpeg)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "rfm-library-images",
          expiration: { maxEntries: 250, maxAgeSeconds: 60 * 60 * 24 * 90 },
        },
      },
    ],
  },
});

export default withPWA(nextConfig);
