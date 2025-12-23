const ethers = require('ethers');

async function simpleContractCheck() {
  console.log('Simple contract check...');
  
  // Use hardcoded values instead of env imports
  const CONTRACT_ADDRESS = '0x0165878A594ca255338adfa4d48449f69242Eb8F';
  const RPC_URL = 'http://localhost:8545';
  
  console.log('Contract Address:', CONTRACT_ADDRESS);
  console.log('RPC URL:', RPC_URL);

  try {
    // Create provider
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    
    // Check network connection
    const network = await provider.getNetwork();
    console.log('Connected to network:', network.name, network.chainId);
    
    // Check if contract exists
    const code = await provider.getCode(CONTRACT_ADDRESS);
    if (code === '0x') {
      console.log('❌ ERROR: No contract code found at address');
      return;
    }
    console.log('✅ Contract code found');
    
    console.log('✅ Simple contract check completed');
    
  } catch (error) {
    console.error('❌ Error during simple check:', error);
  }
}

simpleContractCheck();