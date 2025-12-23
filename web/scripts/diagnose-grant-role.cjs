const ethers = require('ethers');
const fs = require('fs');
const path = require('path');

async function diagnoseGrantRole() {
  console.log('=== DIAGNOSE GRANT ROLE FUNCTION ===');
  
  // Hardcoded values
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
    const adminRole = await contract.DEFAULT_ADMIN_ROLE();
    
    console.log('  FABRICANTE_ROLE:', fabricanteRole);
    console.log('  DEFAULT_ADMIN_ROLE:', adminRole);
    
    // Check admin permissions
    console.log('\n🔍 Checking admin permissions...');
    const adminAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'; // Default Anvil account
    const hasAdminRole = await contract.hasRole(adminRole, adminAddress);
    console.log('  Admin address:', adminAddress);
    console.log('  Has DEFAULT_ADMIN_ROLE:', hasAdminRole);
    
    // Check if target address already has role
    console.log('\n🔍 Checking if target already has role...');
    const targetAddress = '0x0000000000000000000000000000000000000001';
    const hasFabricanteRole = await contract.hasRole(fabricanteRole, targetAddress);
    console.log('  Target address:', targetAddress);
    console.log('  Already has FABRICANTE_ROLE:', hasFabricanteRole);
    
    // Try to get role member count
    console.log('\n🔍 Getting role member count...');
    try {
      const memberCount = await contract.getRoleMemberCount(fabricanteRole);
      console.log('  FABRICANTE_ROLE member count:', memberCount.toString());
      
      // Get all members
      const members = await contract.getAllMembers(fabricanteRole);
      console.log('  FABRICANTE_ROLE members:', members);
    } catch (error) {
      console.log('  ❌ Error getting role member count:', error);
    }
    
    // Try to grant role with a signer
    console.log('\n🔍 Testing grantRole with signer...');
    try {
      // Create a wallet with a dummy private key (we won't actually send the transaction)
      const wallet = new ethers.Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', provider);
      const contractWithSigner = contract.connect(wallet);
      
      // Check if the wallet has admin role
      const walletHasAdminRole = await contract.hasRole(adminRole, wallet.address);
      console.log('  Wallet address:', wallet.address);
      console.log('  Wallet has DEFAULT_ADMIN_ROLE:', walletHasAdminRole);
      
      // Try to estimate gas for grantRole
      console.log('\n🔍 Estimating gas for grantRole with wallet...');
      try {
        const gasEstimate = await contractWithSigner.grantRole.estimateGas(fabricanteRole, targetAddress);
        console.log('  Gas estimate:', gasEstimate.toString());
        
        // Try to send the transaction (but don't actually send it)
        console.log('\n🔍 Creating transaction data...');
        const tx = await contractWithSigner.grantRole.populateTransaction(fabricanteRole, targetAddress);
        console.log('  Transaction data:', tx.data);
        console.log('  Transaction to:', tx.to);
      } catch (error) {
        console.log('  ❌ Gas estimation failed:', error.message);
        
        // Try to decode the error if possible
        if (error.data) {
          console.log('  Error data:', error.data);
          
          // Try to decode the error
          try {
            const decodedError = contract.interface.parseError(error.data);
            if (decodedError) {
              console.log('  Decoded error:', decodedError.name, decodedError.args);
            }
          } catch (decodeError) {
            console.log('  Could not decode error');
          }
        }
      }
    } catch (error) {
      console.log('  ❌ Error with wallet:', error);
    }
    
    console.log('\n✅ Diagnosis completed');
    
  } catch (error) {
    console.error('❌ Error during diagnosis:', error);
  }
}

diagnoseGrantRole();