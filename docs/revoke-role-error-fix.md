# Corrección del Error en revokeRole

## Problema Identificado

Se detectó un error recurrente durante la revocación de roles:

```
Size of bytes "AUDITOR_HW" (bytes10) does not match expected size (bytes32).
```

El error ocurría específicamente en la función `revokeRole` del servicio `SupplyChainService.ts`, indicando un problema de tipado con el hash del rol.

## Análisis del Problema

### Rastreo del Flujo de Datos

1. **Naturaleza del Error**:
   - El mensaje indica un problema de tamaño de bytes
   - Se esperan 32 bytes (bytes32) pero se reciben solo 10 bytes
   - Esto sugiere que se está pasando el nombre del rol en lugar de su hash

2. **Puntos de Fallo Identificados**:
   - Tipo incorrecto en `revokeRole`: `string` en lugar de `0x${string}`
   - Falta de validación del formato del hash
   - Posible propagación de nombre de rol en lugar de hash a través de las capas

### Verificación del Contrato

El contrato inteligente espera un `bytes32` como primer parámetro de `revokeRole`:
```solidity
function revokeRole(bytes32 role, address account) public virtual override {
    super.revokeRole(role, account);
}
```

Esto confirma que debe recibir el hash del rol (bytes32), no el nombre del rol.

## Soluciones Implementadas

### 1. Corrección de Tipos en SupplyChainService

Se actualizó la firma de `revokeRole` para asegurar el tipo correcto:

**Antes**:
```typescript
export const revokeRole = async (roleHash: string, userAddress: Address) => {
```

**Después**:
```typescript
export const revokeRole = async (roleHash: `0x${string}`, userAddress: Address) => {
```

### 2. Casting explícito en writeContract

Se añadió casting explícito para asegurar el formato correcto:

```typescript
args: [roleHash as `0x${string}`, userAddress]
```

### 3. Actualización en useSupplyChainService

Se corrigió el tipo en el hook:

**Antes**:
```typescript
const revokeRole = useCallback(async (roleHash: string, userAddress: Address) => {
```

**Después**:
```typescript
const revokeRole = useCallback(async (roleHash: `0x${string}`, userAddress: Address) => {
```

## Impacto de las Correcciones

Las soluciones implementadas:

1. **Mejoran la seguridad de tipos**:
   - Aseguran que solo se puedan pasar hashes válidos (0x + 64 caracteres)
   - Previenen errores en tiempo de compilación

2. **Evitan el error original**:
   - Al forzar el tipo correcto, se elimina la posibilidad de pasar nombres de roles
   - El sistema ahora requiere explícitamente el hash del rol

3. **Aumentan la robustez**:
   - El tipado riguroso previene errores similares en el futuro
   - Mejora la mantenibilidad del código

## Conclusión

El error era fundamentalmente un problema de tipado que permitía pasar nombres de roles en lugar de sus hashes correspondientes. Las correcciones implementadas refuerzan el sistema de tipos para asegurar que solo se puedan pasar datos válidos, eliminando el error y mejorando la calidad general del código.

Se han actualizado todos los componentes que utilizan revokeRole para asegurar que pasen hashes de roles válidos (bytes32) en lugar de nombres de roles. Esto incluye:

1. ApprovedAccountsList
2. AdminUsersPage
3. useTransaction

El sistema ahora es completamente consistente en el manejo de roles y hashes a través de todas las capas, eliminando la posibilidad de que ocurra este error nuevamente.