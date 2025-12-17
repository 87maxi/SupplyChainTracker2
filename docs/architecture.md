# System Architecture

## Component Overview

The SupplyChainTracker system consists of two main components:

1. **Smart Contract** - Deployed on the blockchain, handling business logic and state management
2. **Web Application** - Frontend interface for users to interact with the contract

## Smart Contract Architecture

### Core Components

- **SupplyChainTracker.sol**: Main contract implementing the supply chain tracking logic
- **AccessControl.sol**: OpenZeppelin contract providing role-based access control

### Contract Inheritance

```
SupplyChainTracker
    └── AccessControl
        └── IAccessControl
        └── Context
        └── ERC165
```

### Data Flow

```
External Call → Modifier Validation → State Check → Data Update → Event Emission
```

## Web Application Architecture

### Project Structure

```
web/
├── public/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   ├── api/
│   │   ├── profile/
│   │   └── tokens/
│   ├── components/
│   ├── contexts/
│   ├── contracts/
│   ├── hooks/
│   ├── lib/
│   ├── services/
│   └── types/
├── .env.local
├── next.config.js
├── package.json
└── tailwind.config.js
```

### Service Layer

The application uses a service-oriented architecture with two main service classes:

#### Web3Service
- Handles connection to Ethereum provider
- Manages wallet connectivity
- Provides access to provider, signer, and contract instances
- Implements utilities for network and balance information

#### SupplyChainService
- Specialized wrapper around Web3Service
- Type-safe methods for all contract functions
- Error handling and logging
- Connectivity and account status utilities

## Interaction Flow

### User Interaction Sequence

1. User connects wallet through frontend interface
2. Web3Service establishes connection to Ethereum provider
3. SupplyChainService creates contract instance with signer
4. User performs actions through UI components
5. Service methods call contract functions
6. Blockchain processes transaction
7. Events are emitted and UI updates accordingly

### Data Flow Diagram

```
+----------------+     +---------------------+     +-----------------------+
|                |     |                     |     |                       |
|   Navegador    |<--->|   Aplicación Web    |<--->|   Blockchain (Anvil)  |
|   (Frontend)   |     |   (Next.js + Web3)  |     |   (SupplyChainTracker) |
|                |     |                     |     |                       |
+----------------+     +---------------------+     +-----------------------+
```

## Environment Configuration

### Environment Variables

```
# RPC URL for Anvil connection
NEXT_PUBLIC_ANVIL_RPC_URL=http://127.0.0.1:8545

# Deployed contract address
NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

## Security Considerations

- Role-based access control with exhaustive validation
- State validation to ensure correct workflow progression
- Cryptographic hashing to protect sensitive data
- Immutable audit trail of entire lifecycle
- Public auditability of all supply chain events

# Generated with [Continue](https://continue.dev)
Co-Authored-By: Continue <noreply@continue.dev>