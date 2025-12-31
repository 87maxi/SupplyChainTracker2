# MongoDB Integration for Supply Chain Tracker

## Overview
This document describes the MongoDB integration implemented for the Supply Chain Tracker web application. The integration replaces the previous localStorage-based implementation with a complete MongoDB solution, providing persistent storage and proper data consistency across sessions.

## Key Features

### 1. Native MongoDB Driver
- Uses the official MongoDB Node.js driver (`mongodb` package)
- Complete replacement of localStorage for role and netbook data storage
- Better performance and control over database operations

### 2. Collections Structure
- **role_data**: Stores role-specific actions and approval status
- **netbook_data**: Stores netbook-specific information and transaction history

### 3. Data Models

#### RoleData Interface
```typescript
interface RoleData {
  _id?: string;
  transactionHash: `0x${string}`;
  role: ContractRoles;
  userAddress: string;
  data: Record<string, unknown>;
  status?: 'pending' | 'approved' | 'rejected';
  updatedBy?: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

#### NetbookData Interface
```typescript
interface NetbookData {
  _id?: string;
  serialNumber: string;
  transactionHash: `0x${string}`;
  role: ContractRoles;
  userAddress: string;
  data: Record<string, unknown>;
  status: string;
  updatedBy: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### 4. Core Services

#### MongoDBService
- Provides comprehensive CRUD operations for role and netbook data
- Handles connection management and error handling
- Implements proper indexing for optimized queries

#### Status Update Services
- **updateRoleStatus**: Updates the approval status of role requests
- **updateNetbookStatus**: Updates the status of netbooks with metadata
- Both services integrate with blockchain operations for data consistency

## Configuration

### Environment Variables
```bash
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=supplychain-tracker
```

### Docker Compose
MongoDB is configured in `docker-compose.yml`:
```yaml
services:
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

## API Endpoints

### GET /api/mongodb/role-data
- Retrieves role data with filtering by transactionHash, role, or userAddress
- Returns array of role data with proper pagination

### GET /api/mongodb/netbooks
- Retrieves netbook data with advanced filtering and pagination
- Supports filtering by status, manufacturer, and search terms

### GET /api/mongodb/users
- Retrieves user data with role-based filtering
- Provides comprehensive user management capabilities

## Implementation Details

### Role Request Lifecycle
1. **Submit Request**: Saves initial role request to MongoDB
2. **Approval Process**: Updates status to 'approved' with blockchain transaction hash
3. **Data Consistency**: Ensures MongoDB and blockchain state remain synchronized

### Data Flow Architecture
```
Client Component 
    ↓ (HTTP Request)
API Route (Server-side)
    ↓ 
MongoDB Service
    ↓ 
MongoDB Database
```

## Integration with UI Components

### Pending Role Requests
- Completely replaced localStorage with MongoDB API calls
- Automatic filtering of approved requests
- Real-time data synchronization

### Approved Accounts List
- Removed localStorage-based optimistic updates
- Direct integration with MongoDB for accurate data
- Complete role management capabilities

## Migration Strategy

### Data Migration
1. Read existing localStorage data
2. Convert to MongoDB document format
3. Write to MongoDB collections
4. Clear localStorage after successful migration

### Service Dependencies
- Role requests now depend on MongoDB rather than localStorage
- All data persistence is handled server-side
- Client components retrieve data through API routes

## Testing Approach

### Test Coverage
- Unit tests for MongoDB service methods
- Integration tests for API endpoints
- End-to-end tests for role approval workflow

### Test Commands
```bash
npm test -- --testPathPattern="mongodb"
npm run data:generate  # Generate fake test data
npm run data:clean     # Clean test database
npm run data:reset     # Reset test data
```

## Error Handling

### MongoDBService
- Comprehensive error logging
- Graceful degradation on connection failures
- Proper error propagation to client components

### API Routes
- Standardized error responses with appropriate status codes
- Detailed error messages for debugging
- Input validation and sanitization

## Future Enhancements

### Real-time Updates
- Implement MongoDB change streams for real-time data updates
- WebSocket integration for live dashboard updates

### Data Analytics
- Enhanced querying capabilities for reporting
- Aggregation pipelines for complex analytics

### Security
- Role-based access control for API endpoints
- Data encryption at rest and in transit
- Audit logging for sensitive operations
