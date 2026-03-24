import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/dashboard",
        permanent: false,
      },
    ];
  },
  turbopack: {},
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },

  ...(process.env.NODE_ENV === "development" && {
    allowedDevOrigins: ["192.168.1.8"],
  }),
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
    };
    return config;
  },
};

export default nextConfig;