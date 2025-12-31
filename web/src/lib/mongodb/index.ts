// web/src/lib/mongodb/index.ts
// MongoDB service exports

export * from './native-client';
export * from './config';

// Import the actual service implementation
import { MongoDBService } from './mongodb.service';

export const mongodbService = new MongoDBService();
export { MongoDBService };