# Sistema de Trazabilidad de Netbooks - Configuración de Despliegue

## 🚀 Configuración de Despliegue y Entorno

Este documento define los requisitos y configuraciones necesarias para desplegar el sistema en diferentes entornos.

## ⚙️ Variables de Entorno

### Variables Requeridas

| Variable | Descripción | Entornos | Valor de Ejemplo |
|---------|-------------|----------|------------------|
| `NEXT_PUBLIC_ANVIL_RPC_URL` | URL del nodo JSON-RPC de Anvil | Todos | `http://127.0.0.1:8545` |
| `NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS` | Dirección del contrato desplegado | Todos | `0x5FbDB2315678afecb367f032d93F642f64180aa3` |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | ID del proyecto para WalletConnect | Todos | `3f2061443d834950482da0873d6e32d6` |
| `NEXT_PUBLIC_DEFAULT_ADMIN_ADDRESS` | Dirección del administrador por defecto | Todos | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` |
| `NEXT_PUBLIC_NETWORK_ID` | ID de la red blockchain | Todos | `31337` |
| `NEXT_PUBLIC_APP_NAME` | Nombre de la aplicación para WalletConnect | Todos | `Supply Chain Tracker` |
| `NODE_ENV` | Entorno de ejecución | Todos | `development` o `production` |

### Variables Opcionales

| Variable | Descripción | Valor Predeterminado |
|---------|-------------|---------------------|
| `NEXT_PUBLIC_ROLLBAR_ACCESS_TOKEN` | Token para monitorización con Rollbar | `` |
| `NEXT_PUBLIC_SENTRY_DSN` | DSN para monitorización con Sentry | `` |
| `PORT` | Puerto del servidor | `3000` |

## 📁 Estructura de Archivos de Entorno

```
/.env.local          # Variables locales (no incluidas en git)
/.env.development    # Variables para desarrollo
/.env.production     # Variables para producción
/.env.test          # Variables para pruebas
```

### Ejemplo de .env.local
```env
# RPC URL for Anvil connection
NEXT_PUBLIC_ANVIL_RPC_URL=http://127.0.0.1:8545

# Deployed contract address
NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

# WalletConnect Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=3f2061443d834950482da0873d6e32d6

# Default admin address
NEXT_PUBLIC_DEFAULT_ADMIN_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

# Network ID
NEXT_PUBLIC_NETWORK_ID=31337

# App name for WalletConnect
NEXT_PUBLIC_APP_NAME=Supply Chain Tracker

# Rollbar access token (optional)
NEXT_PUBLIC_ROLLBAR_ACCESS_TOKEN=

# Sentry DSN (optional)
NEXT_PUBLIC_SENTRY_DSN=
```

## 🛠️ Configuración de Wagmi

### wagmi.config.ts
```typescript
// web/src/lib/wagmi/config.ts
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { mainnet, polygon, bscTestnet } from 'wagmi/chains';

// Define Anvil chain
const anvilChain = {
  id: 31337,
  name: 'Anvil Local',
  network: 'anvil',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_ANVIL_RPC_URL || 'http://127.0.0.1:8545'],
    },
    public: {
      http: [process.env.NEXT_PUBLIC_ANVIL_RPC_URL || 'http://127.0.0.1:8545'],
    },
  },
  testnet: true,
} as const;

export const config = getDefaultConfig({
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Supply Chain Tracker',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
  chains: [anvilChain, mainnet, polygon, bscTestnet],
  transports: {
    [anvilChain.id]: http(),
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [bscTestnet.id]: http(),
  },
  ssr: true,
});
```

## 🔧 Scripts de Despliegue

### package.json
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "prepare": "husky install",
    "analyze": "ANALYZE=true next build",
    "export": "next export",
    "abi:generate": "./web/scripts/generate-abis.sh",
    "abi:watch": "cd sc && forge build --watch --build-info",
    "deploy:local": "cd sc && anvil && forge script script/Deploy.s.sol:Deploy --rpc-url $NEXT_PUBLIC_ANVIL_RPC_URL --broadcast",
    "deploy:testnet": "cd sc && forge script script/Deploy.s.sol:Deploy --rpc-url $ARBITRUM_SEPOLIA_RPC_URL --private-key $PRIVATE_KEY --broadcast",
    "deploy:mainnet": "cd sc && forge script script/Deploy.s.sol:Deploy --rpc-url $MAINNET_RPC_URL --private-key $PRIVATE_KEY --broadcast --verify"
  }
}
```

### Script de Generación de ABIs
```bash
#!/bin/bash
# web/scripts/generate-abis.sh

# Asegurarse de que el directorio de ABIs existe
mkdir -p ./src/contracts/abi

# Generar ABIs desde el contrato
forge inspect sc/src/SupplyChainTracker.sol abi --json > ./src/contracts/abi/SupplyChainTracker.json

# Validar que el ABI se generó correctamente
if [ -s ./src/contracts/abi/SupplyChainTracker.json ]; then
  echo "✅ ABI generado correctamente"
else
  echo "❌ Error al generar el ABI"
  exit 1
fi
```

## 🚨 Pre-requisitos de Despliegue

### Software Requerido
- **Node.js** v18 o superior
- **npm** v9 o superior
- **Foundry** (para despliegue de contratos)
- **Anvil** (para entorno local)
- **Wagmi CLI** (opcional para generación de hooks)

### Verificación de Prerrequisitos
```bash
# Verificar versiones
node --version
npm --version
forge --version
anvil --version
```

## 🏗️ Proceso de Despliegue Local

### 1. Iniciar Anvil
```bash
# En la raíz del proyecto
anvil
```

### 2. Desplegar Contrato
```bash
# En el directorio sc
cd sc
forge script script/Deploy.s.sol:Deploy --rpc-url http://127.0.0.1:8545 --broadcast
```

### 3. Configurar Variables de Entorno
```bash
# Crear .env.local en el directorio web
cd ../web
cp .env.example .env.local

# Actualizar con la dirección del contrato desplegado
# (obtenida del paso 2)
```

### 4. Generar ABI
```bash
# Generar ABI desde el contrato
npm run abi:generate
```

### 5. Iniciar Aplicación
```bash
# Iniciar el servidor de desarrollo
npm run dev
```

