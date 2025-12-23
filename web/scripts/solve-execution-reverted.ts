import { ethers } from 'ethers';
import SupplyChainTrackerABI from '../src/contracts/abi/SupplyChainTracker.json';
import { NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS, NEXT_PUBLIC_RPC_URL } from '../src/lib/env';

async function solveExecutionReverted() {
  console.log('=== SOLVING EXECUTION REVERTED ERROR ===');
  console.log('Error: Execution error: execution reverted');
  console.log('Function signature: 0x313ce567 (name() function from ERC-20)');
  console.log('Contract Address:', NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS);
  console.log('RPC URL:', NEXT_PUBLIC_RPC_URL);

  console.log('\n🔍 ANALYSIS:');
  console.log('  The error occurs when trying to call the name() function (0x313ce567)');
  console.log('  This function is part of the ERC-20 standard, but our contract is not ERC-20');
  console.log('  This suggests that a tool or library is incorrectly treating our contract as ERC-20');

  try {
    // Create provider
    const provider = new ethers.JsonRpcProvider(NEXT_PUBLIC_RPC_URL);
    
    // Check network connection
    const network = await provider.getNetwork();
    console.log('\n✅ Connected to network:', network.name, network.chainId);
    
    // Check if contract exists
    const code = await provider.getCode(NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS);
    if (code === '0x') {
      console.log('❌ CRITICAL: No contract code found at address');
      console.log('\n🔧 SOLUTION:');
      console.log('  1. Deploy the contract:');
      console.log('     cd sc && forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast');
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
    
    console.log('\n🧪 TESTING CONTRACT FUNCTIONS:');
    
    // Test the actual functions our contract has
    try {
      const adminRole = await contract.DEFAULT_ADMIN_ROLE();
      console.log('✅ DEFAULT_ADMIN_ROLE works:', adminRole);
    } catch (error) {
      console.log('❌ DEFAULT_ADMIN_ROLE failed:', error);
    }
    
    try {
      const fabricanteRole = await contract.FABRICANTE_ROLE();
      console.log('✅ FABRICANTE_ROLE works:', fabricanteRole);
    } catch (error) {
      console.log('❌ FABRICANTE_ROLE failed:', error);
    }
    
    // Test the specific function that might be causing issues
    console.log('\n🔍 TESTING getRoleMemberCount (common source of reverted errors):');
    try {
      const adminRole = await contract.DEFAULT_ADMIN_ROLE();
      const count = await contract.getRoleMemberCount(adminRole);
      console.log('✅ getRoleMemberCount works, count:', count.toString());
    } catch (error: any) {
      console.log('❌ getRoleMemberCount failed:', error.message);
      
      if (error.message.includes('execution reverted')) {
        console.log('\n🔧 SOLUTION FOR getRoleMemberCount REVERTED ERROR:');
        console.log('  This is a common issue. Possible causes:');
        console.log('  1. Role not properly initialized in contract');
        console.log('  2. Access control restrictions');
        console.log('  3. Contract state corruption');
        
        console.log('\n🔧 RECOMMENDED FIXES:');
        console.log('  1. Redeploy the contract with proper initialization:');
        console.log('     cd sc && forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast');
        console.log('  2. Check contract constructor for proper role initialization');
        console.log('  3. Verify that the contract\'s AccessControl is properly set up');
      }
    }
    
    console.log('\n📋 ROOT CAUSE OF ORIGINAL ERROR (0x313ce567):');
    console.log('  Our SupplyChainTracker contract is NOT an ERC-20 token');
    console.log('  It does NOT have a name() function');
    console.log('  Something is trying to call name() on our contract, causing the revert');
    
    console.log('\n🔧 SOLUTIONS:');
    console.log('  1. IDENTIFY the source:');
    console.log('     - Check wallet connections (some wallets auto-detect token contracts)');
    console.log('     - Check if any library is assuming ERC-20 interface');
    console.log('     - Look for code that calls contract.name()');
    
    console.log('  2. FIX the source:');
    console.log('     - Ensure only correct contract functions are called');
    console.log('     - Add interface checks before calling ERC-20 functions');
    console.log('     - Update libraries to use correct contract interfaces');
    
    console.log('  3. PREVENT recurrence:');
    console.log('     - Add proper error handling for contract calls');
    console.log('     - Validate contract interfaces before calling functions');
    console.log('     - Use try/catch blocks for all contract interactions');
    
    console.log('\n✅ Analysis completed');
    
  } catch (error) {
    console.error('❌ Error during analysis:', error);
    
    console.log('\n🔧 EMERGENCY TROUBLESHOOTING:');
    console.log('  1. Restart Anvil: pkill anvil && anvil');
    console.log('  2. Redeploy contract: cd sc && forge script script/Deploy.s.sol --broadcast');
    console.log('  3. Update contract address in env.ts');
    console.log('  4. Restart development server');
  }
}

solveExecutionReverted();