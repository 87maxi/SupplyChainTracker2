// web/src/lib/mongodb/init-indexes.ts
// Script to initialize MongoDB indexes using native driver

import { initializeIndexes } from './native-client';

/**
 * Initialize MongoDB indexes for optimal query performance
 */
export async function initializeMongoDBIndexes(): Promise<void> {
  try {
    console.log('🔄 Initializing MongoDB indexes...');
    
    await initializeIndexes();
    
    console.log('🎉 MongoDB indexes initialized successfully');
    
  } catch (error) {
    console.error('❌ Error initializing MongoDB indexes:', error);
    throw error;
  }
}

// Run initialization if this script is executed directly
if (require.main === module) {
  initializeMongoDBIndexes()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Failed to initialize indexes:', error);
      process.exit(1);
    });
}