import { ethers } from 'ethers';
import SupplyChainTrackerABI from '../src/contracts/abi/SupplyChainTracker.json';
import { NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS, NEXT_PUBLIC_RPC_URL } from '../src/lib/env';

async function comprehensiveContractCheck() {
  console.log('=== Comprehensive Contract Check ===');
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
    console.log('✅ Contract code found (length:', code.length, 'characters)');
    
    // Create contract instance
    const contract = new ethers.Contract(
      NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS,
      SupplyChainTrackerABI,
      provider
    );
    
    // Test the specific function that was mentioned in the error (0x313ce567 = name())
    console.log('\n🔍 Testing for ERC-20 name() function (0x313ce567)...');
    try {
      // This should fail since our contract doesn't have a name() function
      // But let's see what happens
      const tx = {
        to: NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS,
        data: '0x313ce567'
      };
      
      const result = await provider.call(tx);
      console.log('✅ name() function call result:', result);
    } catch (error: any) {
      console.log('❌ name() function call failed (this is expected for our contract):');
      console.log('  Error message:', error.message);
      if (error.reason) {
        console.log('  Error reason:', error.reason);
      }
    }
    
    // Test all role constant functions
    console.log('\n🔍 Testing role constant functions...');
    
    const roles = [
      { name: 'DEFAULT_ADMIN_ROLE', getter: () => contract.DEFAULT_ADMIN_ROLE() },
      { name: 'FABRICANTE_ROLE', getter: () => contract.FABRICANTE_ROLE() },
      { name: 'AUDITOR_HW_ROLE', getter: () => contract.AUDITOR_HW_ROLE() },
      { name: 'TECNICO_SW_ROLE', getter: () => contract.TECNICO_SW_ROLE() },
      { name: 'ESCUELA_ROLE', getter: () => contract.ESCUELA_ROLE() }
    ];
    
    for (const role of roles) {
      try {
        const result = await role.getter();
        console.log(`✅ ${role.name}:`, result);
      } catch (error: any) {
        console.log(`❌ ${role.name} failed:`);
        console.log('  Error message:', error.message);
        if (error.reason) {
          console.log('  Error reason:', error.reason);
        }
      }
    }
    
    // Test hasRole function
    console.log('\n🔍 Testing hasRole function...');
    try {
      const adminRole = await contract.DEFAULT_ADMIN_ROLE();
      // Test with zero address (should return false)
      const hasRoleResult = await contract.hasRole(adminRole, ethers.ZeroAddress);
      console.log('✅ hasRole with zero address:', hasRoleResult);
    } catch (error: any) {
      console.log('❌ hasRole failed:');
      console.log('  Error message:', error.message);
      if (error.reason) {
        console.log('  Error reason:', error.reason);
      }
    }
    
    // Test getRoleMemberCount
    console.log('\n🔍 Testing getRoleMemberCount function...');
    try {
      const adminRole = await contract.DEFAULT_ADMIN_ROLE();
      const memberCount = await contract.getRoleMemberCount(adminRole);
      console.log('✅ getRoleMemberCount for admin role:', memberCount.toString());
    } catch (error: any) {
      console.log('❌ getRoleMemberCount failed:');
      console.log('  Error message:', error.message);
      if (error.reason) {
        console.log('  Error reason:', error.reason);
      }
    }
    
    // Test getAllSerialNumbers
    console.log('\n🔍 Testing getAllSerialNumbers function...');
    try {
      const serialNumbers = await contract.getAllSerialNumbers();
      console.log('✅ getAllSerialNumbers succeeded, count:', serialNumbers.length);
    } catch (error: any) {
      console.log('❌ getAllSerialNumbers failed:');
      console.log('  Error message:', error.message);
      if (error.reason) {
        console.log('  Error reason:', error.reason);
      }
    }
    
    console.log('\n✅ Comprehensive contract check completed');
    
  } catch (error) {
    console.error('❌ Error during comprehensive check:', error);
  }
}

comprehensiveContractCheck();