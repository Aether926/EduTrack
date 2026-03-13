// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//     async redirects() {
//         return [
//             {
//                 source: "/",
//                 destination: "/dashboard",
//                 permanent: false,
//             },
//         ];
//     },
// };

// export default nextConfig;
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

  ...(process.env.NODE_ENV === "development" && {
    allowedDevOrigins: ["192.168.1.9"],
  }),
};

export default nextConfig;