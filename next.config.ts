import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Add valid experimental options here if needed
    //@ts-expect-error
    missingSuspenseWithCSRBailout: false
  }
  /* config options here */
};

export default nextConfig;
