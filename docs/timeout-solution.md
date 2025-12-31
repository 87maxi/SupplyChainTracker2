# Solución para Timeouts en Transacciones Blockchain

## Problema Original
El error `"Timed out while waiting for transaction"` ocurría cuando las transacciones de blockchain (especialmente `grantRole`) tomaban demasiado tiempo en confirmarse en la red local de Anvil.

## Causa Raíz
1. **Configuración de timeout fijo**: El timeout estaba fijado en 120 segundos sin reintentos
2. **Falta de manejo de conexión**: No se verificaba si Anvil estaba disponible antes de enviar transacciones
3. **Feedback limitado**: Los usuarios no recibían información clara sobre el estado de las transacciones

## Soluciones Implementadas

### 1. Sistema de Reintentos Automáticos
```typescript
// En BaseContractService.waitForTransaction()
protected async waitForTransaction(
  hash: `0x${string}`,
  timeout: number = process.env.NODE_ENV === 'development' ? 60 : 120,
  maxRetries: number = 2
) {
  let retries = 0;
  
  const attemptWait = async (): Promise<any> => {
    try {
      // ... lógica de espera con timeout
    } catch (error) {
      if ((error instanceof Error && error.name === 'AbortError') || 
          (error instanceof Error && error.message.includes('timeout'))) {
        
        if (retries < maxRetries) {
          retries++;
          // Backoff exponencial: 1s, 2s, 4s, etc.
          const backoffDelay = Math.pow(2, retries) * 1000;
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
          
          return attemptWait();
        }
      }
      throw error;
    }
  };
}
```

### 2. Verificación de Conexión
```typescript
// Nuevo método en BaseContractService
public async checkConnection(): Promise<boolean> {
  try {
    const publicClient = getPublicClient(config);
    if (!publicClient) return false;
    
    // Intentar una llamada simple para verificar la conexión
    await publicClient.getBlockNumber();
    return true;
  } catch (error) {
    console.error('Error de conexión con la blockchain:', error);
    return false;
  }
}
```

### 3. Mejor Feedback al Usuario
- **Estado "processing"**: Las solicitudes ahora tienen un estado intermedio
- **Mensajes de error específicos**: Diferentes mensajes para timeouts, rechazos de usuario, etc.
- **Transacción hash visible**: Los usuarios pueden ver el hash de la transacción en progreso

### 4. Timeouts Configurables por Entorno
```typescript
// Desarrollo: 60 segundos, Producción: 120 segundos
timeout: number = process.env.NODE_ENV === 'development' ? 60 : 120
```

## Flujo Mejorado

1. **Verificar conexión** → Si falla, error inmediato
2. **Enviar transacción** → Estado "processing"
3. **Esperar confirmación** → Con reintentos automáticos
4. **Manejar resultado** → Éxito o error con mensaje específico

## Beneficios

- ✅ **Menos timeouts**: Reintentos automáticos reducen fallos
- ✅ **Mejor UX**: Feedback claro sobre el estado de las transacciones  
- ✅ **Detección temprana**: Verificación de conexión previa
- ✅ **Configuración flexible**: Timeouts adaptados al entorno

## Comandos para Verificar

```bash
# Verificar que Anvil esté ejecutándose
curl http://127.0.0.1:8545

# Verificar build sin errores
npm run build --loglevel error

# Ejecutar tests
npm test
```

## Variables de Entorno Recomendadas

```env
NEXT_PUBLIC_ANVIL_RPC_URL=http://127.0.0.1:8545
NODE_ENV=development
```