const ethers = require('ethers');
const fs = require('fs');
const path = require('path');

async function testFrontendGrantRole() {
  console.log('=== TEST FRONTEND GRANT ROLE BEHAVIOR ===');
  
  // Hardcoded values since we can't import from env.ts
  const NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
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
    
    // Create wallet with private key (first Anvil account)
    const privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    const wallet = new ethers.Wallet(privateKey, provider);
    const walletAddress = await wallet.getAddress();

    console.log('\n🔍 Wallet info:');
    console.log('  Address:', walletAddress);

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
    const hasAdminRole = await contract.hasRole(adminRole, walletAddress);
    console.log('  Has DEFAULT_ADMIN_ROLE:', hasAdminRole);
    
    if (!hasAdminRole) {
      console.log('❌ ERROR: Wallet does not have admin role');
      return;
    }

    // Test grantRole function with a test address
    console.log('\n🔍 Testing grantRole function...');
    const testAddress = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'; // Second Anvil account
    
    // Check if test address already has role
    const alreadyHasRole = await contract.hasRole(fabricanteRole, testAddress);
    console.log('  Test address already has FABRICANTE_ROLE:', alreadyHasRole);

    if (!alreadyHasRole) {
      console.log('  Granting FABRICANTE_ROLE to test address...');

      // Create contract instance with wallet
      const contractWithSigner = contract.connect(wallet);

      // Estimate gas
      try {
        const gasEstimate = await contractWithSigner.grantRole.estimateGas(fabricanteRole, testAddress);
    console.log('  Gas estimate:', gasEstimate.toString());
  } catch (error) {
        console.log('  Gas estimation failed:', error.message);
      }

      // Send transaction
      const tx = await contractWithSigner.grantRole(fabricanteRole, testAddress);
      console.log('  Transaction hash:', tx.hash);

      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('  Transaction confirmed in block:', receipt.blockNumber);

      // Verify role was granted
      const hasRoleAfter = await contract.hasRole(fabricanteRole, testAddress);
      console.log('  Test address now has FABRICANTE_ROLE:', hasRoleAfter);

      if (hasRoleAfter) {
        console.log('✅ SUCCESS: Role granted successfully!');
      } else {
        console.log('❌ ERROR: Role was not granted');
      }
    } else {
      console.log('✅ Test address already has the role');
    }

    console.log('\n✅ Test completed');

  } catch (error) {
    console.error('❌ Error during test:', error);
    }
    }
    
testFrontendGrantRole();