# Implementación del Cliente Blockchain

## Descripción

Este documento describe la implementación del cliente blockchain para la aplicación SupplyChainTracker2, que utiliza Viem para la conexión con la blockchain en desarrollo local con Anvil.

## Componentes Principales

### 1. Cliente Público (`publicClient`)

Cliente para operaciones de lectura que no requieren conexión de wallet.

**Características:**
- Conexión a Anvil en `http://localhost:8545`
- Timeout de 30 segundos
- 3 reintentos automáticos
- Multicall habilitado para optimización

**Uso principal:**
- Lectura de datos del contrato
- Verificación de conexión
- Obtención de balance de cuentas

### 2. Cliente de Wallet (`getWalletClient`)

Cliente para operaciones de escritura que requieren conexión de wallet.

**Características:**
- Soporte para cuentas específicas o cliente básico
- Validación de dirección con `getAddress`
- Extensión con `walletActions` para métodos adicionales
- Logging detallado para debugging

**Uso principal:**
- Ejecución de transacciones (`writeContract`)
- Operaciones que modifican el estado del contrato

## Funciones de Utilidad

### `checkBlockchainConnection()`

Verifica la conexión con la blockchain obteniendo el número de bloque actual.

### `getBalance(address)`

Obtiene el balance de una cuenta en wei y lo devuelve como string.

## Configuración

La URL RPC se configura a través de la variable de entorno `NEXT_PUBLIC_ANVIL_RPC_URL`, con un valor por defecto de `http://localhost:8545`.

## Uso en la Aplicación

```typescript
import { publicClient, getWalletClient } from '@/lib/blockchain/client';

// Para operaciones de lectura
const blockNumber = await publicClient.getBlockNumber();

// Para operaciones de escritura
const walletClient = await getWalletClient(account);
const hash = await walletClient.writeContract({...});
```

## Consideraciones de Seguridad

- Las direcciones de cuenta se normalizan usando `getAddress` de Viem
- Validación de parámetros en todas las operaciones críticas
- Manejo de errores robusto con logging detallado

## Debugging

El cliente incluye logging detallado para debugging, mostrando información sobre:
- Estado del cliente
- Métodos disponibles
- Cadena y transporte
- Parámetros de operaciones

Este logging es especialmente útil para diagnosticar problemas de conexión o métodos faltantes en el cliente.
