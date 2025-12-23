import { ethers } from 'ethers';
import { NEXT_PUBLIC_RPC_URL, NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS } from '../src/lib/env';

async function checkContractDeployment() {
  console.log('Checking contract deployment...');
  console.log('Contract Address:', NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS);
  console.log('RPC URL:', NEXT_PUBLIC_RPC_URL);

  try {
    // Create provider
    const provider = new ethers.JsonRpcProvider(NEXT_PUBLIC_RPC_URL);
    
    // Check if we can connect to the network
    const network = await provider.getNetwork();
    console.log('Connected to network:', network.name, network.chainId);
    
    // Check if there's code at the contract address
    const code = await provider.getCode(NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS);
    
    if (code === '0x') {
      console.log('❌ No code found at the contract address. The contract may not be deployed.');
      console.log('Please deploy the contract and update the address in env.ts');
      return;
    }
    
    console.log('✅ Code found at contract address. Contract appears to be deployed.');
    console.log('Code length:', code.length, 'characters');
    
  } catch (error) {
    console.error('Error checking contract deployment:', error);
  }
}

checkContractDeployment();