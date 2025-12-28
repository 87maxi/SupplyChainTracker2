# Plan de Refactorización de la Gestión de Roles

## Problemas Actuales

Tras el análisis del sistema de gestión de roles, se identificaron varios problemas de consistencia e integridad en el flujo de aprobación y revocación de roles:

1. **Inconsistencia en los nombres de roles**: El sistema utiliza tanto nombres completos con sufijo `_ROLE` como nombres base (ej. `FABRICANTE_ROLE` vs `FABRICANTE`), lo que genera confusión y errores en el mapeo.

2. **Problema de revocación de roles**: La función de revocación en `ApprovedAccountsList.tsx` pasa directamente el nombre del rol (`member.role`) a `revokeRole`, pero esta función espera un hash de 32 bytes, no un nombre de rol.

3. **Doble transformación en el flujo de aprobación**: En `useRoleRequests.ts`, la función `approveRequest` llama a `grantRole` con el nombre del rol, luego `useSupplyChainService` llama a `getRoleHashForName` para convertirlo a hash, pero esta conversión ya se debería haber manejado adecuadamente.

4. **Mapeo inconsistente de roles**: Aunque el contrato define roles como `FABRICANTE_ROLE`, `AUDITOR_HW_ROLE`, etc., el frontend a veces trabaja con las versiones sin sufijo, causando inconsistencias en el flujo de datos.

## Arquitectura Actual

### Contrato Inteligente (SupplyChainTracker.sol)

El contrato define roles inmutables usando keccak256:

```solidity
bytes32 public immutable FABRICANTE_ROLE = keccak256("FABRICANTE_ROLE");
bytes32 public immutable AUDITOR_HW_ROLE = keccak256("AUDITOR_HW_ROLE");
bytes32 public immutable TECNICO_SW_ROLE = keccak256("TECNICO_SW_ROLE");
bytes32 public immutable ESCUELA_ROLE = keccak256("ESCUELA_ROLE");
```

### Flujo de Aprobación de Roles

1. `PendingRoleRequests.tsx` → `handleApprove` → `approveRequest()` (hook)
2. `useRoleRequests.ts` → `approveMutation.mutateAsync` → `grantRole()` (hook)
3. `useSupplyChainService.ts` → `grantRole()` → `SupplyChainService.grantRole()`
4. `SupplyChainService.ts` → `writeContract` → Llama a `grantRole(roleHash, userAddress)`

### Flujo de Revocación de Roles

1. `ApprovedAccountsList.tsx` → Mapeo directo de `member.role` a `revokeRole()`
2. `useSupplyChainService.ts` → `revokeRole()` → `SupplyChainService.revokeRole()`
3. `SupplyChainService.ts` → `writeContract` → Llama directamente a `revokeRole(roleHash, userAddress)` sin conversión

## Plan de Resolver Inconsistencias

El problema principal está en la revocación de roles, donde `ApprovedAccountsList.tsx` pasa un nombre de rol (`FABRICANTE_ROLE`) cuando la función espera un hash de 32 bytes. A diferencia del flujo de aprobación, que incluye `getRoleHashForName`, el flujo de revocación no realiza esta conversión.

### Solución Propuesta

1. **Crear una función helper para mapeo de roles** en `roleUtils.ts` que garantice consistencia en todo el sistema.

2. **Ajustar `ApprovedAccountsList.tsx`** para que use esta función antes de llamar a `revokeRole`.

3. **Refactorizar el mapeo de roles** para eliminar inconsistencias entre nombres completos y cortos.

4. **Asegurar que todos los puntos de entrada** del sistema trabajen con el mismo formato de nombre de rol.

## Pasos de Implementación

### 1. Crear función helper de mapeo de roles

Crear una función centralizada que mapee nombres de roles a sus hashes correspondientes, manejando ambos formatos (`FABRICANTE` y `FABRICANTE_ROLE`).

### 2. Actualizar componente `ApprovedAccountsList` 

Modificar el componente `ApprovedAccountsList` para que utilice el mapeo de roles al revocar, asegurando que siempre pase un hash de 32 bytes al contrato.

### 3. Unificar formato de nombres de roles

Establecer un formato único para nombres de roles en todo el sistema, preferiblemente con el sufijo `_ROLE`, para evitar confusiones.

### 4. Actualizar tipos y documentación

Actualizar los tipos TypeScript y documentación para reflejar el formato unificado de nombres de roles.

### 5. Pruebas

Implementar pruebas que validen el flujo completo de aprobación y revocación de roles, asegurando que ambos funcionalidades mantengan consistencia en el mapeo.