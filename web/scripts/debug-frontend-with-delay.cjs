const ethers = require('ethers');
const fs = require('fs');
const path = require('path');

async function debugFrontendWithDelay() {
  console.log('=== DEBUG FRONTEND WITH DELAY ===');
  
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
    let requests = JSON.parse(requestsData);
    
    console.log('\n🔍 Found', requests.length, 'requests');
    
    // Find a pending request
    let pendingRequests = requests.filter(req => req.status === 'pending');
    
    if (pendingRequests.length === 0) {
      console.log('❌ No pending requests found');
      
      // Add a new test request
      const newRequest = {
        id: 'delay-test' + Date.now(),
        address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
        role: 'fabricante',
        status: 'pending',
        timestamp: Date.now()
      };
      
      requests.push(newRequest);
      fs.writeFileSync(requestsPath, JSON.stringify(requests, null, 2));
      console.log('✅ Added new test request:', newRequest.id);
      
      // Re-read requests
      const requestsData2 = fs.readFileSync(requestsPath, 'utf8');
      requests = JSON.parse(requestsData2);
      
      pendingRequests = requests.filter(req => req.status === 'pending');
      if (pendingRequests.length === 0) {
        console.log('❌ Still no pending requests found');
        return;
      }
    }
    
    console.log('\n🔍 Found', pendingRequests.length, 'pending requests');
    
    // Process the first pending request
    const pendingRequest = pendingRequests[0];
    console.log('\n🔍 Processing pending request:');
    console.log('  ID:', pendingRequest.id);
    console.log('  Address:', pendingRequest.address);
    console.log('  Role:', pendingRequest.role);
    
    // Map role name to role hash (same as frontend)
    let roleHash;
    switch (pendingRequest.role) {
      case 'admin':
        roleHash = '0x0000000000000000000000000000000000000000000000000000000000000000';
        break;
      case 'fabricante':
        roleHash = '0xbe0c84bfff967b2deb88bd0540d4a796d0ebfdcb72262ced26f1892b419e6457';
        break;
      case 'auditor_hw':
        roleHash = '0x49c0376dc7caa3eab0c186e9bc20bf968b0724fea74a37706c35f59bc5d8b15b';
        break;
      case 'tecnico_sw':
        roleHash = '0xeeb4ddf6a0e2f06cb86713282a0b88ee789709e92a08b9e9b4ce816bbb13fcaf';
        break;
      case 'escuela':
        roleHash = '0xa8f5858ea94a9ede7bc5dd04119dcc24b3b02a20be15d673993d8b6c2a901ef9';
        break;
      default:
        console.log('❌ Invalid role:', pendingRequest.role);
        return;
    }
    
    console.log('  Role Hash:', roleHash);
    
    // Check if admin has admin role
    console.log('\n🔍 Checking admin permissions...');
    const adminRole = '0x0000000000000000000000000000000000000000000000000000000000000000';
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
      
      // Update request status to approved
      const index = requests.findIndex(req => req.id === pendingRequest.id);
      if (index !== -1) {
        requests[index].status = 'approved';
        fs.writeFileSync(requestsPath, JSON.stringify(requests, null, 2));
        console.log('✅ Request status updated to approved');
      }
      
      return;
    }
    
    // Simulate the exact approval process that happens in the frontend
    console.log('\n🔍 Simulating frontend approval process...');
    
    // Create wallet with private key (first Anvil account - admin)
    const privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    const wallet = new ethers.Wallet(privateKey, provider);
    
    // Create contract instance with wallet (same as frontend)
    const contractWithSigner = contract.connect(wallet);
    
    // Estimate gas (same as frontend)
    try {
      console.log('  Estimating gas...');
      const gasEstimate = await contractWithSigner.grantRole.estimateGas(roleHash, pendingRequest.address);
      console.log('  Gas estimate:', gasEstimate.toString());
    } catch (error) {
      console.log('  Gas estimation failed:', error.message);
      console.log('  Proceeding with transaction anyway...');
    }
    
    // Send transaction (same as frontend)
    console.log('  Sending transaction...');
    const tx = await contractWithSigner.grantRole(roleHash, pendingRequest.address);
    console.log('  Transaction hash:', tx.hash);
    
    // Wait for confirmation (same as frontend)
    console.log('  Waiting for confirmation...');
    const receipt = await tx.wait();
    console.log('  Transaction confirmed in block:', receipt.blockNumber);
    console.log('  Gas used:', receipt.gasUsed.toString());
    console.log('  Status:', receipt.status);
    
    // Verify role was granted
    const hasRoleAfter = await contract.hasRole(roleHash, pendingRequest.address);
    console.log('  Target address now has role:', hasRoleAfter);
    
    if (hasRoleAfter) {
      console.log('✅ SUCCESS: Role granted successfully!');
      
      // Update request status to approved (same as frontend)
      const index = requests.findIndex(req => req.id === pendingRequest.id);
      if (index !== -1) {
        requests[index].status = 'approved';
        fs.writeFileSync(requestsPath, JSON.stringify(requests, null, 2));
        console.log('✅ Request status updated to approved');
      }
    } else {
      console.log('❌ ERROR: Role was not granted');
    }
    
    console.log('\n✅ Debug completed');
    
  } catch (error) {
    console.error('❌ Error during debug:', error);
    
    // Log detailed error information
    if (error.body) {
      console.log('  Error body:', error.body);
    }
    if (error.code) {
      console.log('  Error code:', error.code);
    }
    if (error.reason) {
      console.log('  Error reason:', error.reason);
    }
    if (error.message) {
      console.log('  Error message:', error.message);
    }
    if (error.stack) {
      console.log('  Error stack:', error.stack);
    }
  }
}

debugFrontendWithDelay();