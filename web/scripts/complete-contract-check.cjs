const ethers = require('ethers');
const fs = require('fs');
const path = require('path');

async function completeContractCheck() {
  console.log('=== Complete Contract Check ===');
  
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
    console.log('\n✅ Connected to network:', network.name, network.chainId);
    
    // Check if contract exists
    const code = await provider.getCode(CONTRACT_ADDRESS);
    if (code === '0x') {
      console.log('❌ ERROR: No contract code found at address');
      return;
    }
    console.log('✅ Contract code found (length:', code.length, 'characters)');
    
    // Load ABI
    const abiPath = path.join(__dirname, '../src/contracts/abi/SupplyChainTracker.json');
    const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
    
    // Create contract instance
    const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);
    
    // Test role constant functions
    console.log('\n🔍 Testing role constant functions...');
    
    try {
      const defaultAdminRole = await contract.DEFAULT_ADMIN_ROLE();
      console.log('✅ DEFAULT_ADMIN_ROLE:', defaultAdminRole);
    } catch (error) {
      console.log('❌ Error calling DEFAULT_ADMIN_ROLE:', error.message);
    }
    
    try {
      const fabricanteRole = await contract.FABRICANTE_ROLE();
      console.log('✅ FABRICANTE_ROLE:', fabricanteRole);
    } catch (error) {
      console.log('❌ Error calling FABRICANTE_ROLE:', error.message);
    }
    
    try {
      const auditorHwRole = await contract.AUDITOR_HW_ROLE();
      console.log('✅ AUDITOR_HW_ROLE:', auditorHwRole);
    } catch (error) {
      console.log('❌ Error calling AUDITOR_HW_ROLE:', error.message);
    }
    
    try {
      const tecnicoSwRole = await contract.TECNICO_SW_ROLE();
      console.log('✅ TECNICO_SW_ROLE:', tecnicoSwRole);
    } catch (error) {
      console.log('❌ Error calling TECNICO_SW_ROLE:', error.message);
    }
    
    try {
      const escuelaRole = await contract.ESCUELA_ROLE();
      console.log('✅ ESCUELA_ROLE:', escuelaRole);
    } catch (error) {
      console.log('❌ Error calling ESCUELA_ROLE:', error.message);
    }
    
    // Test getRoleMemberCount
    console.log('\n🔍 Testing getRoleMemberCount function...');
    try {
      const adminRole = await contract.DEFAULT_ADMIN_ROLE();
      const memberCount = await contract.getRoleMemberCount(adminRole);
      console.log('✅ getRoleMemberCount for admin role:', memberCount.toString());
    } catch (error) {
      console.log('❌ getRoleMemberCount failed:', error.message);
    }
    
    // Test hasRole function
    console.log('\n🔍 Testing hasRole function...');
    try {
      const adminRole = await contract.DEFAULT_ADMIN_ROLE();
      const hasRoleResult = await contract.hasRole(adminRole, '0x0000000000000000000000000000000000000000');
      console.log('✅ hasRole with zero address:', hasRoleResult);
    } catch (error) {
      console.log('❌ hasRole failed:', error.message);
    }
    
    // Test getAllSerialNumbers
    console.log('\n🔍 Testing getAllSerialNumbers function...');
    try {
      const serialNumbers = await contract.getAllSerialNumbers();
      console.log('✅ getAllSerialNumbers succeeded, count:', serialNumbers.length);
    } catch (error) {
      console.log('❌ getAllSerialNumbers failed:', error.message);
    }
    
    console.log('\n✅ Complete contract check completed');
    
  } catch (error) {
    console.error('❌ Error during complete check:', error);
  }
}

completeContractCheck();