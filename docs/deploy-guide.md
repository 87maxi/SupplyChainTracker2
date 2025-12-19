# Guía de Despliegue - SupplyChainTracker

## Requisitos Previos

Antes de desplegar el contrato, asegúrese de tener instalado:

- Foundry (forge, anvil, cast)
- Git
- Node.js (opcional, para herramientas adicionales)
- jq (para procesamiento de JSON)

## Preparación del Entorno

1. Clone el repositorio:
```bash
git clone <url-del-repositorio>
cd SupplyChainTracker2
```

2. Compile los contratos (opcional, el script de despliegue lo hace automáticamente):
```bash
cd sc && forge build
```

## Despliegue del Contrato

### Opción 1: Despliegue Automático (Recomendado)

Ejecute el script de despliegue mejorado:

```bash
./deploy_anvil.sh
```

Este script:
- ✅ Verifica y detiene procesos de Anvil existentes
- ✅ Inicia Anvil con **estado persistente** (evita problemas de nonce)
- ✅ Configura Chain ID 31337 y block time de 1 segundo
- ✅ Compila el proyecto
- ✅ Despliega el contrato `SupplyChainTracker`
- ✅ Asigna todos los roles al desplegador
- ✅ Guarda la dirección del contrato en `variables.txt`
- ✅ Mantiene el estado en `anvil-state.json`

### Opción 2: Despliegue Manual

Si prefieres control total:

```bash
# 1. Iniciar Anvil con estado persistente
anvil --chain-id 31337 --block-time 1 --state-interval 1 --dump-state ./anvil-state.json &

# 2. Compilar contratos
cd sc && forge build

# 3. Desplegar
forge script script/Deploy.s.sol:DeploySupplyChainTracker \
  --rpc-url http://localhost:8545 \
  --broadcast \
  --sender 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 \
  --unlocked
```

## Resultado del Despliegue

Tras un despliegue exitoso, se generará el archivo `variables.txt` con la información esencial:

```text
Dirección del contrato: 0x5fbdb2315678afecb367f032d93f642f64180aa3
URL de RPC: http://localhost:8545
Chain ID: 31337
Estado persistente: ./anvil-state.json
Despliegue completado: 2025-12-19 11:00:00
Anvil PID: 12345
```

## Gestión del Estado

### Estado Persistente

El nuevo sistema de despliegue usa estado persistente para evitar problemas de transacciones pendientes:

- **Archivo de estado:** `anvil-state.json`
- **Ventaja:** Los contratos y nonces persisten entre reinicios
- **Desventaja:** Necesitas limpiar manualmente para empezar desde cero

### Limpiar Estado

Para empezar completamente desde cero:

```bash
./cleanup_anvil.sh
```

Este script:
- Detiene todos los procesos de Anvil
- Elimina `anvil-state.json`
- Opcionalmente limpia el historial de broadcast
- Proporciona instrucciones para resetear la wallet

## Actualizar ABIs

Si modificas el contrato, actualiza los ABIs automáticamente:

```bash
./generate_abi.sh
```

Este script:
- Compila el contrato
- Extrae el ABI usando `forge inspect`
- Actualiza `web/src/contracts/abi/SupplyChainTracker.json`
- Muestra un resumen de funciones y eventos

## Configuración de Wallet

### Rabby Wallet

Para conectar Rabby Wallet a Anvil:

1. Abre Rabby Wallet
2. Ve a Settings → Networks
3. Agrega una nueva red:
   - **Network Name:** Anvil Local
   - **RPC URL:** http://localhost:8545
   - **Chain ID:** 31337
   - **Currency Symbol:** ETH

### Importar Cuenta de Desarrollo

Anvil proporciona cuentas de desarrollo pre-financiadas. Para importar la primera:

**Private Key:** `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

> [!WARNING]
> Esta clave es pública y solo debe usarse en desarrollo local. NUNCA la uses en mainnet.

## Interacción con el Contrato

Puede interactuar con el contrato usando `cast`:

```bash
# Verificar total de netbooks
cast call $CONTRACT_ADDRESS "totalNetbooks()" --rpc-url http://localhost:8545

# Registrar una netbook (requiere rol FABRICANTE)
cast send $CONTRACT_ADDRESS \
  "registerNetbooks(string[],string[],string[])" \
  '["SERIAL001"]' '["BATCH001"]' '["Intel i5, 8GB RAM"]' \
  --rpc-url http://localhost:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

## Solución de Problemas

### Transacciones Pendientes en Wallet

Si ves transacciones pendientes que nunca se completan:

1. **Usa estado persistente** (ya incluido en `deploy_anvil.sh`)
2. **Resetea tu wallet** siguiendo las instrucciones en `docs/troubleshooting-wallet.md`
3. **Limpia y redespliega:**
   ```bash
   ./cleanup_anvil.sh
   # Resetea wallet
   ./deploy_anvil.sh
   ```

📚 **Guía completa:** [docs/troubleshooting-wallet.md](./troubleshooting-wallet.md)

### Error de caracteres Unicode

Si encuentra errores como "Invalid character in string", asegúrese de:

1. No usar caracteres Unicode en los strings del código Solidity
2. Usar solo caracteres ASCII estándar en mensajes de logs y comentarios
3. Reemplazar caracteres especiales con equivalentes ASCII

### Anvil no inicia

```bash
# Verificar si hay procesos de Anvil corriendo
ps aux | grep anvil

# Matar procesos existentes
pkill -f anvil

# Verificar puerto 8545
lsof -i :8545
```

## Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `./deploy_anvil.sh` | Despliega con estado persistente |
| `./cleanup_anvil.sh` | Limpia estado y procesos |
| `./generate_abi.sh` | Actualiza ABIs del contrato |

## Notas Importantes

- ✅ El script de despliegue ya no contiene direcciones hardcodeadas
- ✅ Todos los roles se asignan automáticamente al desplegador del contrato
- ✅ No se incluyen claves privadas ni información sensible en los archivos
- ✅ El contrato se despliega en la red local (Chain ID 31337) usando Anvil
- ✅ El estado persiste entre reinicios para evitar problemas de nonce
- ⚠️ Recuerda limpiar el estado cuando quieras empezar desde cero

## Recursos Adicionales

- [Foundry Book](https://book.getfoundry.sh/)
- [Troubleshooting Wallet Issues](./troubleshooting-wallet.md)
- [Architecture Documentation](./architecture.md)