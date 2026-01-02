# Configuración de Despliegue

Este documento describe la configuración necesaria para desplegar y conectar la aplicación web al contrato inteligente.

## Variables de Entorno

La aplicación requiere varias variables de entorno para funcionar correctamente. Estas deben definirse en un archivo `.env.local` en el directorio raíz del proyecto `web/`.

### Variables Requeridas

- `NEXT_PUBLIC_ANVIL_RPC_URL`: URL del nodo RPC de Anvil (desarrollo)
  - Valor predeterminado: `http://127.0.0.1:8545`
  
- `NEXT_PUBLIC_ANVIL_CHAIN_ID`: ID de la cadena de Anvil
  - Valor predeterminado: `31337`
  
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`: ID del proyecto para WalletConnect
  - Valor predeterminado: `PROJECT_ID_DE_PRUEBA`
  
- `NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS`: Dirección del contrato desplegado
  - Valor predeterminado: `0x5FbDB2315678afecb367f032d93F642f64180aa3` (dirección por defecto en Anvil)
  
- `NEXT_PUBLIC_ENABLE_TEST_MODE`: Habilita el modo de prueba
  - Valor predeterminado: `true`

## Generación de ABIs

Los ABIs de los contratos inteligentes se generan automáticamente usando Foundry. Para generar el ABI del contrato `SupplyChainTracker.sol`, ejecuta:

```bash
# Desde el directorio raíz del proyecto
forge inspect sc/src/SupplyChainTracker.sol abi --json > web/src/contracts/abi/SupplyChainTracker.json
```

Esto creará el archivo ABI en el directorio `web/src/contracts/abi/` donde será utilizado por la aplicación web.

## Despliegue en Anvil

1. Inicia Anvil en una terminal:
```bash
anvil
```

2. Despliega el contrato inteligente:
```bash
# Desde el directorio sc/
cd sc
forge script script/Deploy.s.sol:Deploy --rpc-url http://localhost:8545 --broadcast
```

3. Copia la dirección del contrato desplegado e inclúyela en el archivo `.env.local`

4. Inicia la aplicación web:
```bash
# Desde el directorio web/
cd web
npm run dev
```

## Configuración para Producción

Para producción, las variables de entorno deben incluir:

- Una URL de RPC estable (Infura, Alchemy, etc.)
- El ID de cadena de la red correspondiente (Mainnet, Polygon, etc.)
- Un ID de proyecto válido de WalletConnect
- La dirección del contrato desplegado en la red correspondiente
- `NEXT_PUBLIC_ENABLE_TEST_MODE` debe establecerse en `false`

## Notas

- Las direcciones de Anvil son persistentes por sesión, pero pueden cambiar entre reinicios
- El contrato `SupplyChainTracker` debe estar desplegado antes de iniciar la aplicación web
- La validación de direcciones se realiza automáticamente en la capa de envío para asegurar direcciones checksumadas válidas