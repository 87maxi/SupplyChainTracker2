import { config, validateConfig } from './config';

export function verifyWagmiConfig() {
  console.log('=== Wagmi Config Verification ===');
  
  try {
    // Validar configuración básica
    const isValid = validateConfig();
    
    if (!isValid) {
      console.error('Wagmi configuration validation failed');
      return false;
    }

    console.log('Config validation successful');
    
  } catch (error) {
    console.error('Error verifying wagmi config:', error);
    return false;
  }

  console.log('=== End Verification ===');
  return true;
}