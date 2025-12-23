import { ethers } from 'ethers';
import SupplyChainTrackerABI from '../src/contracts/abi/SupplyChainTracker.json';
import { NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS, NEXT_PUBLIC_RPC_URL } from '../src/lib/env';

async function verifyContractConnection() {
  console.log('Verifying contract connection...');
  console.log('Contract Address:', NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS);
  console.log('RPC URL:', NEXT_PUBLIC_RPC_URL);

  try {
    // Create provider
    const provider = new ethers.JsonRpcProvider(NEXT_PUBLIC_RPC_URL);
    
    // Check if we can connect to the network
    const network = await provider.getNetwork();
    console.log('Connected to network:', network.name, network.chainId);
    
    // Create contract instance
    const contract = new ethers.Contract(
      NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS,
      SupplyChainTrackerABI,
      provider
    );
    
    // Try to call a simple view function
    console.log('Testing contract connection...');
    const adminRole = await contract.DEFAULT_ADMIN_ROLE();
    console.log('DEFAULT_ADMIN_ROLE:', adminRole);
    
    console.log('Contract connection verified successfully!');
    
  } catch (error) {
    console.error('Error verifying contract connection:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('execution reverted')) {
        console.error('\nPossible causes:');
        console.error('1. Contract not deployed at the specified address');
        console.error('2. Incorrect contract address');
        console.error('3. Network mismatch');
        console.error('4. ABI mismatch');
      }
    }
  }
}

verifyContractConnection();