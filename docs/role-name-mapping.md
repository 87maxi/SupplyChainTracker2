# Mapeo de Nombres de Roles

## Problema

El contrato `SupplyChainTracker.sol` y el frontend utilizaban diferentes convenciones para los nombres de roles:

- **Contrato**: Usa nombres base como `FABRICANTE`, `AUDITOR_HW`, `TECNICO_SW`, etc.
- **Frontend**: Usa nombres completos con sufijo `_ROLE` como `FABRICANTE_ROLE`, `AUDITOR_HW_ROLE`, etc.

Esta discrepancia causaba errores al intentar obtener los hashes de roles para operaciones de acceso.

## Solución Implementada

Se implementó un sistema de mapeo de dos niveles para resolver esta discrepancia:

### 1. Función `getRoleByName` en el contrato

El contrato `SupplyChainTracker.sol` incluye una función `getRoleByName(string roleType)` que traduce nombres base de roles a sus hashes:

```solidity
function getRoleByName(string memory roleType) public pure returns (bytes32) {
    if (keccak256(abi.encodePacked(roleType)) == keccak256(abi.encodePacked("FABRICANTE"))) {
        return FABRICANTE_ROLE();
    } else if (keccak256(abi.encodePacked(roleType)) == keccak256(abi.encodePacked("AUDITOR_HW"))) {
        return AUDITOR_HW_ROLE();
    } else if (keccak256(abi.encodePacked(roleType)) == keccak256(abi.encodePacked("TECNICO_SW"))) {
        return TECNICO_SW_ROLE();
    } else if (keccak256(abi.encodePacked(roleType)) == keccak256(abi.encodePacked("ESCUELA"))) {
        return ESCUELA_ROLE();
    } else if (keccak256(abi.encodePacked(roleType)) == keccak256(abi.encodePacked("ADMIN"))) {
        return DEFAULT_ADMIN_ROLE();
    }
    revert("Rol no válido");
}
```

### 2. Mapeo en el frontend

El frontend implementa dos capas de mapeo:

#### a) `getRoleHashes()` en `roleUtils.ts`

Esta función utiliza `getRoleByName` del contrato para obtener los hashes de los roles:

```typescript
const roleMapping: Record<string, { contractName: string; key: RoleKey }> = {
  FABRICANTE: { contractName: 'FABRICANTE', key: 'FABRICANTE' },
  AUDITOR_HW: { contractName: 'AUDITOR_HW', key: 'AUDITOR_HW' },
  TECNICO_SW: { contractName: 'TECNICO_SW', key: 'TECNICO_SW' },
  ESCUELA: { contractName: 'ESCUELA', key: 'ESCUELA' },
  ADMIN: { contractName: 'ADMIN', key: 'ADMIN' }
};

for (const [roleName, mapping] of Object.entries(roleMapping)) {
  const contractName = mapping.contractName;
  const roleKey = mapping.key;
  try {
    const roleHash = await getRoleByName(contractName);
    if (roleHash) {
      result[roleKey] = roleHash as `0x${string}`;
    }
  } catch (error) {
    console.error(`Error getting role hash for ${roleName}:`, error);
  }
}
```

#### b) Transformación en `RoleService`

El servicio `RoleService` elimina el sufijo `_ROLE` de los nombres de roles cuando se llaman las funciones:

```typescript
// Convertir ContractRoles a ContractRoleName eliminando '_ROLE' del final
const roleKey = (roleName as ContractRoles).replace('_ROLE', '') as ContractRoleName;
```

## Flujo de Operación

Cuando se llama a `grantRole("FABRICANTE_ROLE", address)` en el frontend:

1. El servicio `RoleService` recibe `"FABRICANTE_ROLE"`
2. Remueve el sufijo `_ROLE` para obtener `"FABRICANTE"`
3. Usa `getRoleHashes()` que llama a `getRoleByName("FABRICANTE")` en el contrato
4. Obtiene el hash del rol correspondiente
5. Realiza la operación `grantRole` con el hash obtenido

## Mejoras Adicionales

Se agregaron funciones de conveniencia en `SupplyChainService.ts` para operaciones directas por nombre de rol:

- `getRoleByName(roleName)`
- `hasRoleByName(roleName, userAddress)`
- `grantRoleByName(roleName, userAddress)`
- `revokeRoleByName(roleName, userAddress)`

Estas funciones permiten operar directamente con nombres de roles sin necesidad de conocer los hashes, facilitando la integración con componentes frontend futuros.

## Estado Actual

El sistema de mapeo de roles está completamente funcional y resuelve la discrepancia entre las convenciones del frontend y el contrato. No se requieren cambios adicionales en la implementación actual.