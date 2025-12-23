const ethers = require('ethers');
const fs = require('fs');
const path = require('path');

async function testFrontendRoleApproval() {
  console.log('=== TEST FRONTEND ROLE APPROVAL ===');
  
  // Hardcoded values
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
    
    // Read pending requests
    const requestsPath = path.join(__dirname, '../role-requests.json');
    const requestsData = fs.readFileSync(requestsPath, 'utf8');
    const requests = JSON.parse(requestsData);
    
    console.log('\n🔍 Found', requests.length, 'requests');
    
    // Find a pending request
    const pendingRequests = requests.filter(req => req.status === 'pending');
    
    if (pendingRequests.length === 0) {
      console.log('❌ No pending requests found');
      return;
    }
    
    console.log('\n🔍 Found', pendingRequests.length, 'pending requests');
    
    // Process the first pending request
    const pendingRequest = pendingRequests[0];
    console.log('\n🔍 Processing pending request:');
    console.log('  ID:', pendingRequest.id);
    console.log('  Address:', pendingRequest.address);
    console.log('  Role:', pendingRequest.role);
    
    // Map role name to role hash
    let roleHash;
    switch (pendingRequest.role) {
      case 'admin':
        roleHash = await contract.DEFAULT_ADMIN_ROLE();
        break;
      case 'fabricante':
        roleHash = await contract.FABRICANTE_ROLE();
        break;
      case 'auditor_hw':
        roleHash = await contract.AUDITOR_HW_ROLE();
        break;
      case 'tecnico_sw':
        roleHash = await contract.TECNICO_SW_ROLE();
        break;
      case 'escuela':
        roleHash = await contract.ESCUELA_ROLE();
        break;
      default:
        console.log('❌ Invalid role:', pendingRequest.role);
        return;
    }
    
    console.log('  Role Hash:', roleHash);
    
    // Check if admin has admin role
    console.log('\n🔍 Checking admin permissions...');
    const adminRole = await contract.DEFAULT_ADMIN_ROLE();
    const adminAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
    const hasAdminRole = await contract.hasRole(adminRole, adminAddress);
    console.log('  Admin has DEFAULT_ADMIN_ROLE:', hasAdminRole);
    
    if (!hasAdminRole) {
      console.log('❌ ERROR: Admin does not have admin role');
      return;
    }
    
    // Check if target address already has the role
    const alreadyHasRole = await contract.hasRole(roleHash, pendingRequest.address);
    console.log('  Target address already has role:', alreadyHasRole);
    
    if (alreadyHasRole) {
      console.log('✅ Target address already has the role');
      return;
    }
    
    // Simulate the exact approval process that happens in the frontend
    console.log('\n🔍 Simulating exact frontend approval process...');
    
    // Create wallet with private key (first Anvil account - admin)
    const privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    const wallet = new ethers.Wallet(privateKey, provider);
    
    // Create contract instance with wallet (same as frontend)
    const contractWithSigner = contract.connect(wallet);
    
    // Estimate gas (same as frontend)
    try {
      const gasEstimate = await contractWithSigner.grantRole.estimateGas(roleHash, pendingRequest.address);
      console.log('  Gas estimate:', gasEstimate.toString());
    } catch (error) {
      console.log('  Gas estimation failed:', error.message);
    }
    
    // Send transaction (same as frontend)
    console.log('  Sending transaction...');
    const tx = await contractWithSigner.grantRole(roleHash, pendingRequest.address);
    console.log('  Transaction hash:', tx.hash);
    
    // Wait for confirmation (same as frontend)
    console.log('  Waiting for confirmation...');
    const receipt = await tx.wait();
    console.log('  Transaction confirmed in block:', receipt.blockNumber);
    
    // Verify role was granted
    const hasRoleAfter = await contract.hasRole(roleHash, pendingRequest.address);
    console.log('  Target address now has role:', hasRoleAfter);
    
    if (hasRoleAfter) {
      console.log('✅ SUCCESS: Role granted successfully!');
      
      // Update request status to approved (same as frontend)
      pendingRequest.status = 'approved';
      fs.writeFileSync(requestsPath, JSON.stringify(requests, null, 2));
      console.log('✅ Request status updated to approved');
    } else {
      console.log('❌ ERROR: Role was not granted');
    }
    
    console.log('\n✅ Test process completed');
    
  } catch (error) {
    console.error('❌ Error during test:', error);
  }
}

testFrontendRoleApproval();