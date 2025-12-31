import { MongoClient, Db } from 'mongodb';

// Get MongoDB URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017';
const DATABASE_NAME = process.env.DATABASE_NAME || 'supplychain-tracker';

// Cache the connection in development
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  // Use the cached connection in development
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // Create a new connection
  const client = new MongoClient(MONGODB_URI);
  await client.connect();

  const db = client.db(DATABASE_NAME);

  // Cache the connection in development
  if (process.env.NODE_ENV === 'development') {
    cachedClient = client;
    cachedDb = db;
  }

  return { client, db };
}