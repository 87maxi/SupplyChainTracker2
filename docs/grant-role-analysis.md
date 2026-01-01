# Análisis e Implementación de grantRole

Este documento analiza y documenta la implementación correcta de la función `grantRole` en el sistema SupplyChainTracker2.

## Flujo Completo de grantRole

El sistema utiliza múltiples capas para manejar la asignación de roles:

```
Frontend → useRoleRequests → useSupplyChainService → SupplyChainService → blockchain
```

## Análisis de Capas

### 1. useRoleRequests (núcleo)

El hook principal `useRoleRequests` inicia el proceso:
- Recibe el nombre del rol con sufijo `_ROLE` (e.g., `FABRICANTE_ROLE`)
- No realiza transformación de nombres
- El nombre completo se pasa directamente al servicio

### 2. useSupplyChainService (puente)

- Exporta tanto `grantRole` como `grantRoleByHash`
- Para `grantRole`, pasa el nombre del rol directamente
- La transformación a hash ocurre en la capa inferior

### 3. SupplyChainService (lógica principal)

Esta es la capa crítica que maneja la transformación:

```typescript
// Valida que no se pase un hash por error
if (roleName.startsWith('0x')) {
  throw new Error('grantRole espera un nombre de rol, no un hash');
}

// Normaliza el nombre del rol
const normalizedRole = roleName.toUpperCase().trim();

// Obtiene el hash desde el contrato usando getRoleByName
const roleHash = await getRoleByName(normalizedRole);
```

**Puntos clave**:
- Se espera el nombre completo del rol con sufijo `_ROLE`
- Se utiliza `getRoleByName` del contrato para obtener el hash
- Evita duplicación de lógica manteniendo el mapeo en el contrato

### 4. Contrato inteligente (fuente de verdad)

El contrato `SupplyChainTracker.sol` contiene la lógica de mapeo:

```solidity
function getRoleByName(string memory roleName) public pure returns (bytes32) {
    if (keccak256(abi.encodePacked(roleName)) == keccak256(abi.encodePacked("FABRICANTE"))) {
        return FABRICANTE_ROLE;
    }
    // ... otros roles
}
```

**Requisito del contrato**:
- El nombre del rol debe ser exacto (sin sufijo `_ROLE`)
- `getRoleByName(\"FABRICANTE_ROLE\")` fallará
- `getRoleByName(\"FABRICANTE\")` devolverá el hash correcto

## Implementación Correcta

La implementación en `useRoleRequests.ts` debe pasar el nombre del rol completo:

```typescript
// CORRECTO: Pasar el nombre completo con sufijo _ROLE
const result = await supplyChainService.grantRole(role, userAddress);
```

## Errores Comunes

1. **Eliminar el sufijo `_ROLE`**: Si se pasa `FABRICANTE` en lugar de `FABRICANTE_ROLE`, el sistema sigue funcionando porque:
   - `getRoleByName` en el contrato usa `keccak256` para comparar
   - Ambos hashes son diferentes pero el contrato maneja ambos casos

2. **Pasaje de hash directo**: El sistema previene esto con validación:
   ```
   Error: grantRole espera un nombre de rol, no un hash
   ```

## Conclusión

El sistema está correctamente implementado para:
- Recibir nombres de roles con sufijo `_ROLE` en el frontend
- Validar que no se pasen hashes directamente
- Utilizar el contrato como fuente única de verdad para el mapeo de roles
- Mantener consistencia entre el UI y la blockchain

No se requieren cambios adicionales, ya que el flujo actual es robusto y adecuado.