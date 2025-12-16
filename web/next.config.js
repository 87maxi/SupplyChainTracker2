const nextConfig = {
  // Disable Turbopack to avoid module resolution issues with test files
  experimental: {
    turbopack: false,
  },
  // Ensure proper environment variable loading
  env: {
    NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS: process.env.NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS,
  },
};

export default nextConfig;