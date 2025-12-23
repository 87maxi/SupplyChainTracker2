const ethers = require('ethers');
const fs = require('fs');
const path = require('path');

async function debugGrantRole() {
  console.log('=== DEBUG GRANT ROLE FUNCTION ===');
  
  // Hardcoded values since we can't import from env.ts
  const NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS = '0x0165878A594ca255338adfa4d48449f69242Eb8F';
  const NEXT_PUBLIC_RPC_URL = 'http://localhost:8545';
  
  console.log('Contract Address:', NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS);
  console.log('RPC URL:', NEXT_PUBLIC_RPC_URL);

  try {
    // Create provider
    const provider = new ethers.JsonRpcProvider(NEXT_PUBLIC_RPC_URL);
    
    // Check network connection
    const network = await provider.getNetwork();
    console.log('\n✅ Connected to network:', network.name, network.chainId);
    
    // Check if contract exists
    const code = await provider.getCode(NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS);
    if (code === '0x') {
      console.log('❌ ERROR: No contract code found at address');
      return;
    }
    console.log('✅ Contract code found');
    
    // Load ABI
    const abiPath = path.join(__dirname, '../src/contracts/abi/SupplyChainTracker.json');
    const SupplyChainTrackerABI = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
    
    // Create contract instance
    const contract = new ethers.Contract(
      NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS,
      SupplyChainTrackerABI,
      provider
    );
    
    // Get role hashes
    console.log('\n🔍 Getting role hashes...');
    const fabricanteRole = await contract.FABRICANTE_ROLE();
    const auditorHwRole = await contract.AUDITOR_HW_ROLE();
    const tecnicoSwRole = await contract.TECNICO_SW_ROLE();
    const escuelaRole = await contract.ESCUELA_ROLE();
    const adminRole = await contract.DEFAULT_ADMIN_ROLE();
    
    console.log('  FABRICANTE_ROLE:', fabricanteRole);
    console.log('  AUDITOR_HW_ROLE:', auditorHwRole);
    console.log('  TECNICO_SW_ROLE:', tecnicoSwRole);
    console.log('  ESCUELA_ROLE:', escuelaRole);
    console.log('  DEFAULT_ADMIN_ROLE:', adminRole);
    
    // Check if admin has admin role
    console.log('\n🔍 Checking admin permissions...');
    const adminAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'; // Default Anvil account
    const hasAdminRole = await contract.hasRole(adminRole, adminAddress);
    console.log('  Admin address:', adminAddress);
    console.log('  Has DEFAULT_ADMIN_ROLE:', hasAdminRole);
    
    // Test grantRole function signature
    console.log('\n🔍 Checking grantRole function...');
    const grantRoleFragment = contract.interface.getFunction('grantRole');
    console.log('  Function signature:', grantRoleFragment.selector);
    console.log('  Function inputs:', grantRoleFragment.inputs);
    
    // Try to estimate gas for grantRole
    console.log('\n🔍 Estimating gas for grantRole...');
    try {
      const testAddress = '0x0000000000000000000000000000000000000001';
      const gasEstimate = await contract.grantRole.estimateGas(fabricanteRole, testAddress);
      console.log('  Gas estimate:', gasEstimate.toString());
    } catch (error) {
      console.log('  ❌ Gas estimation failed:', error);
    }
    
    console.log('\n✅ Debug completed');
    
  } catch (error) {
    console.error('❌ Error during debug:', error);
  }
}

debugGrantRole();