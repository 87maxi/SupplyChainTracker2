// Environment variables - SERVER SIDE ONLY
// These variables are only available on the server and will be undefined on the client

// MongoDB Configuration
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
export const MONGODB_DATABASE = process.env.MONGODB_DATABASE || 'supplychain';

// Smart Contract Address
export const NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS = process.env.NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS;