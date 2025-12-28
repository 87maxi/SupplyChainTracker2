# Corrección del Sistema de Gestión de Roles

## Problema Resuelto

Se ha corregido el error en el sistema de gestión de roles que afectaba principalmente a la función de revocación de roles en `ApprovedAccountsList.tsx`. El problema consistía en que se pasaba directamente el nombre del rol (como `FABRICANTE_ROLE`) a la función `revokeRole`, cuando esta esperaba un hash de 32 bytes (`0x...`).

## Solución Implementada

### 1. Creación de `roleMapping.ts`

Se creó un nuevo archivo `roleMapping.ts` que contiene una clase `RoleMapper` centralizada para manejar el mapeo de nombres de roles a sus hashes correspondientes:

```typescript
// src/lib/roleMapping.ts
import { getRoleHashes } from '@/lib/roleUtils';

class RoleMapper {
  private readonly keyToName: Record<RoleKey, RoleName> = {
    FABRICANTE: 'FABRICANTE_ROLE',
    AUDITOR_HW: 'AUDITOR_HW_ROLE',
    TECNICO_SW: 'TECNICO_SW_ROLE',
    ESCUELA: 'ESCUELA_ROLE',
    ADMIN: 'DEFAULT_ADMIN_ROLE'
  };

  private readonly nameToKey: Record<RoleName, RoleKey> = {
    'FABRICANTE_ROLE': 'FABRICANTE',
    'AUDITOR_HW_ROLE': 'AUDITOR_HW',
    'TECNICO_SW_ROLE': 'TECNICO_SW',
    'ESCUELA_ROLE': 'ESCUELA',
    'DEFAULT_ADMIN_ROLE': 'ADMIN'
  };

  // Normaliza cualquier formato de nombre de rol
  normalizeRoleName(name: string): RoleName {
    // Maneja nombres completos, nombres cortos, y variantes con _ROLE
n    // ...
  }

  // Obtiene el hash para cualquier formato de nombre de rol
  async getRoleHash(name: string): Promise<`0x${string}`> {
    const fullRoleName = this.normalizeRoleName(name);
    const roleHashes = await getRoleHashes();
    const key = this.nameToKey[fullRoleName];
    const hash = roleHashes[key];
    if (!hash) {
      throw new Error(`Role hash not found for role: ${fullRoleName}`);
    }
    return hash;
  }
}

export const roleMapper = new RoleMapper();
```

### 2. Actualización de `ApprovedAccountsList.tsx`

Se modificó el componente `ApprovedAccountsList.tsx` para utilizar el nuevo `roleMapper`:

```typescript
// Antes: pasaba el nombre del rol directamente como hash
const hash = await revokeRole(role as `0x${string}`, address as `0x${string}`);

// Después: usa roleMapper para obtener el hash correcto
const roleHash = await roleMapper.getRoleHash(role);
const hash = await revokeRole(roleHash, address as `0x${string}`);
```

### 3. Actualización de `useSupplyChainService.ts`

Se modificó `getRoleHashForName` para que use el `roleMapper` centralizado, asegurando consistencia en todo el sistema:

```typescript
// Antes: tenía su propia lógica de mapeo duplicada
const getRoleHashForName = useCallback(async (role: string): Promise<`0x${string}`> => {
  // ... lógica de mapeo duplicada
});

// Después: delega al roleMapper centralizado
const getRoleHashForName = useCallback(async (role: string): Promise<`0x${string}`> => {
  if (role.startsWith('0x') && role.length === 66) {
    return role as `0x${string}`;
  }
  
  try {
    return await roleMapper.getRoleHash(role);
  } catch (error: any) {
    console.error('💥 Error getting role hash:', error);
    throw error;
  }
}, []);
```

## Beneficios de la Solución

1. **Consistencia**: Todas las partes del sistema ahora utilizan la misma lógica de mapeo de roles
2. **Mantenibilidad**: La lógica de mapeo está centralizada en un solo lugar
3. **Robustez**: Manejo adecuado de errores y validación de entradas
4. **Flexibilidad**: Soporte para múltiples formatos de nombres de roles

## Próximos Pasos

1. Implementar pruebas unitarias para `roleMapping.ts`
2. Revisar otros componentes que manejen roles para asegurar que usen el `roleMapper`
3. Documentar el uso del `roleMapper` en la documentación del sistema
4. Considerar la migración de todos los usos directos de nombres de roles a usar el `roleMapper`