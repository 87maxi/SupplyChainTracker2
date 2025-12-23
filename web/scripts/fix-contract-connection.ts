import { ethers } from 'ethers';
import SupplyChainTrackerABI from '../src/contracts/abi/SupplyChainTracker.json';
import { NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS, NEXT_PUBLIC_RPC_URL } from '../src/lib/env';

async function fixContractConnection() {
  console.log('Attempting to fix contract connection issues...');
  console.log('Contract Address:', NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS);
  console.log('RPC URL:', NEXT_PUBLIC_RPC_URL);

  try {
    // Create provider
    const provider = new ethers.JsonRpcProvider(NEXT_PUBLIC_RPC_URL);
    
    // Check network connection
    const network = await provider.getNetwork();
    console.log('✅ Connected to network:', network.name, network.chainId);
    
    // Check if contract exists
    const code = await provider.getCode(NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS);
    if (code === '0x') {
      console.log('❌ ERROR: No contract code found at address');
      console.log('SOLUTION:');
      console.log('  1. Deploy the contract using: cd sc && forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast');
      console.log('  2. Update the contract address in web/src/lib/env.ts');
      return;
    }
    console.log('✅ Contract code found');
    
    // Create contract instance
    const contract = new ethers.Contract(
      NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS,
      SupplyChainTrackerABI,
      provider
    );
    
    // Test basic contract functions
    console.log('\nTesting basic contract functions...');
    
    try {
      const adminRole = await contract.DEFAULT_ADMIN_ROLE();
      console.log('✅ DEFAULT_ADMIN_ROLE:', adminRole);
    } catch (error) {
      console.log('❌ DEFAULT_ADMIN_ROLE failed:', error);
      console.log('SOLUTION:');
      console.log('  Check that the ABI matches the deployed contract');
      console.log('  Verify the contract was deployed correctly');
    }
    
    // Try to get role member count
    try {
      const adminRole = await contract.DEFAULT_ADMIN_ROLE();
      const memberCount = await contract.getRoleMemberCount(adminRole);
      console.log('✅ getRoleMemberCount:', memberCount.toString());
    } catch (error: any) {
      console.log('❌ getRoleMemberCount failed:', error.message);
      
      if (error.message.includes('execution reverted')) {
        console.log('\n💡 SOLUTION FOR EXECUTION REVERTED ERROR:');
        console.log('  This error often occurs when:');
        console.log('  1. The contract is not properly initialized');
        console.log('  2. There\'s a mismatch between the ABI and deployed contract');
        console.log('  3. The function is being called with invalid parameters');
        console.log('  4. The contract state is corrupted');
        
        console.log('\nRECOMMENDED ACTIONS:');
        console.log('  1. Redeploy the contract:');
        console.log('     cd sc && forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast');
        console.log('  2. Update the contract address in web/src/lib/env.ts');
        console.log('  3. Restart your Anvil node if needed');
        console.log('  4. Clear any cached contract data');
      }
    }
    
    console.log('\n✅ Contract connection fix attempt completed');
    
  } catch (error) {
    console.error('❌ Error during fix attempt:', error);
    
    console.log('\n🔧 GENERAL TROUBLESHOOTING:');
    console.log('  1. Check that Anvil is running: anvil');
    console.log('  2. Verify the RPC URL is correct:', NEXT_PUBLIC_RPC_URL);
    console.log('  3. Check that the contract is deployed at:', NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS);
    console.log('  4. Ensure the ABI matches the deployed contract');
    console.log('  5. Restart Anvil and redeploy if needed');
  }
}

fixContractConnection();