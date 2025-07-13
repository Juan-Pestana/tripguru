import type { NextConfig } from "next";

module.exports = {
  experimental: {
    missingSuspenseWithCSRBailout: false
  }
};

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
