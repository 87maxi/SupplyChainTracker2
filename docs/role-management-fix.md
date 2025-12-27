# Corrección del Sistema de Gestión de Roles

## Problema

El sistema de gestión de roles fallaba al aprobar solicitudes porque la función `grantRole` en `SupplyChainService.ts` esperaba un hash de rol, pero `useRoleRequests.ts` le pasaba un nombre de rol normalizado (por ejemplo, "FABRICANTE" en lugar del hash).

Además, la función devolvía solo el hash de transacción en caso de éxito, pero `useRoleRequests.ts` esperaba un objeto con `{ success, hash }`.

## Solución Implementada

1. **Actualicé `grantRole` en `SupplyChainService.ts` para:
   - Aceptar el nombre del rol como parámetro en lugar del hash
   - Obtener el hash del rol utilizando `getRoleHashes` de `roleUtils`
   - Devolver un objeto con `{ success, hash }` en caso de éxito
   - Devolver un objeto con `{ success: false, error }` en caso de error

2. **Mantuve la consistencia con el resto del sistema:
   - Utilicé el mapeo de nombres de roles existente
   - Implementé manejo de errores robusto
   - Conservé el límite de gas alto para Anvil

## Cambios Detallados

```typescript
// Antes: aceptaba roleHash y devolvía transactionHash
export const grantRole = async (roleHash: string, userAddress: Address) => {
  // ... lógica ...
  return transactionHash;
};

// Después: acepta roleName y devuelve objeto de resultado
export const grantRole = async (roleName: string, userAddress: Address) => {
  // Obtiene el hash del rol usando getRoleHashes
  // Devuelve { success: true, hash: transactionHash } o { success: false, error: message }
};
```

## Resultado

El sistema ahora funciona correctamente:
- Las solicitudes de rol pueden ser aprobadas por los administradores
- Los mensajes de error son claros y descriptivos
- La interacción con la blockchain es confiable
- El sistema es resiliente a errores de red o contractuales