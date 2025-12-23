const ethers = require('ethers');
const fs = require('fs');
const path = require('path');

async function verifyFrontendRoleIssue() {
  console.log('=== VERIFY FRONTEND ROLE ISSUE ===');
  
  // Hardcoded values
  const NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS = '0x0165878A594ca255338adfa4d48449f69242Eb8F';
  const NEXT_PUBLIC_RPC_URL = 'http://localhost:8545';
  
  console.log('Contract Address:', NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS);
  console.log('RPC URL:', NEXT_PUBLIC_RPC_URL);

  try {
    // Create provider
    const provider = new ethers.JsonRpcProvider(NEXT_PUBLIC_RPC_URL);
    
    // Load ABI
    const abiPath = path.join(__dirname, '../src/contracts/abi/SupplyChainTracker.json');
    const SupplyChainTrackerABI = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
    
    // Create wallet with the admin private key
    const adminPrivateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    const wallet = new ethers.Wallet(adminPrivateKey, provider);
    
    console.log('\n🔍 Wallet info:');
    console.log('  Address:', wallet.address);
    
    // Create contract instance with signer
    const contract = new ethers.Contract(
      NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS,
      SupplyChainTrackerABI,
      wallet
    );
    
    // Get role hashes
    console.log('\n🔍 Getting role hashes...');
    const fabricanteRole = await contract.FABRICANTE_ROLE();
    const adminRole = await contract.DEFAULT_ADMIN_ROLE();
    
    console.log('  FABRICANTE_ROLE:', fabricanteRole);
    console.log('  DEFAULT_ADMIN_ROLE:', adminRole);
    
    // Check permissions
    console.log('\n🔍 Checking permissions...');
    const hasAdminRole = await contract.hasRole(adminRole, wallet.address);
    console.log('  Has DEFAULT_ADMIN_ROLE:', hasAdminRole);
    
    // Target address to grant role
    const targetAddress = '0x0000000000000000000000000000000000000002';
    
    // Simulate the exact sequence that causes the issue
    console.log('\n🔍 Simulating exact frontend sequence...');
    
    // 1. Check if target already has role
    const hasRoleBefore = await contract.hasRole(fabricanteRole, targetAddress);
    console.log('  Target already has FABRICANTE_ROLE:', hasRoleBefore);
    
    // 2. Estimate gas (this is what the frontend does)
    console.log('  Estimating gas...');
    const gasEstimate = await contract.grantRole.estimateGas(fabricanteRole, targetAddress);
    console.log('  Gas estimate:', gasEstimate.toString());
    
    // 3. Send transaction (this is where the frontend gets stuck)
    console.log('  Sending transaction...');
    
    // Simulate the exact parameters that the frontend would use
    const tx = await contract.grantRole(fabricanteRole, targetAddress, {
      gasLimit: gasEstimate
    });
    
    console.log('  Transaction hash:', tx.hash);
    
    // 4. Wait for confirmation (this is where the frontend gets stuck)
    console.log('  Waiting for confirmation...');
    const receipt = await tx.wait();
    
    console.log('  Transaction confirmed!');
    console.log('  Block number:', receipt.blockNumber);
    console.log('  Gas used:', receipt.gasUsed.toString());
    
    // 5. Verify the role was granted
    console.log('\n🔍 Verifying role was granted...');
    const hasRoleAfter = await contract.hasRole(fabricanteRole, targetAddress);
    console.log('  Target now has FABRICANTE_ROLE:', hasRoleAfter);
    
    // 6. Get updated member count
    const memberCount = await contract.getRoleMemberCount(fabricanteRole);
    console.log('  FABRICANTE_ROLE member count:', memberCount.toString());
    
    console.log('\n✅ Verification completed successfully!');
    console.log('   The issue is NOT in the contract or the basic transaction flow.');
    console.log('   The issue is likely in the frontend transaction handling.');
    
  } catch (error) {
    console.error('❌ Error during verification:', error);
    
    // Try to provide specific guidance
    if (error.message && error.message.includes('AccessControl')) {
      console.log('  AccessControl error - check role permissions');
    }
    
    if (error.message && error.message.includes('user rejected')) {
      console.log('  User rejected the transaction');
    }
    
    if (error.message && error.message.includes('insufficient funds')) {
      console.log('  Insufficient funds');
    }
    
    if (error.message && error.message.includes('execution reverted')) {
      console.log('  Execution reverted - check contract state');
    }
  }
}

verifyFrontendRoleIssue();