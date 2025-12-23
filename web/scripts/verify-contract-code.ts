import { ethers } from 'ethers';
import { NEXT_PUBLIC_RPC_URL, NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS } from '../src/lib/env';

async function verifyContractCode() {
  console.log('Verifying contract code...');
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
      console.log('❌ ERROR: No code found at the contract address');
      console.log('The contract may not be deployed or the address is incorrect.');
      return;
    }
    
    console.log('✅ Code found at contract address');
    console.log('Code length:', code.length, 'characters');
    
    // Check first few characters of code to verify it looks like contract bytecode
    console.log('First 20 characters of bytecode:', code.substring(0, 20));
    
    // Try to get contract storage at slot 0 (should not throw if contract exists)
    try {
      const storage = await provider.getStorage(NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS, 0);
      console.log('✅ Storage access successful');
      console.log('Storage slot 0:', storage);
    } catch (error) {
      console.log('⚠️  Storage access failed:', error);
    }
    
  } catch (error) {
    console.error('❌ Error verifying contract code:', error);
  }
}

verifyContractCode();