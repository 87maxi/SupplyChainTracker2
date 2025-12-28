# Corrección de Consistencia en Roles del Contrato

## Problema Identificado

Durante el análisis se detectó un error relacionado con la gestión de roles en la aplicación, específicamente con el mensaje de error:

```
Size of bytes "AUDITOR_HW" (bytes10) does not match expected size (bytes32).
```

Este mensaje era incorrecto y engañoso, ya que no reflejaba el problema real en el sistema.

## Análisis del Sistema de Roles

### Verificación de Hashes de Roles

Se verificó que los hashes de roles en el contrato inteligente son correctos y se generan mediante `keccak256` de los nombres completos de los roles:

- `FABRICANTE_ROLE`: `0xbe0c84bfff967b2deb88bd0540d4a796d0ebfdcb72262ced26f1892b419e6457`
- `AUDITOR_HW_ROLE`: `0x49c0376dc7caa3eab0c186e9bc20bf968b0724fea74a37706c35f59bc5d8b15b`
- `TECNICO_SW_ROLE`: `0xeeb4ddf6a0e2f06cb86713282a0b88ee789709e92a08b9e9b4ce816bbb13fcaf`
- `ESCUELA_ROLE`: `0xa8f5858ea94a9ede7bc5dd04119dcc24b3b02a20be15d673993d8b6c2a901ef9`

Estos valores coinciden con los generados por `cast keccak` y con el almacenamiento del contrato.

### Layout de Almacenamiento

El layout de almacenamiento del contrato `SupplyChainTracker` confirma que los roles se almacenan correctamente como `bytes32`:

```
hw------------------+------------------------------------------------------+------+--------+-------+-----------------------------------------------╮
| Name             | Type                                                 | Slot | Offset | Bytes | Contract                                      |
+=================================================================================================================================================+
| _roles           | mapping(bytes32 => struct AccessControl.RoleData)    | 0    | 0      | 32    | src/SupplyChainTracker.sol:SupplyChainTracker |
|------------------+------------------------------------------------------+------+--------+-------+-----------------------------------------------|
| _roleMembers     | mapping(bytes32 => struct EnumerableSet.AddressSet)  | 1    | 0      | 32    | src/SupplyChainTracker.sol:SupplyChainTracker |
```

## Soluciones Implementadas

### 1. Corrección de Tipos en roleUtils.ts

Se actualizaron los tipos de datos en `roleUtils.ts` para asegurar consistencia con el sistema de tipos de viem:

**Antes**: `string`
**Después**: `` `0x${string}` ``,}

### 2. Mejora de Mensajes de Error

Se mejoraron los mensajes de error en `role.service.ts` para proporcionar información más útil:

**Antes**: `Rol ${roleName} no encontrado. Hash: ${roleHash}`
**Después**: `Rol ${roleName} no encontrado: ${roleKey}`

Esto ayuda a depurar problemas de mapeo entre nombres de roles y sus claves.

### 3. Validación de Tipos

Se implementó tipado riguroso en todas las funciones que manejan hashes de roles, asegurando que solo se acepten cadenas hexadecimales válidas de 32 bytes.

## Conclusión

El error original era engañoso y no representaba un problema real de tamaño de bytes. Se trató de un problema de calidad en los mensajes de error y consistencia de tipos. Las correcciones implementadas mejoran la robustez del sistema y facilitan la depuración futura.