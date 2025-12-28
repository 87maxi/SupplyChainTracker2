# Hashes de Roles del Contrato

## Hashes de Roles

Los hashes de roles del contrato inteligente `SupplyChainTracker.sol` se generan utilizando la función `keccak256` sobre el nombre completo del rol:

- `FABRICANTE_ROLE`: `0xbe0c84bfff967b2deb88bd0540d4a796d0ebfdcb72262ced26f1892b419e6457`
- `AUDITOR_HW_ROLE`: `0x49c0376dc7caa3eab0c186e9bc20bf968b0724fea74a37706c35f59bc5d8b15b`
- `TECNICO_SW_ROLE`: `0xeeb4ddf6a0e2f06cb86713282a0b88ee789709e92a08b9e9b4ce816bbb13fcaf`
- `ESCUELA_ROLE`: `0xa8f5858ea94a9ede7bc5dd04119dcc24b3b02a20be15d673993d8b6c2a901ef9`

## Generación

Estos hashes se generan como variables públicas inmutables en el contrato:
```solidity
bytes32 public immutable FABRICANTE_ROLE = keccak256("FABRICANTE_ROLE");
```

## Uso

La función `grantRole` del contrato espera como primer parámetro este hash de 32 bytes, no el nombre del rol como cadena.

## Importancia

El correcto mapeo entre nombres de roles y sus hashes correspondientes es crucial para la funcionalidad correcta del sistema de roles.