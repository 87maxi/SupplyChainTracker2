const ethers = require('ethers');
const fs = require('fs');
const path = require('path');

// This script simulates what the frontend should do to properly handle role approval

async function frontendRoleTest() {
  console.log('=== FRONTEND ROLE APPROVAL TEST ===');
  
  // Hardcoded values
  const NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS = '0x0165878A594ca255338adfa4d48449f69242Eb8F';
  const NEXT_PUBLIC_RPC_URL = 'http://localhost:8545';
  
  console.log('Testing frontend role approval flow...');
  console.log('Contract Address:', NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS);

  try {
    // Simulate frontend state
    let loadingState = 'idle'; // 'idle' | 'pending' | 'success' | 'error'
    
    console.log('\n🔍 Initial state:', loadingState);
    
    // Simulate user action - click approve button
    console.log('\n🖱️  User clicked "Approve" button');
    loadingState = 'pending';
    console.log('🔄 Loading state:', loadingState);
    
    // Simulate contract interaction
    const provider = new ethers.JsonRpcProvider(NEXT_PUBLIC_RPC_URL);
    const abiPath = path.join(__dirname, '../src/contracts/abi/SupplyChainTracker.json');
    const SupplyChainTrackerABI = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
    
    // Use admin wallet (simulating connected wallet)
    const adminPrivateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    const wallet = new ethers.Wallet(adminPrivateKey, provider);
    
    const contract = new ethers.Contract(
      NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS,
      SupplyChainTrackerABI,
      wallet
    );
    
    // Get role info
    const fabricanteRole = await contract.FABRICANTE_ROLE();
    const targetAddress = '0x0000000000000000000000000000000000000003';
    
    console.log('\n📋 Role info:');
    console.log('   Role hash:', fabricanteRole);
    console.log('   Target address:', targetAddress);
    
    // Check if already has role
    const hasRole = await contract.hasRole(fabricanteRole, targetAddress);
    console.log('   Already has role:', hasRole);
    
    if (hasRole) {
      console.log('⚠️  User already has this role!');
      loadingState = 'error';
      console.log('❌ Loading state:', loadingState);
      return;
    }
    
    // Estimate gas
    console.log('\n⛽ Estimating gas...');
    const gasEstimate = await contract.grantRole.estimateGas(fabricanteRole, targetAddress);
    console.log('   Gas estimate:', gasEstimate.toString());
    
    // Send transaction
    console.log('\n📤 Sending transaction...');
    const tx = await contract.grantRole(fabricanteRole, targetAddress);
    console.log('   Transaction hash:', tx.hash);
    
    // Wait for confirmation (this is where frontend gets stuck)
    console.log('\n⏳ Waiting for confirmation...');
    
    // Simulate proper frontend handling with timeout
    const receipt = await Promise.race([
      tx.wait(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Transaction timeout')), 30000)
      )
    ]);
    
    console.log('✅ Transaction confirmed!');
    console.log('   Block number:', receipt.blockNumber);
    console.log('   Gas used:', receipt.gasUsed.toString());
    
    // Update loading state
    loadingState = 'success';
    console.log('🎉 Loading state:', loadingState);
    
    // Verify role was granted
    const hasRoleAfter = await contract.hasRole(fabricanteRole, targetAddress);
    console.log('\n🔍 Verification:');
    console.log('   Role granted:', hasRoleAfter);
    
    // Simulate UI update delay
    console.log('\n🕒 Simulating UI update delay...');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Reset to idle state (simulating completion)
    loadingState = 'idle';
    console.log('🔄 Final loading state:', loadingState);
    
    console.log('\n✅ FRONTEND ROLE APPROVAL TEST COMPLETED SUCCESSFULLY!');
    console.log('   The frontend should now properly handle role approvals.');
    
  } catch (error) {
    console.error('❌ Error in frontend role approval test:', error);
    
    // Handle specific errors
    if (error.message && error.message.includes('timeout')) {
      console.log('⏰ Transaction timed out - frontend should show timeout error');
    } else if (error.message && error.message.includes('user rejected')) {
      console.log('❌ User rejected transaction - frontend should show rejection message');
    } else {
      console.log('💥 Unexpected error - frontend should show generic error message');
    }
    
    // Update loading state to error
    console.log('❌ Loading state: error');
  }
}

frontendRoleTest();