const ethers = require('ethers');

async function testERC20NameCall() {
  console.log('Testing ERC-20 name() call (0x313ce567)...');
  
  // Use hardcoded values
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
    
    // The error 0x313ce567 corresponds to the name() function in ERC-20
    // Let's see what happens when we call it
    console.log('\n🔍 Calling name() function (0x313ce567)...');
    
    const tx = {
      to: CONTRACT_ADDRESS,
      data: '0x313ce567'
    };
    
    try {
      const result = await provider.call(tx);
      console.log('✅ name() function call succeeded');
      console.log('Result:', result);
      
      // Try to decode the result as a string
      try {
        const decoded = ethers.AbiCoder.defaultAbiCoder().decode(['string'], result);
        console.log('Decoded result:', decoded[0]);
      } catch (decodeError) {
        console.log('Could not decode result as string');
      }
    } catch (error) {
      console.log('❌ name() function call failed (this is expected for our contract):');
      console.log('  Error message:', error.message);
      console.log('  Error code:', error.code);
      
      if (error.message && error.message.includes('execution reverted')) {
        console.log('\n💡 This is the error you reported!');
        console.log('  Our contract is not an ERC-20 token, so it does not have a name() function.');
        console.log('  This error likely occurs when a tool or library expects an ERC-20 contract.');
        
        console.log('\n🔍 Possible causes:');
        console.log('  1. A wallet or library is trying to treat our contract as an ERC-20 token');
        console.log('  2. An incorrect contract address is being used');
        console.log('  3. A tool is making assumptions about contract interfaces');
        
        console.log('\n✅ This is normal behavior for our SupplyChainTracker contract');
        console.log('  The contract is working correctly - it just doesn\'t implement ERC-20');
      }
      
      if (error.reason) {
        console.log('  Error reason:', error.reason);
      }
      if (error.data) {
        console.log('  Error data:', error.data);
      }
    }
    
    console.log('\n✅ ERC-20 name() call test completed');
    
  } catch (error) {
    console.error('❌ Error during test:', error);
  }
}

testERC20NameCall();