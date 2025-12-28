# Corrección Final del Funcionamiento de grantRole

## Problema Identificado

El error `@ Module.grantRole` ocurría porque la función `grantRole` en `SupplyChainService.ts` estaba utilizando su propia lógica de mapeo de roles, duplicada y potencialmente inconsistente con el sistema centralizado `roleMapper`. Esto creaba conflictos cuando se intentaba aprobar solicitudes de roles.

## Solución Implementada

Se realizaron dos cambios clave en `SupplyChainService.ts`:

### 1. Importación de roleMapper

Se añadió la importación necesaria en la parte superior del archivo:

```typescript
import { roleMapper } from '@/lib/roleMapping';
```

### 2. Reemplazo de lógica duplicada

Se eliminó la lógica de mapeo duplicada y se reemplazó con el uso del `roleMapper` centralizado:

**Antes**:
```typescript
// Lógica duplicada y potencialmente inconsistente
const roleHashes = await import('@/lib/roleUtils').then(({ getRoleHashes }) => getRoleHashes());
const roleKeyMap: Record<string, keyof typeof roleHashes> = { /* ... */ };
const roleKey = roleKeyMap[roleName] || roleName;
const roleHash = roleHashes[roleKey];
```

**Después**:
```typescript
// Uso del mapeador centralizado para consistencia
const roleHash = await roleMapper.getRoleHash(roleName);
```

## Resultado

Con estos cambios:

- La función `grantRole` ahora utiliza el mismo sistema de mapeo de roles que el resto de la aplicación
- Se elimina la lógica duplicada, reduciendo la posibilidad de errores
- Se asegura la consistencia entre la aprobación y revocación de roles
- El flujo completo de solicitud y aprobación de roles funciona correctamente

## Verificación

Se ha verificado que:

- Las solicitudes de roles pueden ser aprobadas correctamente
- El hash del rol se mapea correctamente al utilizar `roleMapper`
- No hay conflictos entre diferentes partes del sistema
- El sistema maneja adecuadamente los errores de mapeo de roles

El sistema de gestión de roles ahora está completamente funcional y consistente en todos sus componentes.