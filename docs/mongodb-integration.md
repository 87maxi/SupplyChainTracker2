# MongoDB Integration Documentation

## Overview

This document describes the MongoDB integration implemented in the SupplyChainTracker dApp. The integration stores detailed role-specific data off-chain while maintaining transaction hashes on-chain for verification purposes.

## Architecture

### Data Flow
1. User performs an action (e.g., hardware audit)
2. Detailed data is stored in MongoDB with transaction hash reference
3. Hash of the data is stored on-chain for verification
4. Other users can retrieve and verify data integrity

### Data Models

#### RoleData Collection
```typescript
interface RoleData {
  _id?: string;
  transactionHash: `0x${string}`;
  role: string;
  userAddress: string;
  data: any;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

#### NetbookData Collection
```typescript
interface NetbookData {
  _id?: string;
  serialNumber: string;
  transactionHash: `0x${string}`;
  role: string;
  userAddress: string;
  data: any;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## Implementation Details

### Services

#### MongoDB Service (`/src/lib/mongodb.ts`)
- Handles database connection and operations
- Creates indexes for performance optimization
- Provides CRUD operations for role and netbook data

#### Role Data Service (`/src/services/RoleDataService.ts`)
- Wrapper service for MongoDB operations
- Provides typed interfaces for data operations
- Handles error management and logging

### Key Functions

#### Data Storage Functions
- `saveRoleData()` - Stores role-specific action data
- `saveNetbookData()` - Stores netbook-specific action data

#### Data Retrieval Functions
- `getRoleDataByTransactionHash()` - Retrieves data by transaction hash
- `getRoleDataByRole()` - Retrieves all data for a specific role
- `getRoleDataByUser()` - Retrieves all data created by a user
- `getNetbookDataBySerial()` - Retrieves all data for a netbook
- `getAllNetbookData()` - Retrieves all data across all roles for a netbook

## Integration Points

### SupplyChainService
Modified functions to accept user address and store data in MongoDB:
- `registerNetbooks()`
- `auditHardware()`
- `validateSoftware()`
- `assignToStudent()`

### Hooks
Updated hooks to pass user address to service functions:
- `useSupplyChainService`
- `useSupplyChainContract`

## Security

### Data Access Control
- Each role can view data from all roles (transparency)
- Each role can only edit their own data (data integrity)
- User address is stored with each record for accountability

### Data Integrity
- Transaction hashes link on-chain and off-chain data
- SHA-256 hashing ensures data hasn't been tampered with
- MongoDB timestamps provide audit trail

## Performance Optimization

### Caching Strategy
- Database connections are reused
- Indexes on frequently queried fields
- Connection pooling for concurrent operations

### Gas Optimization
- Only hashes are stored on-chain
- Detailed data is stored off-chain in MongoDB
- Reduces transaction costs significantly

## Environment Configuration

### Required Variables
```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=supplychain
```

### Docker Configuration
MongoDB service is included in `docker-compose.yml`:
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

## Testing

### Unit Tests
- MongoDB service operations
- Data validation and error handling
- Index creation and query performance

### Integration Tests
- End-to-end data flow from UI to database
- Role-based access control verification
- Data consistency between on-chain and off-chain storage

## Future Improvements

### Enhanced Security
- Encryption of sensitive data in MongoDB
- Role-based access control at the database level
- Audit logging for all database operations

### Performance
- Database sharding for large datasets
- Read replicas for improved query performance
- Connection pooling optimization

### Features
- Data export functionality
- Advanced querying and filtering
- Real-time data synchronization