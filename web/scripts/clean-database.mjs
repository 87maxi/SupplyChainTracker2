import { MongoClient } from 'mongodb';

async function cleanDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('supplychain-tracker');
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    // Drop all collections
    for (const collection of collections) {
      await db.collection(collection.name).drop();
      console.log(`Dropped collection: ${collection.name}`);
    }
    
    console.log('Database cleaned successfully');
  } catch (error) {
    console.error('Error cleaning database:', error);
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

cleanDatabase();