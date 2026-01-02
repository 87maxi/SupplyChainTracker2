/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // External packages that are only used on the server
  serverExternalPackages: ['mongodb'],
  
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Configure Turbopack
  turbopack: {
    // Resolve workspace root issues
    root: process.cwd(),
  },
  
  // Fix BigInt literals not available when targeting lower than ES2020
  webpack: (config, { isServer }) => {
    config.resolve.fallback = { ...config.resolve.fallback, crypto: false };
    
    // Only use MongoDB on the server side
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'mongodb': false,
        'mongodb-client-encryption': false,
      };
    }
    
    return config;
  },
  
  // Configure TypeScript compiler options
  typescript: {
    // Ignore TypeScript errors during build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;