#!/bin/bash

# Este script despliega el contrato SupplyChainTracker en una instancia local de Anvil

# Iniciar Anvil en segundo plano
echo "Iniciando Anvil..."
anvil &
ANVIL_PID=$!

# Esperar a que Anvil inicialice
sleep 2

# Compilar el proyecto en el directorio sc
echo "Compilando el proyecto..."
(cd sc && forge build)

# Desplegar el contrato usando Forge
echo "Desplegando el contrato SupplyChainTracker..."
DEPLOY_OUTPUT=$(cd sc && forge script script/Deploy.s.sol:DeploySupplyChainTracker --rpc-url http://localhost:8545 --broadcast --sender 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --unlocked --skip-simulation)

echo "Salida del despliegue:"
echo "$DEPLOY_OUTPUT"

# Extraer la dirección del contrato desde el retorno del script
CONTRACT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep -oE '0: contract SupplyChainTracker 0x[0-9a-fA-F]{40}' | grep -oE '0x[0-9a-fA-F]{40}')

# Si no se encuentra, intentar desde el archivo de broadcast
if [ -z "$CONTRACT_ADDRESS" ]; then
    echo "Buscando dirección en el archivo de broadcast..."
    CONTRACT_ADDRESS=$(cd sc && cat broadcast/Deploy.s.sol/31337/run-latest.json | grep -oE '"contractAddress": *"0x[0-9a-fA-F]{40}"' | head -1 | grep -oE '0x[0-9a-fA-F]{40}')
fi

if [ -n "$CONTRACT_ADDRESS" ]; then
    echo "\nContrato desplegado en la dirección: $CONTRACT_ADDRESS"
    echo "Dirección del contrato: $CONTRACT_ADDRESS" > variables.txt
    echo "URL de RPC: http://localhost:8545" >> variables.txt
    echo "Despliegue completado. Anvil sigue en ejecución." >> variables.txt
else
    echo "\nError: No se pudo obtener la dirección del contrato. Revisa el despliegue."
    kill $ANVIL_PID
    exit 1
fi

# Mantener la sesión (Anvil sigue corriendo)
echo "\nPresiona Ctrl+C para detener Anvil."
wait $ANVIL_PID