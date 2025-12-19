# Troubleshooting: Transacciones Pendientes en Wallet

## Problema: Transacciones Pendientes en Rabby Wallet

Cuando trabajas con una red local de Anvil, es común que aparezcan transacciones pendientes en Rabby Wallet que nunca se completan. Este documento explica por qué sucede y cómo solucionarlo.

---

## ¿Por qué sucede?

### Causa Principal: Desincronización de Nonce

Cuando reinicias Anvil sin estado persistente:

1. **Anvil se resetea** → El blockchain vuelve al bloque 0
2. **Los nonces se resetean** → Todas las cuentas vuelven a nonce 0
3. **Rabby mantiene el historial** → Recuerda los nonces anteriores (5, 6, 7...)
4. **Desincronización** → Rabby intenta enviar transacciones con nonce 5, pero Anvil espera nonce 0

**Resultado:** Las transacciones quedan en estado "pending" indefinidamente.

### Otras Causas

- **Chain ID inconsistente** entre reinicios de Anvil
- **Gas price incorrecto** para la red local
- **Transacciones duplicadas** por múltiples intentos
- **Conexión RPC interrumpida** durante el envío

---

## Soluciones

### ✅ Solución 1: Usar Estado Persistente (Recomendado)

El nuevo script `deploy_anvil.sh` ya incluye estado persistente:

```bash
./deploy_anvil.sh
```

Esto mantiene el estado del blockchain entre reinicios, evitando la desincronización de nonces.

**Ventajas:**
- No necesitas resetear la wallet
- Los contratos persisten entre reinicios
- Los nonces se mantienen consistentes

**Desventajas:**
- El archivo `anvil-state.json` puede crecer con el tiempo
- Necesitas limpiar manualmente si quieres empezar desde cero

---

### ✅ Solución 2: Resetear Rabby Wallet

Si ya tienes transacciones pendientes, necesitas resetear tu wallet.

#### Opción A: Clear Activity Data

1. Abre **Rabby Wallet**
2. Haz clic en el icono de **Settings** (⚙️)
3. Ve a **Advanced** o **Avanzado**
4. Busca **"Clear activity tab data"**
5. Confirma la acción

#### Opción B: Reset Account

1. Abre **Rabby Wallet**
2. Ve a **Settings** → **Advanced**
3. Busca **"Reset Account"**
4. Confirma el reset

> [!WARNING]
> Resetear la cuenta NO elimina tus fondos ni claves privadas. Solo limpia el historial de transacciones y nonces.

#### Opción C: Eliminar y Reagregar la Red

1. Abre **Rabby Wallet**
2. Ve a **Settings** → **Networks**
3. Encuentra **"Anvil Local"** (o como la hayas nombrado)
4. Elimina la red
5. Agrega nuevamente con estos parámetros:
   - **Network Name:** Anvil Local
   - **RPC URL:** http://localhost:8545
   - **Chain ID:** 31337
   - **Currency Symbol:** ETH

---

### ✅ Solución 3: Limpiar Estado de Anvil

Si quieres empezar completamente desde cero:

```bash
./cleanup_anvil.sh
```

Este script:
- Detiene todos los procesos de Anvil
- Elimina el archivo de estado (`anvil-state.json`)
- Opcionalmente limpia el historial de broadcast
- Te da instrucciones para resetear la wallet

**Después de ejecutar el script:**
1. Resetea tu wallet (ver Solución 2)
2. Ejecuta `./deploy_anvil.sh` nuevamente

---

### ✅ Solución 4: Cancelar Transacciones Manualmente

Si solo tienes pocas transacciones pendientes:

1. Abre **Rabby Wallet**
2. Ve a la pestaña **"Activity"**
3. Para cada transacción pendiente:
   - Haz clic en la transacción
   - Selecciona **"Speed Up"** o **"Cancel"**
   - Elige **"Cancel"**
   - Aumenta el gas price si es necesario
   - Confirma

> [!NOTE]
> Esta solución solo funciona si Anvil está corriendo y la red está accesible.

---

## Prevención

### Usar MetaMask (Alternativa)

MetaMask tiene mejor soporte para redes locales y permite resetear el nonce más fácilmente:

**Resetear en MetaMask:**
1. Settings → Advanced
2. **"Reset Account"**
3. Confirma

### Mejores Prácticas

1. **Siempre usa estado persistente** en desarrollo:
   ```bash
   ./deploy_anvil.sh  # Ya incluye --state-interval
   ```

2. **Limpia antes de empezar** un nuevo ciclo de desarrollo:
   ```bash
   ./cleanup_anvil.sh
   # Resetea wallet
   ./deploy_anvil.sh
   ```

3. **Mantén Anvil corriendo** durante tu sesión de desarrollo

4. **No reinicies Anvil** a menos que sea necesario

5. **Usa el mismo Chain ID** siempre (31337)

---

## Verificación

### Comprobar Nonce Actual

Puedes verificar el nonce de una cuenta con `cast`:

```bash
cast nonce 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --rpc-url http://localhost:8545
```

### Comprobar Estado de Anvil

```bash
# Ver si Anvil está corriendo
ps aux | grep anvil

# Ver el archivo de estado
ls -lh anvil-state.json
```

### Comprobar Conexión RPC

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

---

## Troubleshooting Adicional

### "Cannot connect to RPC"

**Problema:** La wallet no puede conectarse a Anvil

**Solución:**
1. Verifica que Anvil está corriendo: `ps aux | grep anvil`
2. Verifica el puerto: `lsof -i :8545`
3. Reinicia Anvil: `./deploy_anvil.sh`

### "Transaction underpriced"

**Problema:** El gas price es muy bajo

**Solución:**
1. En Rabby, aumenta el gas price manualmente
2. O cancela y reenvía la transacción

### "Nonce too high"

**Problema:** La wallet tiene un nonce más alto que el esperado

**Solución:**
1. Resetea la wallet (ver Solución 2)
2. O usa `./cleanup_anvil.sh` y empieza de nuevo

### "Nonce too low"

**Problema:** La wallet tiene un nonce más bajo que el esperado

**Solución:**
1. Esto indica que algunas transacciones se procesaron
2. Espera a que todas las transacciones pendientes se completen
3. O resetea la wallet si persiste

---

## Scripts de Ayuda

| Script | Propósito |
|--------|-----------|
| `./deploy_anvil.sh` | Inicia Anvil con estado persistente y despliega contratos |
| `./cleanup_anvil.sh` | Limpia estado de Anvil y procesos |
| `./generate_abi.sh` | Actualiza ABIs del contrato |

---

## Recursos Adicionales

- [Foundry Book - Anvil](https://book.getfoundry.sh/anvil/)
- [Rabby Wallet Documentation](https://rabby.io/)
- [Ethereum Nonce Explanation](https://ethereum.org/en/developers/docs/transactions/#nonce)

---

## Preguntas Frecuentes

**P: ¿Perderé mis fondos al resetear la wallet?**  
R: No, resetear solo limpia el historial local. Tus claves privadas y fondos permanecen intactos.

**P: ¿Puedo usar el mismo estado de Anvil en diferentes proyectos?**  
R: No es recomendable. Cada proyecto debe tener su propio estado.

**P: ¿Con qué frecuencia debo limpiar el estado?**  
R: Solo cuando quieras empezar completamente desde cero o tengas problemas persistentes.

**P: ¿Qué pasa si elimino anvil-state.json mientras Anvil está corriendo?**  
R: Anvil seguirá funcionando pero no guardará el estado. Es mejor detener Anvil primero.
