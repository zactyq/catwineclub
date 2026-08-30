import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Default is 1MB, which silently rejects any real phone photo upload
      // (event images, event photos). Real-world photos run 2-10MB.
      bodySizeLimit: "15mb",
    },
  },
};

export default nextConfig;
