import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The Cloudinary Node SDK reads its own package.json by relative path for
  // analytics; bundling it breaks that and throws "Must supply sdk_semver".
  serverExternalPackages: ["cloudinary"],
  experimental: {
    proxyClientMaxBodySize: "40mb",
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
