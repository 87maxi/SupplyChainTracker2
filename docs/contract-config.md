# Configuración del Contrato

Esta configuración define los parámetros necesarios para interactuar con el contrato inteligente de trazabilidad de netbooks.

## Dirección del Contrato

La dirección del contrato inteligente debe ser configurada en la variable de entorno:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
```

## ABI del Contrato

El ABI del contrato se encuentra en:

- `web/src/contracts/abi/SupplyChainTracker.json`

Este archivo fue generado con el comando:

```bash
cd sc && forge inspect SupplyChainTracker abi > ../web/src/contracts/abi/SupplyChainTracker.json
```

## Variables de Entorno

Las variables de entorno necesarias para la aplicación son:

```env
# Configuración del Contrato
NEXT_PUBLIC_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000

# Configuración de Red
NEXT_PUBLIC_NETWORK_RPC_URL=http://localhost:8545

# Variables del Proyecto
NEXT_PUBLIC_PROJECT_NAME=Supply Chain Tracker
NEXT_PUBLIC_PROJECT_DESCRIPTION="Sistema de trazabilidad de netbooks educativas"
```

## Roles del Contrato

El contrato define los siguientes roles:

- `FABRICANTE_ROLE`: Para registrar netbooks
- `AUDITOR_HW_ROLE`: Para auditar hardware
- `TECNICO_SW_ROLE`: Para validar software
- `ESCUELA_ROLE`: Para asignar netbooks a estudiantes

## Estados de las Netbooks

Las netbooks pasan por los siguientes estados:

1. `FABRICADA` - Registro inicial
2. `HW_APROBADO` - Hardware auditado
3. `SW_VALIDADO` - Software validado
4. `DISTRIBUIDA` - Asignada a un estudiante