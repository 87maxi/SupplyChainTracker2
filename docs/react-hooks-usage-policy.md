# React Hook Usage Policy

## Problema

Los hooks de React (como `useAccount`) no pueden ser utilizados dentro de clases normales o funciones que no sean componentes de React, ya que viola las reglas de React Hooks.

## Solución Implementada

1. Se eliminó el uso de `useAccount` dentro de `RoleService`
2. Se añadió una propiedad `account` en el servicio que debe ser proporcionada externamente
3. El servicio ahora valida que la cuenta esté disponible antes de operaciones de escritura
4. Se actualizó el constructor para aceptar una cuenta opcional

## Uso Correcto

El `RoleService` debe ser instanciado con la cuenta del usuario:

```typescript
const account = // obtener desde contexto de React
const roleService = new RoleService(contractAddress, abi, config, account);
```

Esta es la práctica recomendada para servicios que necesitan datos de hooks en entornos no-hooks.
