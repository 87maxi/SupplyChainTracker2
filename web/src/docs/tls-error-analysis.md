# Análisis del Error: Module not found: Can't resolve 'tls'

## Error
```
/web/node_modules/mongodb/lib/cmap/connect.js:10:13
Module not found: Can't resolve 'tls'
   8 | exports.makeSocket = makeSocket;
   9 | const net = require("net");
> 10 | const tls = require("tls");
```

## Contexto
Este error ocurre aunque:

1. `mongodb` está listado en `serverExternalPackages` en `next.config.js`.
2. `"tls": false` está configurado en `experimental.turbo.resolveAlias`.

El error aparece después de corregir el problema de `"use server"`, lo que indica que el cliente está intentando ejecutar código del módulo `mongodb`.

## Causa Raíz

El problema NO es la falta de configuración de Webpack/Turbopack, sino una **importación accidental en el cliente** de un módulo que depende directa o indirectamente de `lib/mongodb.ts`.

A pesar de que `mongodb.ts` ya no tiene `'use server'`, si algún archivo del cliente (como un hook, componente, o acción) lo importa directa o indirectamente, el bundler intentará incluirlo y resolver sus dependencias (net, tls, etc.).

### Ruta de Propagación

Una ruta común de fuga sería:

```
Componente del Cliente (use client)
    ↑ importa
Hook de React (por ejemplo, `useUserRoles`)
    ↑ importa
Servicio del Servidor (por ejemplo, `supply-chain.service.ts`)
    ↑ importa
RoleDataService.ts 
    ↑ importa
mongodb.ts (con dependencias de Node.js)
```

### Análisis de Dependencias

Se debe verificar que ningún código del cliente importe `RoleDataService` o cualquier función que use `mongodbService`. `RoleDataService` está diseñado para ser usado solo en el servidor (API Routes, Server Components), no en el cliente.

## Solución

### Paso 1: Verificar Importaciones Cliente

Buscar en todos los componentes y hooks de tipo `"use client"` cualquier importación de servicios o datos que puedan llevar a `RoleDataService`:

```bash
# Buscar importaciones de RoleDataService en archivos de cliente
grep -r "RoleDataService" web/src/app --include="*.tsx" --include="*.ts"

# Buscar importaciones de mongodb en archivos de cliente
grep -r "mongodb" web/src/app --include="*.tsx" --include="*.ts" | grep -v "types/mongodb"
```

### Paso 2: Corregir las Importaciones

Asegurarse de que `RoleDataService` y sus funciones solo se usen en:

1. **Rutas API** (en `src/app/api`).
2. **Server Components** o **Server Actions**.
3. **Nunca en componentes marcados con `"use client"` o hooks de React usados por estos componentes.**

### Paso 3: Aislar Lógica de Cliente

Si se necesita información que proviene de MongoDB, debe obtenerse a través de:

1. Una **API Route** (por ejemplo, `GET /api/netbook-data?serial=123`).
2. Un **Server Component** que llame directamente a `RoleDataService` (pero nunca se pase al cliente).
3. **Server Actions** que encapsulen la lógica de base de datos.

## Verificación

Después de hacer los cambios:

1. Limpiar la caché:
```bash
rm -rf web/.next
```

2. Reiniciar el servidor de desarrollo:
```bash
npm run dev
```

3. Si el error persiste, el `resolveAlias` y `serverExternalPackages` en `next.config.js` son la última línea de defensa y ya están correctamente configurados.