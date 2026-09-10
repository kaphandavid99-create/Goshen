import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The Cloudinary Node SDK reads its own package.json by relative path for
  // analytics; bundling it breaks that and throws "Must supply sdk_semver".
  serverExternalPackages: ["cloudinary"],
  experimental: {
    proxyClientMaxBodySize: "40mb",
  },
  async headers() {
    return [
      {
        // The service worker must never be cached, or devices get stuck on an
        // old push handler after a deploy.
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
        ],
      },
    ];
  },
  images: {
    // Cloudinary and Unsplash already deliver resized, format-optimised images
    // over their own CDNs. Routing them through the Next optimiser adds a
    // fetch that times out on slow upstreams and shows a broken image, so we
    // serve the source URLs directly.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
