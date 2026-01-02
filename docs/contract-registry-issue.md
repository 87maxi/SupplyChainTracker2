# Contract Registry Issue Analysis

## Problem
The application is not functioning correctly because the SupplyChainTracker contract is not being registered in the contract registry, causing contract interactions to fail.

## Root Cause Analysis

### 1. Registration Sequence Issue
The main issue is a race condition in the initialization sequence:

- `service-debug.ts` runs immediately when imported in `layout.tsx`
- At this point, the `SupplyChainService` constructor has not yet executed
- The `contractRegistry.has('SupplyChainTracker')` check fails because registration happens in the constructor
- This creates a false negative in the diagnostic system

### 2. Hash Mismatch
The role hashes in the contract don't match those expected by the frontend:

**Contract Role Hashes (from Solidity):**
- `FABRICANTE_ROLE`: `keccak256("FABRICANTE_ROLE")`
- `AUDITOR_HW_ROLE`: `keccak256("AUDITOR_HW_ROLE")`
- `TECNICO_SW_ROLE`: `keccak256("TECNICO_SW_ROLE")`
- `ESCUELA_ROLE`: `keccak256("ESCUELA_ROLE")`

**Frontend Hash References:**
```typescript
// In web/src/services/SupplyChainService.ts
const roleMap: Record<string, `0x${string}`> = {
  'FABRICANTE': '0xdf8b4c520affe6d5bd668f8a16ff439b2b3fe20527c8a5d5d7cd0f17c3aa9c5d',
  'AUDITOR_HW': '0xed8e002819d8cf1a851ca1db7d19c6848d2559e61bf51cf90a464bd116556c00',
  'TECNICO_SW': '0x2ed8949af5557e2edaec784b826d9da85a22565588342ae7b736d3e8ebd76bfe',
  'ESCUELA': '0x88a49b04486bc479c925034ad3947fb7a1dc63c11a4fc29c186b7efde141b141',
};
```

Computing the correct hashes:
```bash
node -e "console.log('FABRICANTE_ROLE:', '0x' + require('ethers').id('FABRICANTE_ROLE').substring(2));"
# Result: 0xdf8b4c520affe6d5bd668f8a16ff439b2b3fe20527c8a5d5d7cd0f17c3aa9c5d ✅

node -e "console.log('AUDITOR_HW_ROLE:', '0x' + require('ethers').id('AUDITOR_HW_ROLE').substring(2));"
# Result: 0xed8e002819d8cf1a851ca1db7d19c6848d2559e61bf51cf90a464bd116556c00 ✅

node -e "console.log('TECNICO_SW_ROLE:', '0x' + require('ethers').id('TECNICO_SW_ROLE').substring(2));"
# Result: 0x2ed8949af5557e2edaec784b826d9da85a22565588342ae7b736d3e8ebd76bfe ✅

node -e "console.log('ESCUELA_ROLE:', '0x' + require('ethers').id('ESCUELA_ROLE').substring(2));"
# Result: 0x88a49b04486bc479c925034ad3947fb7a1dc63c11a4fc29c186b7efde141b141 ✅
```

The frontend hash values are actually correct, but the key names are inconsistent (missing `_ROLE` suffix).

## Solution

### 1. Fix Registration Timing
Modify the diagnostic system to check registration after a delay or when needed, rather than at startup:

```typescript
// web/src/lib/diagnostics/service-debug.ts
function checkRegistration() {
  setTimeout(() => {
    const hasSupplyChain = contractRegistry.has('SupplyChainTracker');
    if (!hasSupplyChain) {
      logAudit('❌ SupplyChainTracker no está registrado en contractRegistry');
    } else {
      logAudit('✅ SupplyChainTracker está registrado en contractRegistry');
      
      const config = contractRegistry.getConfig('SupplyChainTracker');
      if (config) {
        logAudit(`✅ Dirección del contrato: ${config.address}`, 'ContractRegistry');
        logAudit(`✅ Versión: ${config.version}`, 'ContractRegistry');
      }
    }
  }, 1000);
}

initializeDiagnostics();
checkRegistration(); // Check again after initialization
```

### 2. Fix Role Name Mapping
Update the role mapping to use consistent names with `_ROLE` suffix:

```typescript
// web/src/services/SupplyChainService.ts
const roleMap: Record<string, `0x${string}`> = {
  'FABRICANTE_ROLE': '0xdf8b4c520affe6d5bd668f8a16ff439b2b3fe20527c8a5d5d7cd0f17c3aa9c5d',
  'AUDITOR_HW_ROLE': '0xed8e002819d8cf1a851ca1db7d19c6848d2559e61bf51cf90a464bd116556c00',
  'TECNICO_SW_ROLE': '0x2ed8949af5557e2edaec784b826d9da85a22565588342ae7b736d3e8ebd76bfe',
  'ESCUELA_ROLE': '0x88a49b04486bc479c925034ad3947fb7a1dc63c11a4fc29c186b7efde141b141',
  'ADMIN': '0x0000000000000000000000000000000000000000000000000000000000000000'
};
```

### 3. Verify Contract Deployment
Ensure the contract is properly deployed to Anvil:

```bash
cd sc && forge script script/Deploy.s.sol:DeployScript --rpc-url http://localhost:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast --skip-simulation
```

## Verification

1. Deploy the contract to Anvil
2. Start the web application
3. Check that the diagnostic message shows:
   - ✅ SupplyChainTracker está registrado en contractRegistry
4. Test role management functions
5. Verify netbook lifecycle operations work correctly

## Impact

Fixing this issue will:
- Ensure proper contract registration
- Enable all contract interactions
- Fix role management functionality
- Restore full application functionality

Generated with [Continue](https://continue.dev)

Co-Authored-By: Continue <noreply@continue.dev>