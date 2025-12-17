const nextConfig = {

  // Ensure proper environment variable loading
  env: {
    NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS: process.env.NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS,
  },
};

export default nextConfig;