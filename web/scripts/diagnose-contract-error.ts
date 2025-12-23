import { ethers } from 'ethers';
import SupplyChainTrackerABI from '../src/contracts/abi/SupplyChainTracker.json';
import { NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS, NEXT_PUBLIC_RPC_URL } from '../src/lib/env';

async function diagnoseContractError() {
  console.log('Diagnosing contract error...');
  console.log('Contract Address:', NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS);
  console.log('RPC URL:', NEXT_PUBLIC_RPC_URL);

  try {
    // Create provider
    const provider = new ethers.JsonRpcProvider(NEXT_PUBLIC_RPC_URL);
    
    // Check network connection
    const network = await provider.getNetwork();
    console.log('Connected to network:', network.name, network.chainId);
    
    // Check if contract exists at address
    const code = await provider.getCode(NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS);
    if (code === '0x') {
      console.log('❌ ERROR: No contract code found at address');
      console.log('Possible causes:');
      console.log('1. Contract not deployed');
      console.log('2. Incorrect contract address');
      console.log('3. Wrong network');
      return;
    }
    console.log('✅ Contract code found');
    
    // Create contract instance
    const contract = new ethers.Contract(
      NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS,
      SupplyChainTrackerABI,
      provider
    );
    
    // Test each role constant function
    console.log('\nTesting role constant functions...');
    
    try {
      const defaultAdminRole = await contract.DEFAULT_ADMIN_ROLE();
      console.log('✅ DEFAULT_ADMIN_ROLE:', defaultAdminRole);
    } catch (error) {
      console.log('❌ Error calling DEFAULT_ADMIN_ROLE:', error);
    }
    
    try {
      const fabricanteRole = await contract.FABRICANTE_ROLE();
      console.log('✅ FABRICANTE_ROLE:', fabricanteRole);
    } catch (error) {
      console.log('❌ Error calling FABRICANTE_ROLE:', error);
    }
    
    try {
      const auditorHwRole = await contract.AUDITOR_HW_ROLE();
      console.log('✅ AUDITOR_HW_ROLE:', auditorHwRole);
    } catch (error) {
      console.log('❌ Error calling AUDITOR_HW_ROLE:', error);
    }
    
    try {
      const tecnicoSwRole = await contract.TECNICO_SW_ROLE();
      console.log('✅ TECNICO_SW_ROLE:', tecnicoSwRole);
    } catch (error) {
      console.log('❌ Error calling TECNICO_SW_ROLE:', error);
    }
    
    try {
      const escuelaRole = await contract.ESCUELA_ROLE();
      console.log('✅ ESCUELA_ROLE:', escuelaRole);
    } catch (error) {
      console.log('❌ Error calling ESCUELA_ROLE:', error);
    }
    
    // Test a simple function that should work
    console.log('\nTesting getAllSerialNumbers...');
    try {
      const serialNumbers = await contract.getAllSerialNumbers();
      console.log('✅ getAllSerialNumbers succeeded, count:', serialNumbers.length);
    } catch (error) {
      console.log('❌ Error calling getAllSerialNumbers:', error);
    }
    
    console.log('\n✅ Diagnosis completed');
    
  } catch (error) {
    console.error('❌ Error during diagnosis:', error);
  }
}

diagnoseContractError();