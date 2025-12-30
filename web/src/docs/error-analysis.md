# Análisis del Error: A "use server" file can only export async functions, found object

## Error
```
POST / 500 in 250ms (compile: 4ms, render: 246ms)
⨯ Error: A "use server" file can only export async functions, found object.
Read more: https://nextjs.org/docs/messages/invalid-use-server-value
    at module evaluation (.next/dev/server/chunks/ssr/[root-of-the-server]__0f82dbff._.js:640:326)
    at module evaluation (.next-internal/server/app/page/actions.js (server actions loader):2:1)
    at module evaluation (.next/dev/server/chunks/ssr/[root-of-the-server]__0f82dbff._.js:663:755)
  1 | export {getRoleByName as '402a55ef92b001a5b936a8f8edbcd4f6a44eee251d'} from 'ACTIONS_MODULE0'
> 2 | export {mongodbService as '7f0b89dc625c60b95e6c4a9f304a7caa39be6d2d81'} from 'ACTIONS_MODULE1'
```

## Causa Raíz

El error ocurre porque Next.js está tratando de procesar `mongodbService` como una Server Action, pero `mongodbService` es una **instancia de clase** (`MongoDBService`), no una función `async`.

El problema surge porque:

1. **Server Actions Recolecta Exportaciones**: Next.js recoge todas las exportaciones de archivos marcados con `"use server"` para convertirlas en Server Actions.

2. **Cadena de Importación**: 
   - `getRoleByName` (en `SupplyChainContract.ts`) está marcado con `"use server"` y exporta una función async.
   - `mongodbService` (en `lib/mongodb.ts`) ahora también está marcado con `"use server"` (después de nuestro refactor) pero exporta una **instancia de clase**.
   - `roleUtils.ts` importa ambos: `getRoleByName` y `mongodbService` (indirectamente, porque usa funciones que eventualmente dependen de ambos).
   - `page.tsx` o algún componente llama a un hook que usa `roleUtils.ts`, activando la recolección de Server Actions.

3. **Conflicto de Exportaciones**: Al incluir `mongodbService` en las exportaciones procesadas como Server Actions, Next.js falla porque no puede serializar una instancia de clase.

## Ruta de la Falta

```
"use server" en SupplyChainContract.ts (getRoleByName)
    ↑
Importado por roleUtils.ts (getRoleHashes)
    ↑
Importado por hooks (useUserRoles, useSupplyChainService)
    ↑
Usado en AdminDashboard, AdminUsersPage, etc.
```

Y simultáneamente:

```
"use server" en mongodb.ts (por nuestro refactor)
    ↑
Exporta mongodbService (instancia de clase)
    ↑
Importado por RoleDataService.ts
    ↑
Importado por hooks o servicios que podrían estar siendo recogidos
```

## Solución

### Opción 1: Separar claramente las Server Actions

1. **Mover `getRoleByName` a un archivo dedicado de Server Actions**:
   ```typescript
   // app/actions/role-actions.ts
   'use server';
   
   import { readContract } from '@wagmi/core';
   import config from '@/lib/wagmi/config';
   import { NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS } from '@/lib/env';
   import SupplyChainTrackerABI from '@/contracts/abi/SupplyChainTracker.json';
   
   export async function getRoleByName(roleType: string): Promise<string> {
     // ... implementación actual ...
   }
   ```

2. **Actualizar `roleUtils.ts` para importar desde el nuevo action**:
   ```typescript
   import { getRoleByName } from '@/app/actions/role-actions';
   ```

3. **Dejar `lib/mongodb.ts` sin `"use server"` pero asegurar que no se importe en el cliente**:
   - **Opción A**: Mantener `"use server"` en `mongodb.ts` pero **NO exportar `mongodbService`**. En su lugar, exportar solo funciones `async` que encapsulen las operaciones.
   - **Opción B**: Eliminar `"use server"` de `mongodb.ts` y asegurar su uso exclusivo en Rutas API y Server Components.

### Opción 2: No usar `"use server"` en servicios internos

Simplemente **remover `"use server"` de `lib/mongodb.ts`**. Este archivo solo se usa en Rutas API (como `api/mongodb/route.ts`) y en `RoleDataService.ts` (que es un servicio del lado del servidor). Las Server Actions solo necesitan `"use server"` en componentes del servidor o en archivos específicos de acciones.

**Revertir el cambio**:
```typescript
// web/src/lib/mongodb.ts
// NO incluir 'use server';
// Las funciones son llamadas indirectamente desde API Routes que son Server Components
```

### Recomendación

**Ir con la Opción 2**. Es la más simple y correcta:
- `mongodbService` nunca debió ser marcado como `"use server"` porque no se usa directamente como una Server Action.
- Su uso está restringido a servicios del servidor (`RoleDataService.ts`) y API Routes, ambientes donde ya son código del servidor.
- Esto resuelve el conflicto sin tener que reestructurar otras partes del código.

El problema original que llevó a añadir `"use server"` (`.server-only`) ya está resuelto por la separación de tipos y la eliminación de la exposición al cliente. No necesitamos `"use server"` para acceso restringido, solo para funciones invocadas directamente desde el cliente como Server Actions.