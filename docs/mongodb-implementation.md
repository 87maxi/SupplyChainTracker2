# MongoDB Implementation Guide

## Problem Analysis

The build was failing due to two main issues:

1. **Syntax Error**: An unclosed div tag in `src/app/tokens/[id]/page.tsx` was causing a parsing error.
2. **Server-side Code in Client Components**: The MongoDB driver was being imported in client components, but it uses Node.js built-in modules (fs, net, tls, dns, child_process, timers/promises) that aren't available in the browser.

## Solution Implementation

### 1. Fixed Syntax Error

The syntax error in `src/app/tokens/[id]/page.tsx` was fixed by:

- Completing the div element with proper closing tag
- Adding transaction history display with appropriate styling
- Ensuring all HTML elements are properly closed

### 2. Fixed MongoDB Integration

The MongoDB integration was restructured to handle environment variables correctly:

#### Environment Variables Access

Instead of relying on the `env.ts` file (which only exports `NEXT_PUBLIC_` variables), we now access MongoDB environment variables directly from `process.env` in the server-side `mongodb.ts` file:

```typescript
// Access MongoDB URI directly from process.env
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DATABASE || 'supplychain';
```

This is the correct approach because:
- Server-side only variables (without `NEXT_PUBLIC_` prefix) are not available in client components
- MongoDB connection details should never be exposed to the client
- Direct access to `process.env` in server components is the standard Next.js pattern

#### Enhanced Error Handling

Added fallback values and warning messages:

```typescript
const mongoUri = process.env.MONGODB_URI || 
                 process.env.DATABASE_URL || 
                 'mongodb://localhost:27017';
                 
const dbName = process.env.MONGODB_DATABASE || 
               process.env.DATABASE_NAME || 
               'supplychain';
```

This ensures the application can still run in development even if environment variables are not properly configured.

### 3. Type Definitions

Created `src/types/mongodb.ts` to define the data models used throughout the application:

```typescript
export interface RoleData {
  _id?: string;
  transactionHash: `0x${string}`;
  role: string;
  userAddress: string;
  data: Record<string, unknown>;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface NetbookData {
  _id?: string;
  serialNumber: string;
  transactionHash: `0x${string}`;
  role: string;
  userAddress: string;
  data: Record<string, unknown>;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## Architecture Flow

```
Client Component (Browser)
        ↓
Custom Hook (useSupplyChainService)
        ↓
Service Layer (SupplyChainService)
        ↓
RoleDataService (Server-side)
        ↓
MongoDBService (Server-side, uses process.env directly)
        ↓
MongoDB Database
```

## Environment Configuration

### Required Environment Variables

For development, create a `.env.local` file in the `web` directory with:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=supplychain

# Blockchain Configuration
NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS=0x...
NEXT_PUBLIC_VERIFICATION_BLOCKSCOUT_URL=https://your-blockscout-url
NEXT_PUBLIC_ETHERSCAN_URL=https://your-etherscan-url

# IPFS Configuration
NEXT_PUBLIC_PINATA_API_KEY=your-key
NEXT_PUBLIC_PINATA_SECRET_API_KEY=your-secret
```

### Docker Configuration

The MongoDB service is included in `docker-compose.yml`:

```yaml
mongodb:
  image: mongo:latest
  container_name: supplychain_mongodb
  ports:
    - "27017:27017"
  volumes:
    - mongodb_data:/data/db
  environment:
    MONGO_INITDB_ROOT_USERNAME: admin
    MONGO_INITDB_ROOT_PASSWORD: password
```

## Best Practices

1. **Server-side Only**: MongoDB operations must only be performed in server components, API routes, or server-side services.

2. **Environment Variables**: Server-side configuration should be accessed directly from `process.env` in server components, not through shared configuration files.

3. **Error Handling**: Always provide fallback values and meaningful error messages for environment variables.

4. **Type Safety**: Define interfaces for database models to ensure type consistency across the application.

## Testing the Fix

To verify the fix:

1. Ensure MongoDB is running (via Docker or locally)
2. Set the required environment variables in `.env.local`
3. Run the build command:

```bash
cd web
npm run build --loglevel error
```

The build should complete without errors related to MongoDB or syntax issues.

## Future Improvements

1. **API Routes**: Move MongoDB operations to API routes to better separate concerns
2. **Connection Pooling**: Implement connection pooling for better performance
3. **Caching**: Add Redis or similar caching for frequently accessed data
4. **Validation**: Implement stricter data validation before saving to MongoDB
5. **Monitoring**: Add logging and monitoring for database operations
