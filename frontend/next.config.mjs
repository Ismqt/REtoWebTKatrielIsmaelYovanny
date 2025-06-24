import withPWAInit from "next-pwa";

/** @type {import('next').NextConfig} */
let nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

if (process.env.NODE_ENV === 'production') {
  const withPWA = withPWAInit({
    dest: "public",
    register: true,
    skipWaiting: true,
    // disable: process.env.NODE_ENV === "development", // Keep enabled for testing in dev
  });
  nextConfig = withPWA(nextConfig);
}

export default nextConfig;
