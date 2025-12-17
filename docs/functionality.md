# SupplyChainTracker Contract Functionality

## Overview

The SupplyChainTracker contract is a blockchain-based solution for tracking the lifecycle of netbooks through a supply chain, from manufacturing to final distribution to students. It uses OpenZeppelin's AccessControl to manage permissions for different roles in the supply chain.

## Contract Structure

The contract implements a state machine pattern with four distinct states for each netbook:

1. **FABRICADA**: Initial state when the netbook is manufactured
2. **HW_APROBADO**: State after hardware audit is completed
3. **SW_VALIDADO**: State after software validation is completed
4. **DISTRIBUIDA**: Final state when the netbook is assigned to a student

## Roles

The contract defines four specialized roles with specific permissions:

- **FABRICANTE_ROLE**: Can register new netbooks
- **AUDITOR_HW_ROLE**: Can audit hardware and update hardware status
- **TECNICO_SW_ROLE**: Can validate software and update software status
- **ESCUELA_ROLE**: Can assign netbooks to students

Additionally, the contract uses the default admin role from AccessControl for administrative functions.

## Data Structures

### Netbook Struct

Each netbook is tracked using the following structure:

```solidity
struct Netbook {
    // A. Datos de Origen
    string serialNumber;
    string batchId;
    string initialModelSpecs;

    // B. Datos de Hardware
    address hwAuditor;
    bool hwIntegrityPassed;
    bytes32 hwReportHash;

    // C. Datos de Software
    address swTechnician;
    string osVersion;
    bool swValidationPassed;

    // D. Datos de Destino
    bytes32 destinationSchoolHash;
    bytes32 studentIdHash;
    uint distributionTimestamp;

    // Estado actual
    State currentState;
}
```

## Functions

### Write Functions (Privileged)

#### `registerNetbooks`
- **Role**: FABRICANTE_ROLE
- **Purpose**: Registers multiple netbooks at once with initial manufacturing data
- **Parameters**: Arrays of serial numbers, batch IDs, and model specifications
- **Process**: Creates new Netbook entries with initial state FABRICADA
- **Event**: Emits `NetbookRegistered`

#### `auditHardware`
- **Role**: AUDITOR_HW_ROLE
- **Purpose**: Records the results of hardware inspection
- **Parameters**: Serial number, pass/fail status, and hash of the audit report
- **Prerequisites**: Netbook must exist and be in FABRICADA state
- **Process**: Updates hardware fields and transitions state to HW_APROBADO
- **Event**: Emits `HardwareAudited`

#### `validateSoftware`
- **Role**: TECNICO_SW_ROLE
- **Purpose**: Records software validation results
- **Parameters**: Serial number, OS version, and pass/fail status
- **Prerequisites**: Netbook must exist and be in HW_APROBADO state
- **Process**: Updates software fields and transitions state to SW_VALIDADO
- **Event**: Emits `SoftwareValidated`

#### `assignToStudent`
- **Role**: ESCUELA_ROLE
- **Purpose**: Assigns a netbook to a specific student
- **Parameters**: Serial number, hashed school identifier, and hashed student identifier
- **Prerequisites**: Netbook must exist and be in SW_VALIDADO state
- **Process**: Updates destination fields, sets distribution timestamp, and transitions state to DISTRIBUIDA
- **Event**: Emits `AssignedToStudent`

### Read Functions (Public)

#### `getNetbookState`
- **Purpose**: Retrieves the current state of a netbook
- **Parameters**: Serial number
- **Returns**: Current state as a State enum value

#### `getNetbookReport`
- **Purpose**: Retrieves the complete record for a netbook
- **Parameters**: Serial number
- **Returns**: Full Netbook struct with all stored data

## Security Features

1. **Role-based access control**: Each function that modifies state requires a specific role
2. **State validation**: Functions can only be called when the netbook is in the expected state
3. **Input validation**: Serial numbers are validated for non-empty strings
4. **Duplicate prevention**: Netbooks cannot be registered twice with the same serial number

## Events

The contract emits events for key state transitions:

- **NetbookRegistered**: When a netbook is initially registered
- **HardwareAudited**: When hardware audit is completed
- **SoftwareValidated**: When software validation is completed
- **AssignedToStudent**: When a netbook is assigned to a student

## AccessControl Integration

The contract inherits from OpenZeppelin's AccessControl contract, which provides:

- Role assignment and management
- Hierarchical roles (via DEFAULT_ADMIN_ROLE)
- ERC165 interface support

The contract uses a custom modifier `_checkRoleCustom` that wraps AccessControl's `hasRole` function to provide custom error messages.

## Design Patterns

1. **State Machine**: Netbooks progress through a linear series of states
2. **Batch Operations**: Registration supports multiple netbooks in a single transaction
3. **Hash-based Privacy**: School and student identifiers are stored as hashes to protect sensitive information
4. **Data Integrity**: Audit reports are stored as hashes, allowing verification of document integrity without storing the full document

## Potential Improvements

1. Add timestamp for each state transition to track processing times
2. Implement role revocation functions for security management
3. Add event for initial role setup
4. Consider using enums for role constants to improve type safety
5. Add input validation for batch ID and model specifications
6. Implement a function to retrieve multiple netbooks at once for reporting purposes