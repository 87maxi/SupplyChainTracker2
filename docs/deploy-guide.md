# Guía de Despliegue - SupplyChainTracker

## Requisitos Previos

Antes de desplegar el contrato, asegúrese de tener instalado:

- Foundry (forge, anvil, cast)
- Git
- Node.js (opcional, para herramientas adicionales)

## Preparación del Entorno

1. Clone el repositorio:
```bash
git clone <url-del-repositorio>
cd SupplyChainTracker2
```

2. Inicie una instancia de Anvil en un terminal separado:
```bash
anvil
```

## Despliegue del Contrato

Ejecute el script de despliegue:

```bash
./deploy_anvil.sh
```

Este script:
- Inicia Anvil si no está corriendo
- Compila el proyecto
- Despliega el contrato `SupplyChainTracker`
- Asigna todos los roles al desplegador (msg.sender)
- Guarda la dirección del contrato en `variables.txt`

## Resultado del Despliegue

Tras un despliegue exitoso, se generará el archivo `variables.txt` con la información esencial:

```text
Dirección del contrato: 0x5fbdb2315678afecb367f032d93f642f64180aa3
URL de RPC: http://localhost:8545
Chain ID: 31337
```

## Interacción con el Contrato

Puede interactuar con el contrato usando `cast`:

```bash
# Verificar estado de una netbook
cast call 0x5fbdb2315678afecb367f032d93f642f64180aa3 "getNetbookState(string memory)" "SERIAL123" --rpc-url http://localhost:8545
```

## Notas Importantes

- El script de despliegue ya no contiene direcciones hardcodeadas
- Todos los roles se asignan automáticamente al desplegador del contrato
- No se incluyen claves privadas ni información sensible en los archivos
- El contrato se despliega en la red local (Chain ID 31337) usando Anvil

## Solución de Problemas

### Error de caracteres Unicode

Si encuentra errores como "Invalid character in string", asegúrese de:

1. No usar caracteres Unicode en los strings del código Solidity
2. Usar solo caracteres ASCII estándar en mensajes de logs y comentarios
3. Reemplazar caracteres especiales con equivalentes ASCII

El script `DeployDebug.s.sol` ha sido corregido para evitar este problema usando solo caracteres ASCII.