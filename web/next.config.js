const nextConfig = {
  // Externalize modules that are not needed in the browser environment
  serverExternalPackages: [
    'tap',
    'tape',
    'desm',
    'fastbench',
    'pino-elasticsearch',
    'why-is-node-running',
    'thread-stream',
    'pino',
    'mongodb'
  ],
  
  // Configure environment variables
  env: {
    NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS: process.env.NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS,
  },

  // Transpile packages that might have Node.js specific code
  transpilePackages: [
    'pino-pretty',
    // Agrega aquí otros paquetes que puedan causar problemas
  ],

experimental: {
    turbo: {
      resolveAlias: {
        // Esto evita el error de child_process, dns, etc. en el cliente
        "child_process": false,
        "dns": false,
        "tls": false,
        "net": false,
        "fs": false,
        "os": false,
        "path": false,
      },
    },
  },


};

export default nextConfig;
