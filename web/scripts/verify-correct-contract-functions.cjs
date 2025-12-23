const ethers = require('ethers');
const fs = require('fs');
const path = require('path');

async function verifyCorrectContractFunctions() {
  console.log('=== Verifying Correct Contract Functions ===');
  
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
    console.log('\n✅ Connected to network:', network.name, network.chainId);
    
    // Load ABI
    const abiPath = path.join(__dirname, '../src/contracts/abi/SupplyChainTracker.json');
    const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
    
    // Create contract instance
    const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);
    
    console.log('\n🔍 Testing functions that our contract actually has...');
    
    // Test role functions (these are the ones our contract actually has)
    console.log('\n1. Testing role management functions:');
    
    try {
      const adminRole = await contract.DEFAULT_ADMIN_ROLE();
      console.log('  ✅ DEFAULT_ADMIN_ROLE:', adminRole);
      
      const fabricanteRole = await contract.FABRICANTE_ROLE();
      console.log('  ✅ FABRICANTE_ROLE:', fabricanteRole);
      
      const auditorHwRole = await contract.AUDITOR_HW_ROLE();
      console.log('  ✅ AUDITOR_HW_ROLE:', auditorHwRole);
      
      const tecnicoSwRole = await contract.TECNICO_SW_ROLE();
      console.log('  ✅ TECNICO_SW_ROLE:', tecnicoSwRole);
      
      const escuelaRole = await contract.ESCUELA_ROLE();
      console.log('  ✅ ESCUELA_ROLE:', escuelaRole);
    } catch (error) {
      console.log('  ❌ Role function test failed:', error.message);
    }
    
    // Test access control functions
    console.log('\n2. Testing access control functions:');
    
    try {
      const adminRole = await contract.DEFAULT_ADMIN_ROLE();
      const memberCount = await contract.getRoleMemberCount(adminRole);
      console.log('  ✅ getRoleMemberCount for admin role:', memberCount.toString());
      
      const hasRoleResult = await contract.hasRole(adminRole, '0x0000000000000000000000000000000000000000');
      console.log('  ✅ hasRole with zero address:', hasRoleResult);
      
      if (memberCount > 0) {
        const firstMember = await contract.getRoleMember(adminRole, 0);
        console.log('  ✅ First admin member:', firstMember);
      }
    } catch (error) {
      console.log('  ❌ Access control function test failed:', error.message);
    }
    
    // Test supply chain functions
    console.log('\n3. Testing supply chain functions:');
    
    try {
      const serialNumbers = await contract.getAllSerialNumbers();
      console.log('  ✅ getAllSerialNumbers succeeded, count:', serialNumbers.length);
      
      // Try to get state for a non-existent serial (should work but return default values)
      try {
        const state = await contract.getNetbookState('TEST001');
        console.log('  ✅ getNetbookState for non-existent serial:', state.toString());
      } catch (error) {
        console.log('  ⚠️  getNetbookState failed (might be expected):', error.message);
      }
    } catch (error) {
      console.log('  ❌ Supply chain function test failed:', error.message);
    }
    
    console.log('\n🔍 Summary of what our contract DOES have:');
    console.log('  - Role management (DEFAULT_ADMIN_ROLE, FABRICANTE_ROLE, etc.)');
    console.log('  - Access control (hasRole, getRoleMemberCount, etc.)');
    console.log('  - Supply chain tracking (getAllSerialNumbers, getNetbookState, etc.)');
    
    console.log('\n🔍 Summary of what our contract DOES NOT have:');
    console.log('  - ERC-20 functions (name, symbol, balanceOf, transfer, etc.)');
    console.log('  - ERC-721 functions (ownerOf, tokenURI, etc.)');
    console.log('  - Any token standard functions');
    
    console.log('\n✅ Verification completed');
    console.log('\n💡 SOLUTION:');
    console.log('  Make sure that any code calling the contract uses only the functions');
    console.log('  that our SupplyChainTracker contract actually implements.');
    console.log('  Avoid calling ERC-20 functions like name(), symbol(), balanceOf(), etc.');
    
  } catch (error) {
    console.error('❌ Error during verification:', error);
  }
}

verifyCorrectContractFunctions();