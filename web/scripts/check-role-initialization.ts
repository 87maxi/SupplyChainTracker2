import { ethers } from 'ethers';
import SupplyChainTrackerABI from '../src/contracts/abi/SupplyChainTracker.json';
import { NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS, NEXT_PUBLIC_RPC_URL } from '../src/lib/env';

async function checkRoleInitialization() {
  console.log('Checking role initialization...');
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
    console.log('\\nGetting role hashes...');
    const defaultAdminRole = await contract.DEFAULT_ADMIN_ROLE();
    const fabricanteRole = await contract.FABRICANTE_ROLE();
    const auditorHwRole = await contract.AUDITOR_HW_ROLE();
    const tecnicoSwRole = await contract.TECNICO_SW_ROLE();
    const escuelaRole = await contract.ESCUELA_ROLE();
    
    console.log('DEFAULT_ADMIN_ROLE:', defaultAdminRole);
    console.log('FABRICANTE_ROLE:', fabricanteRole);
    console.log('AUDITOR_HW_ROLE:', auditorHwRole);
    console.log('TECNICO_SW_ROLE:', tecnicoSwRole);
    console.log('ESCUELA_ROLE:', escuelaRole);
    
    // Check if admin role has members
    console.log('\\nChecking role members...');
    try {
      const adminMembers = await contract.getRoleMemberCount(defaultAdminRole);
      console.log('Admin role member count:', adminMembers.toString());
      
      if (adminMembers > 0) {
        const firstAdmin = await contract.getRoleMember(defaultAdminRole, 0);
        console.log('First admin address:', firstAdmin);
      }
    } catch (error) {
      console.log('Error checking admin role members:', error);
    }
    
    // Check other roles
    const roles = [
      { name: 'FABRICANTE', hash: fabricanteRole },
      { name: 'AUDITOR_HW', hash: auditorHwRole },
      { name: 'TECNICO_SW', hash: tecnicoSwRole },
      { name: 'ESCUELA', hash: escuelaRole }
    ];
    
    for (const role of roles) {
      try {
        const memberCount = await contract.getRoleMemberCount(role.hash);
        console.log(`${role.name} role member count:`, memberCount.toString());
      } catch (error) {
        console.log(`Error checking ${role.name} role members:`, error);
      }
    }
    
    console.log('\\n✅ Role initialization check completed');
    
  } catch (error) {
    console.error('❌ Error during role initialization check:', error);
  }
}

checkRoleInitialization();