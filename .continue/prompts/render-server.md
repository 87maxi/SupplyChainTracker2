# PROMPT PARA ANÁLISIS DE ERROR: NEXT.JS + TURBOPACK + MONGODB + WEB3

## 1. CONTEXTO TÉCNICO
- **Framework:** Next.js (App Router).
- **Entorno:** Desarrollo con Turbopack (`next dev --turbo`).
- **Stack Web3:** RainbowKit, Wagmi, Web3Modal (uso intensivo de Context Providers).
- **Base de Datos:** MongoDB (Driver nativo de Node.js).
- **Detonante:** Los errores se manifiestan al cambiar el estado de la Wallet (conexión/desconexión).

## 2. ERRORES A RESOLVER
- **Fuga de Dependencias:** `Module not found: Can't resolve 'child_process'`, `dns`, `tls`, `net`, `fs`.
- **Violación de Directivas:** `Error: A "use server" file can only export async functions, found object`.
- **Error 500:** Fallos de renderizado y compilación en el servidor al detectar objetos no serializables o módulos de Node en el cliente.

## 3. OBJETIVOS DE LA SOLUCIÓN
Analiza el código que adjuntaré a continuación y propón una refactorización basada en:
1. **Aislamiento Total del Lado del Servidor:** Identificar qué componente de cliente está importando accidentalmente el driver de MongoDB.
2. **Separación de Capas:** Crear una distinción clara entre **Tipos de TypeScript** (usables en el cliente) y la **Instancia del Servicio** (exclusiva del servidor).
3. **Corrección de Singleton:** Ajustar la exportación del servicio para que no use `"use server"` de forma incorrecta (exportando instancias de clase).
4. **Configuración de Turbopack:** Ajustar `next.config.js` mediante `experimental.turbo.resolveAlias` para silenciar módulos de Node en el navegador.

## 4. RESTRICCIONES
- **Mantener Turbopack:** No sugerir volver a Webpack.
- **No romper Web3:** La lógica de Wagmi y RainbowKit debe permanecer intacta.
- **Seguridad:** Asegurar que las variables de entorno de MongoDB no se filtren al frontend.

---

## 5. CÓDIGO PARA ANALIZAR
A continuación adjunto los archivos clave:

### Archivo A: next.config.js
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


### Archivo B: mongodb-service.ts
/src/services/server/mongodb-service.ts



### Archivo D: API Route
src/app/api/mongodb/route.ts