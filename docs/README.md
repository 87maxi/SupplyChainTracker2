# SupplyChainTracker - Final Architecture Documentation

## 🚀 Overview

**SupplyChainTracker** is a fully decentralized, blockchain-native application for tracking the lifecycle of netbooks from manufacturing to classroom distribution. **MongoDB has been completely removed** — all state is now managed on-chain using Ethereum Virtual Machine (EVM) smart contracts and Anvil for local development.

This document summarizes the final architecture, data flow, and key improvements.

---

## ✅ Key Changes: From MongoDB to Blockchain-Native

| Area | Before | After |
|------|--------|-------|
| **State Storage** | MongoDB for roles, netbook states, and requests | **Ethereum Smart Contract (`SupplyChainTracker.sol`)** |
| **Role Management** | Server-side API + DB updates | **On-chain `grantRole()` / `revokeRole()`** |
| **Pending Requests** | Stored in MongoDB | **Stored in localStorage (UI only)** |
| **Data Consistency** | Risk of DB/contract drift | **Single source of truth on-chain** |
| **Security** | Exposed MongoDB URI, server-side logic | **No backend, no DB exposure — fully client-side + contract** |
| **Auditability** | Limited to DB logs | **Full transparency via Etherscan/block explorer** |
| **Deployment** | Required MongoDB server | **Zero server dependencies — deploy anywhere** |

---

## 🧩 Architecture Diagram

![Final Architecture](final-architecture.puml)

> *See `./docs/final-architecture.puml` for the full PlantUML diagram.*

---

## 🔧 Core Components

### 1. **Smart Contract: `SupplyChainTracker.sol`**
- Manages **all roles** via `AccessControl` (using `bytes32` role hashes)
- Tracks **netbook lifecycle**: `FABRICADA` → `HW_APROBADO` → `SW_VALIDADO` → `DISTRIBUIDA`
- Exposes functions:
  - `grantRole(account, roleType)`
  - `revokeRole(account, roleType)`
  - `registerNetbooks(serials, batches, specs)`
  - `auditHardware(serial, passed, reportHash)`
  - `validateSoftware(serial, osVersion, passed)`
  - `assignToStudent(serial, schoolHash, studentHash)`
  - `getRoleByName(roleType)` → returns role hash
  - `getRoleMembers(roleHash)` → returns list of addresses

### 2. **Web Frontend (Next.js)**
- **No server-side MongoDB** — all data fetched via Wagmi from Anvil
- **useRoleRequests Hook**: Manages pending role requests in `localStorage`
- **roleMapper Utility**: Normalizes role names (e.g., "fabricante" → "FABRICANTE_ROLE") and resolves hashes via `getRoleByName()`
- **useSupplyChainService Hook**: Centralized interface to all contract calls
- **UI Components**: `ApprovedAccountsList`, `PendingRoleRequests`, `DashboardOverview` — all read directly from contract

### 3. **Wallet & Network**
- Uses **Wagmi + Injected Provider** (MetaMask, Rabby, etc.)
- Connects to **Anvil (localhost:8545)** for local development
- All transactions signed client-side — no server intermediaries

---

## 📡 Data Flow Summary

1. User requests a role → `RoleRequestModal` signs message → stores request in `localStorage`
2. Admin approves request → `useRoleRequests` calls `grantRole(roleHash, userAddress)` on-chain
3. Contract emits `RoleGranted` event → UI listens via `eventBus` → updates `ApprovedAccountsList` optimistically
4. All role membership, netbook state, and permissions are **verified on-chain** via `hasRole()` and `getRoleMembers()`
5. No data is stored or synchronized with any external database.

---

## 🛡️ Security & Advantages

- **No exposed database credentials** — eliminated risk of MongoDB injection or exposure
- **Immutable audit trail** — every role change is a blockchain transaction
- **Censorship-resistant** — no central authority can delete or alter records
- **Trustless** — users verify everything on-chain
- **Cost-efficient** — no server or DB hosting costs

---

## 🚫 Removed Components

- `./web/src/lib/mongodb/` — all client and server MongoDB code
- `./web/src/services/RoleRequestService.ts` and `RoleDataService.ts`
- `./web/src/app/api/mongodb/` — all API routes
- `./web/src/types/mongodb.ts`
- `MONGODB_URI` from `.env.local`, `package.json`, `next.config.mjs`
- `mongodb` npm package from `package.json`

---

## ✅ Verification Checklist

- [x] No MongoDB code remains in codebase
- [x] All role and netbook state is on-chain
- [x] `useRoleRequests` uses `localStorage`, not DB
- [x] `roleMapper` and `getRoleHashes` use contract functions
- [x] No API routes reference MongoDB
- [x] `npm run build` succeeds without MongoDB
- [x] UI renders correctly with Anvil running
- [x] Role approvals work end-to-end (sign → grant → reflect on UI)

---

## 📌 Deployment Notes

- **Local**: Run `anvil` → `npm run dev` in `/web`
- **Production**: Deploy frontend to Vercel/Netlify; point `NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS` to mainnet/testnet contract
- **No backend server required** — everything is client-side + contract

---

> **Final Note**: This system is now a true Web3 application — **fully decentralized, trustless, and verifiable**. No databases. No servers. Just code, contracts, and wallets.