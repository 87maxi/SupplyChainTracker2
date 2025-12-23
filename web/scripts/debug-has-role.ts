import { ethers } from 'ethers';
import SupplyChainTrackerABI from '../src/contracts/abi/SupplyChainTracker.json';
import { NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS, NEXT_PUBLIC_RPC_URL } from '../src/lib/env';

async function debugHasRole() {
  console.log('Debugging hasRole calls...');
  console.log('Contract Address:', NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS);
  console.log('RPC URL:', NEXT_PUBLIC_RPC_URL);

  try {
    // Create provider
    const provider = new ethers.JsonRpcProvider(NEXT_PUBLIC_RPC_URL);
    
    // Check network connection
    const network = await provider.getNetwork();
    console.log('Connected to network:', network.name, network.chainId);
    
    // Create contract instance
    const contract = new ethers.Contract(
      NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS,
      SupplyChainTrackerABI,
      provider
    );
    
    // Get role hashes
    console.log('Getting role hashes...');
    const adminRole = await contract.DEFAULT_ADMIN_ROLE();
    const fabricanteRole = await contract.FABRICANTE_ROLE();
    const auditorHwRole = await contract.AUDITOR_HW_ROLE();
    const tecnicoSwRole = await contract.TECNICO_SW_ROLE();
    const escuelaRole = await contract.ESCUELA_ROLE();
    
    console.log('Role hashes:');
    console.log('  DEFAULT_ADMIN_ROLE:', adminRole);
    console.log('  FABRICANTE_ROLE:', fabricanteRole);
    console.log('  AUDITOR_HW_ROLE:', auditorHwRole);
    console.log('  TECNICO_SW_ROLE:', tecnicoSwRole);
    console.log('  ESCUELA_ROLE:', escuelaRole);
    
    // Test hasRole with various addresses
    console.log('\nTesting hasRole with different addresses...');
    
    // Test with zero address (should be false for all roles except maybe admin if it\'s the deployer)
    const testAddresses = [
      ethers.ZeroAddress,
      '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // Default admin address
      NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS, // Contract address itself
      '0x0000000000000000000000000000000000000001' // Another dummy address
    ];
    
    const rolesToTest = [
      { name: 'DEFAULT_ADMIN_ROLE', hash: adminRole },
      { name: 'FABRICANTE_ROLE', hash: fabricanteRole },
      { name: 'AUDITOR_HW_ROLE', hash: auditorHwRole },
      { name: 'TECNICO_SW_ROLE', hash: tecnicoSwRole },
      { name: 'ESCUELA_ROLE', hash: escuelaRole }
    ];
    
    for (const address of testAddresses) {
      console.log(`\nTesting address: ${address}`);
      
      for (const role of rolesToTest) {
        try {
          const hasRole = await contract.hasRole(role.hash, address);
          console.log(`  ${role.name}: ${hasRole}`);
        } catch (error: any) {
          console.log(`  ❌ ${role.name} failed:`);
          console.log(`    Error: ${error.message}`);
          
          // Check for execution reverted error
          if (error.message && error.message.includes('execution reverted')) {
            console.log(`    💡 Execution reverted error detected!`);
            console.log(`    This could indicate:`);
            console.log(`      1. Invalid role hash`);
            console.log(`      2. Contract state issue`);
            console.log(`      3. Access control problem`);
          }
        }
      }
    }
    
    console.log('\n✅ hasRole debug completed');
    
  } catch (error) {
    console.error('❌ Error during debug:', error);
  }
}

debugHasRole();