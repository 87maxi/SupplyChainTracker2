// web/scripts/clean-database.js
// Script to clean MongoDB collections

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'supplychain-tracker';

async function cleanDatabase() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(MONGODB_DB);

    const collections = ['role_data', 'netbook_data'];
    
    for (const collectionName of collections) {
      const collection = db.collection(collectionName);
      const result = await collection.deleteMany({});
      console.log(`Cleaned ${collectionName}: ${result.deletedCount} documents deleted`);
    }

    console.log('Database cleaning completed!');
    await client.close();
  } catch (error) {
    console.error('Error cleaning database:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  cleanDatabase();
}

module.exports = { cleanDatabase };