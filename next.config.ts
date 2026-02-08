import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    /** Allow large file uploads (e.g. submission upload API). Default is 10MB. */
    proxyClientMaxBodySize: "100mb",
  },
};

export default nextConfig;
