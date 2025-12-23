import { ethers } from 'ethers';
import SupplyChainTrackerABI from '../src/contracts/abi/SupplyChainTracker.json';
import { NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS, NEXT_PUBLIC_RPC_URL } from '../src/lib/env';

async function traceContractCalls() {
  console.log('Tracing contract calls...');
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
    
    // Trace common calls that might be failing
    console.log('\n🔍 Tracing common contract calls...');
    
    // 1. Check if contract has the expected functions
    console.log('1. Checking contract interface...');
    const contractFunctions = Object.keys(contract);
    console.log('Available functions:', contractFunctions.filter(f => !f.startsWith('_')).slice(0, 10));
    
    // 2. Test role functions specifically
    console.log('\n2. Testing role functions...');
    try {
      const adminRole = await contract.DEFAULT_ADMIN_ROLE();
      console.log('✅ DEFAULT_ADMIN_ROLE:', adminRole);
      
      // Test hasRole with admin role
      const isAdmin = await contract.hasRole(adminRole, '0x0000000000000000000000000000000000000000');
      console.log('✅ hasRole result for zero address:', isAdmin);
    } catch (error) {
      console.log('❌ Role function test failed:', error);
    }
    
    // 3. Test getRoleMemberCount
    console.log('\n3. Testing getRoleMemberCount...');
    try {
      const adminRole = await contract.DEFAULT_ADMIN_ROLE();
      const count = await contract.getRoleMemberCount(adminRole);
      console.log('✅ getRoleMemberCount result:', count.toString());
    } catch (error) {
      console.log('❌ getRoleMemberCount failed:', error);
    }
    
    // 4. Test getAllMembers
    console.log('\n4. Testing getAllMembers...');
    try {
      const adminRole = await contract.DEFAULT_ADMIN_ROLE();
      const members = await contract.getAllMembers(adminRole);
      console.log('✅ getAllMembers result count:', members.length);
    } catch (error) {
      console.log('❌ getAllMembers failed:', error);
    }
    
    // 5. Check if there are any events in the contract
    console.log('\n5. Checking contract events...');
    try {
      // Use the correct way to get events in ethers v6
      const eventFragments = contract.interface.fragments.filter(f => f.type === 'event');
      console.log('Contract events count:', eventFragments.length);
      if (eventFragments.length > 0) {
        // Cast to EventFragment to access name property
        const eventNames = eventFragments.map(e => (e as ethers.EventFragment).name);
        console.log('Event names:', eventNames);
      }
    } catch (error) {
      console.log('❌ Error checking events:', error);
    }
    
    console.log('\n✅ Contract call tracing completed');
    
  } catch (error) {
    console.error('❌ Error during contract call tracing:', error);
  }
}

traceContractCalls();