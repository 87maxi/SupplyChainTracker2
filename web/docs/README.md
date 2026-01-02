# Documentación del Proyecto SupplyChainTracker

Este proyecto es una plataforma web3 para el seguimiento de la cadena de suministro de netbooks, utilizando tecnología blockchain para garantizar la transparencia y seguridad de los datos.

## Estructura del Proyecto

El proyecto está compuesto por tres componentes principales:

1. **Contrato Inteligente (smart contract)**: Implementado en Solidity en el directorio `sc/`
   - `SupplyChainTracker.sol`: Contrato principal que gestiona los estados de las netbooks y los roles de los participantes
   - Utiliza OpenZeppelin para funciones de seguridad y control de acceso

2. **Servicios Backend**:
   - MongoDB para persistencia de datos opcionales
   - IPFS para almacenamiento de documentos
   - Sistema de eventos y logs

3. **Interfaz Web (frontend)**: Implementada con Next.js en el directorio `web/`
   - Componentes reutilizables basados en shadcn/ui
   - Integración con RainbowKit y wagmi para conexión con wallets
   - Sistema de roles y permisos
   - Dashboards de administración y análisis

## Variables de Entorno

El archivo `.env.local` contiene las siguientes variables:

```
NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_NETWORK_ID=31337
NEXT_PUBLIC_RPC_URL=http://localhost:8545
NEXT_PUBLIC_ADMIN_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=YOUR_PROJECT_ID
```

## Características Principales

1. **Gestión de Netbooks**:
   - Registro de nuevas netbooks
   - Auditoría de hardware
   - Validación de software
   - Asignación a estudiantes
   - Seguimiento de estado a través de la cadena de suministro

2. **Sistema de Roles**:
   - Fabricante
   - Auditor de Hardware
   - Técnico de Software
   - Escuela
   - Administrador
   - Solicitudes de roles con aprobación

3. **Dashboards y Analytics**:
   - Métricas de estado de netbooks
   - Gráficos de distribución
   - Registro de actividades
   - Gestión de usuarios

## Herramientas y Tecnologías

- **Framework**: Next.js 16
- **Frontend**: React 19, Tailwind CSS, shadcn/ui
- **Blockchain**: Solidity, Foundry, Anvil
- **Conexión Wallet**: wagmi, viem, RainbowKit
- **Testing**: Jest, React Testing Library
- **Base de Datos**: MongoDB
- **Almacenamiento**: IPFS

## Despliegue

El sistema puede ser desplegado usando los scripts proporcionados:

- `deploy_anvil.sh`: Despliega el contrato en Anvil
- `deploy_with_state.sh`: Despliega con estado inicial
- `generate_abi.sh`: Genera los archivos ABI necesarios

## Estado del Proyecto

Actualmente el proyecto presenta algunos problemas de compilación relacionados con:
- Archivo `package-lock.json` corrupto
- Problemas en la estructura de algunos componentes de formularios
- Issues en el dashboard de solicitudes de roles

Estos problemas están siendo resueltos para asegurar un funcionamiento completo de la aplicación.

```Generated with [Continue](https://continue.dev)

Co-Authored-By: Continue <noreply@continue.dev>```
