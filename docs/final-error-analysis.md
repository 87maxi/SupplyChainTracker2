# Análisis Final: Errores de Módulo en Cliente

## Error
```
Module not found: Can't resolve 'child_process'
Module not found: Can't resolve 'dns'
Module not found: Can't resolve 'fs'
Module not found: Can't resolve 'net'
Module not found: Can't resolve 'tls'
```

## Causa Raíz

A pesar de todas las correcciones anteriores, el cliente aún intenta importar el módulo `mongodb`, que internamente depende de módulos de Node.js (`child_process`, `dns`, `fs`, `net`, `tls`).

El problema NO es una punto único, sino una **fuga compleja de dependencias** a través de la cadena de importaciones llenas de ambiguas `* as`.

### Cadena de Fuga Identificada (con errores de tipo)

```typescript
// web/src/hooks/useSupplyChainService.ts
import * as SupplyChainService from '@/services/SupplyChainService'; // 🔴
```

Y en `SupplyChainService.ts`:
```typescript
// web/src/services/SupplyChainService.ts
export * from './contracts/supply-chain.service'; // 🔴 Exporta todo, por nombre, desde una clase
```

Esto causa que `useSupplyChainService`:
1. Busque métodos como `getAccountBalance` y `getRoleCounts`.
2. No los encuentre (porque no existen en la clase `SupplyChainService`).
3. Next.js intente cargar todo el módulo para resolver e informar el error, activando así las dependencias de Node.js.

## Soluciones

### Solución 1: Corregir Importaciones Dinámicas

En `web/src/hooks/useSupplyChainService.ts`, reemplazar la importación `* as` con una importación específica:
```typescript
// Reemplazar esto:
import * as SupplyChainService from '@/services/SupplyChainService';

// Con esto:
import { getAllSerialNumbers, getNetbookState, getNetbookReport } from '@/services/contracts/supply-chain.service';
// Y ajustar cada llamada: SupplyChainService.getAllSerialNumbers() -> getAllSerialNumbers()
```

### Solución 2: Corregir los Nombres de los Métodos en SupplyChainService

Añadir los métodos faltantes a la clase:
```typescript
// En web/src/services/contracts/supply-chain.service.ts
async getRoleCounts(): Promise<Record<string, number>> {
  // Implementación
}

async getAccountBalance(userAddress: string): Promise<string> {
  // Implementación
}
```

### Solución 3: Evitar la Fuga con `require` Condicional (Último Recurso)

Modificar el archivo API para usar una importación dinámica segura:
```typescript
// web/src/app/api/mongodb/route.ts
export async function POST(request: Request) {
  try {
    const { mongodbService } = await import('@/lib/mongodb');
    // ... resto del código ...
  } catch (error) {
    // ...
  }
}
```

### Recomendación Final

Ir con la **Solución 1** (corregir importación en `useSupplyChainService`) porque:
- Es la causa raíz directa del error de tipo que activa la fuga.
- Requiere un cambio mínimo en el código existente.
- No necesita modificar comportamiento de negocio.

La configuración de `next.config.js` es correcta desde el principio.