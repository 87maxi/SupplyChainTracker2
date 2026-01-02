# Validación de Checksum de Direcciones Ethereum

## Problema Identificado

Se encontró un error al intentar realizar una llamada al contrato con la dirección `0xe7f1725E7734CE288F8368f2E04C4400557EA640`:

```
Address "0xe7f1725E7734CE288F8368f2E04C4400557EA640" is invalid.

- Address must be a hex value of 20 bytes (40 hex characters).
- Address must match its checksum counterpart.
```

Este error ocurre porque viem valida estrictamente el checksum de las direcciones Ethereum (EIP-55), y la dirección proporcionada, aunque válida en formato hexadecimal, no tiene el formato de checksum correcto.

## Solución Implementada

Se ha implementado una solución integral para manejar correctamente las direcciones con checksum en toda la aplicación:

### 1. Validación y Normalización de Direcciones

Se creó una función `validateAndNormalizeAddress` en `web/src/lib/env.ts` que utiliza `getAddress` de viem para:

- Validar que la dirección sea válida
- Normalizarla al formato de checksum correcto
- Manejar errores adecuadamente

```typescript
// web/src/lib/env.ts
import { getAddress } from 'viem';

const validateAndNormalizeAddress = (address: string | undefined): `0x${string}` | undefined => {
  if (!address) return undefined;
  try {
    return getAddress(address); // Convierte a formato de checksum correcto
  } catch (error) {
    console.error(`Dirección inválida encontrada: ${address}`, error);
    return undefined;
  }
};
```

### 2. Manejo Centralizado de Variables de Entorno

La dirección del contrato ahora se procesa a través de esta función de validación:

```typescript
export const NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS = validateAndNormalizeAddress(process.env.NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS);
```

Esto asegura que cualquier dirección proveniente de variables de entorno esté correctamente validada y normalizada antes de ser utilizada.

### 3. Funciones de Utilidad para Direcciones

Se agregó una función de utilidad en `web/src/lib/utils.ts` para manejar direcciones en toda la aplicación:

```typescript
// web/src/lib/utils.ts
export function validateAndNormalizeAddress(address: string): string {
  if (!address) {
    throw new Error('Address is required');
  }
  
  try {
    // Use viem's getAddress to validate and normalize the address
    // This will throw if the address is invalid and return the checksummed version
    return getAddress(address);
  } catch (error) {
    throw new Error(`Invalid Ethereum address: ${address}. ${error.message}`);
  }
}
```

### 4. Uso en Componentes y Servicios

Estas funciones se utilizan en múltiples puntos de la aplicación:

- `truncateAddress`: Valida antes de truncar
- `getAddressExplorerUrl`: Valida antes de construir URLs
- Todos los servicios de contrato: Reciben direcciones ya validadas

## Beneficios de la Solución

1. **Consistencia**: Todas las direcciones en la aplicación están en formato de checksum correcto
2. **Prevención de Errores**: Se evitan errores de validación en tiempo de ejecución
3. **Mejor Experiencia de Desarrollo**: Los errores de dirección se capturan temprano con mensajes descriptivos
4. **Código Más Seguro**: Reducción de vulnerabilidades relacionadas con direcciones malformadas

## Uso

### Para Variables de Entorno

Las direcciones en `.env` pueden tener cualquier formato, ya que serán normalizadas:

```env
NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS=0xe7f1725e7734ce288f8368f2e04c4400557ea640
```

### Para Direcciones en Código

Importa y usa la función de utilidad:

```typescript
import { validateAndNormalizeAddress } from '@/lib/utils';

// Normalizar cualquier dirección antes de usarla
const validAddress = validateAndNormalizeAddress('0xe7f1725e7734ce288f8368f2e04c4400557ea640');
```

O usa la versión que no lanza excepciones para casos donde la dirección podría ser inválida:

```typescript
import { validateAddress } from '@/lib/env';

// Retorna undefined si la dirección es inválida
const validAddress = validateAddress(process.env.SOME_ADDRESS);
if (validAddress) {
  // Usar la dirección
}
```

## Pruebas

La solución ha sido probada y validada:

- ✅ Build de la aplicación exitoso
- ✅ Todas las pruebas pasan
- ✅ El script de validación de configuración confirma la conexión
- ✅ Las llamadas al contrato ahora funcionan correctamente

## Conclusión

La causa raíz del error era la falta de manejo adecuado del checksum de direcciones Ethereum. La solución implementada asegura que todas las direcciones en la aplicación estén correctamente validadas y normalizadas, eliminando este tipo de errores en el futuro.