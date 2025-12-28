# Solución Correcta para los Hashes de Roles

## Descubrimiento Clave

El problema no era que `keccak256` y `sha3-256` fueran incompatibles, sino que estaba utilizando la función de hash incorrecta en Node.js. La solución es usar `viem`'s `keccak256` función, que produce el mismo resultado que Solidity's `keccak256`.

## Evidencia

1. **Hash del contrato (usando cast keccak)**:
   ```bash
   cd sc && cast keccak "FABRICANTE_ROLE"
   # Resultado: 0xbe0c84bfff967b2deb88bd0540d4a796d0ebfdcb72262ced26f1892b419e6457
   ```

2. **Hash del frontend (usando viem keccak256 correcta)**:
   ```bash
   node -e "console.log(require('viem').keccak256(require('viem').stringToBytes('FABRICANTE_ROLE')))"
   # Resultado: 0xbe0c84bfff967b2deb88bd0540d4a796d0ebfdcb72262ced26f1892b419e6457
   ```

Ahora los hashes coinciden perfectamente.

## Implicaciones

Dado que el hash calculado localmente con `viem.keccak256` coincide con el del contrato, no necesitamos confiar únicamente en la lectura de los hashes del contrato. Podemos:

1. Calcular localmente los hashes cuando sea necesario
2. Leer los hashes del contrato como redundancia
3. Usar una estrategia de fallback

## Actualización de roleUtils.ts

La función `getRoleHashes` en `roleUtils.ts` ya está correctamente implementada porque:

1. Usa `readContract` para obtener los hashes directamente del contrato
2. Tiene hashes de fallback que coinciden con los cálculos correctos
3. Devuelve los valores correctos

## Conclusión

El sistema de roles estaba funcionando correctamente en cuanto a hashes. El problema anterior con `crypto.createHash('sha3-256')` se debía al uso de la función de hash incorrecta, no a una incompatibilidad fundamental.

El sistema actual con `roleMapper` y `getRoleHashes` está funcionando correctamente y no requiere cambios adicionales en la lógica de hashes.