import { ethers } from 'ethers';
import SupplyChainTrackerABI from '../src/contracts/abi/SupplyChainTracker.json';
import { NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS, NEXT_PUBLIC_RPC_URL } from '../src/lib/env';

async function debugRevertError() {
  console.log('Debugging execution reverted error...');
  console.log('Contract Address:', NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS);
  console.log('RPC URL:', NEXT_PUBLIC_RPC_URL);

  try {
    // Create provider
    const provider = new ethers.JsonRpcProvider(NEXT_PUBLIC_RPC_URL);
    
    // Create a wallet with a private key for testing (this is a test key, not real funds)
    const wallet = new ethers.Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', provider);
    
    // Check network connection
    const network = await provider.getNetwork();
    console.log('Connected to network:', network.name, network.chainId);
    
    // Check if contract exists
    const code = await provider.getCode(NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS);
    if (code === '0x') {
      console.log('❌ ERROR: No contract code found at address');
      return;
    }
    console.log('✅ Contract code found');
    
    // Create contract instance with wallet
    const contract = new ethers.Contract(
      NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS,
      SupplyChainTrackerABI,
      wallet
    );
    
    // Try to call each view function with detailed error handling
    console.log('\\nTesting view functions with detailed error handling...');
    
    const testFunction = async (name: string, fn: () => Promise<any>) => {
      try {
        console.log(`Testing ${name}...`);
        const result = await fn();
        console.log(`✅ ${name} succeeded:`, result);
      } catch (error: any) {
        console.log(`❌ ${name} failed:`);
        console.log('  Error message:', error.message);
        console.log('  Error code:', error.code);
        if (error.reason) {
          console.log('  Error reason:', error.reason);
        }
        if (error.data) {
          console.log('  Error data:', error.data);
        }
      }
    };
    
    // Test all role functions
    await testFunction('DEFAULT_ADMIN_ROLE', () => contract.DEFAULT_ADMIN_ROLE());
    await testFunction('FABRICANTE_ROLE', () => contract.FABRICANTE_ROLE());
    await testFunction('AUDITOR_HW_ROLE', () => contract.AUDITOR_HW_ROLE());
    await testFunction('TECNICO_SW_ROLE', () => contract.TECNICO_SW_ROLE());
    await testFunction('ESCUELA_ROLE', () => contract.ESCUELA_ROLE());
    
    // Test other view functions
    await testFunction('getAllSerialNumbers', () => contract.getAllSerialNumbers());
    
    // Test hasRole with a dummy address
    await testFunction('hasRole (dummy)', () => 
      contract.hasRole('0x0000000000000000000000000000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000')
    );
    
    console.log('\\n✅ Debug completed');
    
  } catch (error) {
    console.error('❌ Error during debug:', error);
  }
}

debugRevertError();