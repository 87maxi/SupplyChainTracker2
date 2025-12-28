# Descubrimiento Clave sobre la Generación de Hashes

## Problema Encontrado

Al investigar por qué los roles no se asignan correctamente, descubrí una discrepancia crítica entre la generación de hashes en el contrato inteligente y en el frontend:

**El contrato utilizaba `keccak256` pero el frontend estaba usando `sha3-256` de Node.js/crypto, que produce un resultado diferente**.

## Evidencia

1. **Hash del contrato (usando cast keccak)**:
   ```bash
   cd sc && cast keccak "FABRICANTE_ROLE"
   # Resultado: 0xbe0c84bfff967b2deb88bd0540d4a796d0ebfdcb72262ced26f1892b419e6457
   ```

2. **Hash del frontend (usando crypto sha3-256)**:
   ```bash
   node -e "console.log(require('crypto').createHash('sha3-256').update('FABRICANTE_ROLE').digest('hex'))"
   # Resultado: 76f3d5985e8c81e118504e722198e133df7d53ca3f8edeede3276862e4f67ff7
   ```

Los hashes son completamente diferentes, lo que explica por qué el contrato no reconoce los roles.

## Causa del Problema

Solidity's `keccak256` y la implementación de `sha3-256` en Node.js/cryptography no son compatibles directamente. Aunque ambos están basados en SHA-3, existen diferencias en el padding y la implementación que hacen que produzcan resultados diferentes.

## Solución

El frontend debe obtener los hashes de roles directamente del contrato inteligente, no calcularlos localmente. La función `getRoleHashes` en `roleUtils.ts` ya hace esto correctamente usando `readContract`.