import { ethers } from 'ethers';
import SupplyChainTrackerABI from '../src/contracts/abi/SupplyChainTracker.json';
import { NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS, NEXT_PUBLIC_RPC_URL } from '../src/lib/env';

async function debugRoleMemberCount() {
  console.log('Debugging getRoleMemberCount calls...');
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
    
    // Get all role hashes
    console.log('Getting role hashes...');
    const roleHashes = {
      DEFAULT_ADMIN_ROLE: await contract.DEFAULT_ADMIN_ROLE(),
      FABRICANTE_ROLE: await contract.FABRICANTE_ROLE(),
      AUDITOR_HW_ROLE: await contract.AUDITOR_HW_ROLE(),
      TECNICO_SW_ROLE: await contract.TECNICO_SW_ROLE(),
      ESCUELA_ROLE: await contract.ESCUELA_ROLE()
    };
    
    console.log('Role hashes:');
    Object.entries(roleHashes).forEach(([name, hash]) => {
      console.log(`  ${name}: ${hash}`);
    });
    
    // Test getRoleMemberCount for each role
    console.log('\nTesting getRoleMemberCount for each role...');
    for (const [roleName, roleHash] of Object.entries(roleHashes)) {
      try {
        console.log(`\nTesting ${roleName} (${roleHash})...`);
        const count = await contract.getRoleMemberCount(roleHash);
        console.log(`✅ ${roleName} member count:`, count.toString());
        
        // If count > 0, try to get the first member
        if (count > 0) {
          try {
            const firstMember = await contract.getRoleMember(roleHash, 0);
            console.log(`✅ First member of ${roleName}:`, firstMember);
          } catch (memberError) {
            console.log(`❌ Error getting first member of ${roleName}:`, memberError);
          }
        }
      } catch (error: any) {
        console.log(`❌ ${roleName} getRoleMemberCount failed:`);
        console.log('  Error message:', error.message);
        if (error.reason) {
          console.log('  Error reason:', error.reason);
        }
        
        // Check if this is the specific error we're looking for
        if (error.message && error.message.includes('execution reverted')) {
          console.log('  💡 This is the execution reverted error!');
          console.log('  This could be caused by:');
          console.log('    1. Role does not exist or is not properly initialized');
          console.log('    2. Access control restrictions');
          console.log('    3. Contract state issues');
        }
      }
    }
    
    // Test getAllMembers as well
    console.log('\nTesting getAllMembers for each role...');
    for (const [roleName, roleHash] of Object.entries(roleHashes)) {
      try {
        console.log(`\nTesting getAllMembers for ${roleName}...`);
        const members = await contract.getAllMembers(roleHash);
        console.log(`✅ ${roleName} members count:`, members.length);
        if (members.length > 0) {
          console.log(`  First member:`, members[0]);
        }
      } catch (error: any) {
        console.log(`❌ ${roleName} getAllMembers failed:`);
        console.log('  Error message:', error.message);
        if (error.reason) {
          console.log('  Error reason:', error.reason);
        }
      }
    }
    
    console.log('\n✅ Role member count debug completed');
    
  } catch (error) {
    console.error('❌ Error during debug:', error);
  }
}

debugRoleMemberCount();