import path from 'path';

const nextConfig = {
  // Externalize modules that are not needed in the browser environment
  // These are dev/test dependencies that are picked up by transitive dependencies
  // but are not actually needed in the frontend
  // Externalize modules that are not needed in the browser environment
  // These are dev/test dependencies that are picked up by transitive dependencies
  // but are not actually needed in the frontend
  serverExternalPackages: [
    'tap',
    'tape',
    'desm',
    'fastbench',
    'pino-elasticsearch',
    'why-is-node-running',
    'thread-stream',
    'pino'
  ],
  // Configure environment variables
  env: {
    NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS: process.env.NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS,
  },

  // Configuración específica para Turbopack
  // No usamos la configuración de webpack ya que Turbopack no la soporta
  // En su lugar, usamos configuraciones compatibles con Turbopack

  // Para ignorar archivos en Turbopack, podemos usar transformaciones o configurarlos como externos
  // No es necesario el null-loader con Turbopack

  // Si necesitamos manejar dependencias específicas, podemos usar:
  // external: ['tap', 'tape', 'desm', 'fastbench', 'pino-elasticsearch', 'why-is-node-running']
  // Pero mejor usar dependencias de desarrollo para estas

  // Turbopack maneja automáticamente muchas optimizaciones
  // Por ahora, mantenemos una configuración simple

  // Deprecated in Next.js 15, use `transpilePackages` instead
  // transformPackageImports: {
  //   'thread-stream/test': { transform: 'node-noop' },
  //   'pino/test': { transform: 'node-noop' },
  // },

  // En lugar de modularizeImports, usamos transformPackageImports si es necesario
  // pero solo para paquetes que necesitan transformación
};

export default nextConfig;
