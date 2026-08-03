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
      {
        // RFM/RAAC/MOP reference PDFs — rarely change, must stay available with no
        // connectivity (Vaca Muerta, Patagonia offshore) once opened at least once.
        urlPattern: /\/docs\/.*\.pdf$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "reference-pdfs",
          expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 180 },
        },
      },
      {
        // Live METAR/TAF: prefer the network, but if offline within ~4s fall back to the
        // last successful response instead of failing outright.
        urlPattern: /\/api\/weather(\?.*)?$/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "weather-api-fallback",
          networkTimeoutSeconds: 4,
          expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 6 },
        },
      },
      {
        // Geographic route map tiles (CartoDB) — caching previously-viewed tiles means a
        // route already checked once still shows its map with no connectivity, even though
        // never-visited areas still need a live connection to load.
        urlPattern: /^https:\/\/[abcd]\.basemaps\.cartocdn\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "map-tiles",
          expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 30 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
    ],
  },
});

export default withPWA(nextConfig);
