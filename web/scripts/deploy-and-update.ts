import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function deployAndUupdateEnv() {
  console.log('Deploying contract and updating environment...');
  
  try {
    // Deploy contract
    console.log('Deploying contract...');
    const deployOutput = execSync(
      'cd sc && forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast',
      { encoding: 'utf8' }
    );
    
    console.log('Deployment output:', deployOutput);
    
    // Extract contract address from output
    const addressMatch = deployOutput.match(/contract SupplyChainTracker (0x[a-fA-F0-9]{40})/);
    
    if (!addressMatch) {
      console.error('Could not extract contract address from deployment output');
      return;
    }
    
    const contractAddress = addressMatch[1];
    console.log('Extracted contract address:', contractAddress);
    
    // Update env.ts file
    const envPath = path.join(__dirname, '../src/lib/env.ts');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Replace the contract address
    envContent = envContent.replace(
      /NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS = process\.env\.NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS \|\| '[^']*'/,
      `NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS = process.env.NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS || '${contractAddress}'`
    );
    
    fs.writeFileSync(envPath, envContent);
    console.log('Updated env.ts with new contract address');
    
    console.log('✅ Deployment and environment update completed successfully!');
    console.log('New contract address:', contractAddress);
    
  } catch (error) {
    console.error('Error during deployment and update:', error);
  }
}

deployAndUupdateEnv();
