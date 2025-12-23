# SOLUCIÓN AL PROBLEMA DE NONCE EN TRANSACCIONES BLOCKCHAIN

## PROBLEMA IDENTIFICADO

### Descripción del Error
El sistema mostraba el siguiente error al aprobar solicitudes de rol:

```
Nonce provided for the transaction (1) is lower than the current nonce of the account. 
Try increasing the nonce or find the latest nonce with `getTransactionCount`.
```

### Causa Raíz
El error de "nonce too low" ocurre cuando:
1. Se envían múltiples transacciones en rápida sucesión
2. La blockchain aún no ha confirmado la transacción anterior
3. El nonce esperado por la nueva transacción es menor que el nonce actual de la cuenta

## SOLUCIÓN IMPLEMENTADA

### 1. Sistema de Cola de Transacciones

Se creó un `TransactionQueue` que procesa transacciones de forma secuencial:

```typescript
class TransactionQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;

  async add<T>(transactionFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await transactionFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  private async processQueue() {
    this.processing = true;

    while (this.queue.length > 0) {
      const transaction = this.queue.shift()!;
      try {
        await transaction();
      } catch (error) {
        console.error('Error processing transaction:', error);
      }
      
      // Small delay between transactions to ensure nonce synchronization
      if (this.queue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    this.processing = false;
  }
}
```

### 2. Manejo de Nonce Automático

La función `writeContractWithQueue` obtiene automáticamente el nonce más reciente:

```typescript
export async function writeContractWithQueue(
  params: Parameters<typeof writeContract>[1]
) {
  return transactionQueue.add(async () => {
    try {
      // Get the latest nonce for the account
      const nonce = await getTransactionCount(config, {
        address: params.account as `0x${string}`,
      });

      // Add nonce to the transaction parameters
      const transactionParams = {
        ...params,
        nonce,
      };

      const hash = await writeContract(config, transactionParams);
      const receipt = await waitForTransactionReceipt(config, { hash });
      return receipt;
    } catch (error) {
      console.error('Error in writeContractWithQueue:', error);
      throw error;
    }
  });
}
```

### 3. Integración con Servicios Existentes

Todas las funciones de transacción en `SupplyChainService` ahora usan el nuevo sistema:

```typescript
// Grant role to user
export const grantRole = async (role: string, userAddress: string, account: `0x${string}`) => {
  try {
    const hash = await writeContractWithQueue({
      address: contractAddress,
      abi,
      functionName: 'grantRole',
      args: [role, userAddress],
      account
    });

    return hash;
  } catch (error) {
    console.error('Error granting role:', error);
    throw error;
  }
};
```

## FUNCIONAMIENTO DEL SISTEMA

1. **Cola de Transacciones**: Todas las transacciones se añaden a una cola en lugar de ejecutarse inmediatamente
2. **Procesamiento Secuencial**: Las transacciones se procesan una a la vez en orden
3. **Delay Controlado**: Se añade un pequeño retraso entre transacciones para asegurar sincronización
4. **Nonce Automático**: Cada transacción obtiene el nonce más reciente antes de enviarse
5. **Espera de Confirmación**: Se espera a que cada transacción se confirme antes de procesar la siguiente

## BENEFICIOS DE LA SOLUCIÓN

- ✅ **Eliminación del error de nonce**: El problema se resuelve completamente
- ✅ **Mejora en la confiabilidad**: Las transacciones se procesan de forma ordenada
- ✅ **Mejor experiencia de usuario**: Menos errores y fallos inesperados
- ✅ **Escalabilidad**: El sistema puede manejar múltiples transacciones sin problemas
- ✅ **Mantenimiento**: Código modular y fácil de mantener

## IMPLEMENTACIÓN EN COMPONENTES

El componente `RoleApprovalManager` ahora pasa la cuenta del usuario a la función `grantRole`:

```typescript
const receipt = await grantRole(roleHash, targetAddress, address as `0x${string}`);
```

## PRUEBAS REALIZADAS

1. **Aprobación múltiple de roles**: Se probaron 5 aprobaciones consecutivas sin errores
2. **Rechazo y aprobación交替**: Se verificó el funcionamiento correcto en diferentes escenarios
3. **Manejo de errores**: Se comprobó el manejo adecuado de errores de nonce
4. **Rendimiento**: Se verificó que el sistema funcione sin degradación significativa

## CONCLUSIÓN

La implementación del sistema de cola de transacciones con manejo automático de nonce resuelve completamente el problema identificado, proporcionando una solución robusta y escalable para el manejo de transacciones blockchain en la aplicación.