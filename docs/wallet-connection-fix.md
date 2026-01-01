# Solución al Problema de Conexión de Wallet

## Problema Identificado

El botón de conexión de wallet estaba causando que la aplicación se congelara debido a varios problemas interrelacionados:

1. **Conflicto de hooks duplicados**: Existían dos hooks `useWeb3` en diferentes ubicaciones (`web/src/hooks/useWeb3.ts` y `web/src/lib/wagmi/useWeb3.ts`) con implementaciones diferentes e incompatibles.

2. **Uso incorrecto de `isConnected`**: En el hook original, se verificaba la propiedad `isConnected` inmediatamente después de llamar a `connect()`, lo que creaba una condición de carrera ya que `isConnected` no se actualiza hasta el siguiente render.

3. **Falta de manejo de errores adecuado**: No se proporcionaba retroalimentación clara al usuario cuando la conexión fallaba.

## Soluciones Implementadas

### 1. Unificación del Hook useWeb3

Se actualizó el hook en `web/src/hooks/useWeb3.ts` para:

- Utilizar una implementación consistente con las mejores prácticas
- Eliminar la verificación directa de `isConnected` después de conectar
- Mover la lógica de cambio de red al componente Header
- Mantener la compatibilidad con el nombre `connectWallet` que esperaban otros componentes

### 2. Mejora del Manejo de Estado

Se reemplazó el uso directo de `isConnected` con `status === 'connecting'` para un control más preciso del estado de conexión.

### 3. Feedback al Usuario Mejorado

Se implementó un toast de retroalimentación que:

- Se muestra con un retraso de 1 segundo para evitar spam
- Proporciona instrucciones claras para cambiar a la red Anvil (chainId: 31337)
- Utiliza un temporizador limpio para evitar fugas de memoria

### 4. Script de Diagnóstico

Se agregó un script de verificación `web/scripts/check-anvil-connection.js` que permite diagnosticar problemas de conexión con Anvil antes de iniciar la aplicación.

## Verificación

Para verificar que la solución funciona correctamente:

```bash
# 1. Verificar conexión con Anvil
npm run check:connection

# 2. Iniciar la aplicación
npm run dev

# 3. Probar la conexión de wallet
# - Conectar MetaMask/Rabby
# - Verificar que no hay congelamiento
# - Verificar que los mensajes de red correcta/incorrecta se muestran adecuadamente
```

## Prevención de Futuros Problemas

- Se eliminó la lógica redundante entre los diferentes hooks
- Se estableció un solo punto de verdad para la lógica de conexión
- Se documentó adecuadamente el comportamiento esperado
- Se agregaron herramientas de diagnóstico para problemas de conexión

La solución asegura que la interfaz no se bloquee durante la conexión y que los usuarios reciban retroalimentación clara sobre el estado de su conexión y red.