#!/bin/bash

# Configuration
SC_DIR="./sc"
SCRIPT_PATH="script/Deploy.s.sol"
RPC_URL="http://127.0.0.1:8545"
PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" # Anvil Account #0

# Check if Anvil is running
if ! curl -s -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' "$RPC_URL" > /dev/null; then
    echo "Error: Anvil is not running at $RPC_URL"
    echo "Please start Anvil in a separate terminal using 'anvil'"
    exit 1
fi

echo "Deploying contract from $SC_DIR..."

# Navigate to smart contract directory
cd "$SC_DIR" || exit

# Run deployment script
forge script "$SCRIPT_PATH" \
    --rpc-url "$RPC_URL" \
    --private-key "$PRIVATE_KEY" \
    --broadcast \
    --skip-simulation

echo "Deployment complete!"
