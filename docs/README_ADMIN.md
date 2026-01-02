# SupplyChainTracker - Admin Guide (Blockchain-Native)

## 🛠️ Admin Dashboard: How It Works

The admin dashboard is **100% decentralized**. There is **no MongoDB**, **no backend server**, and **no external database**. All user roles, netbook states, and approvals are managed directly on the blockchain via the `SupplyChainTracker.sol` smart contract.

---

## 🔐 Role Management Flow

### 1. **User Submits Role Request**
- User selects role (e.g., "Fabricante") in `RoleRequestModal`
- Wallet signs a message: `"Solicito el rol de Fabricante..."`
- Request is stored **locally in browser localStorage** (not on server or DB)
- **No API call to MongoDB** — request is purely client-side

### 2. **Admin Approves Request**
- Admin sees request in `PendingRoleRequests` or `DashboardOverview`
- Clicks "Aprobar"
- Frontend:
  - Uses `roleMapper` to convert `"fabricante"` → `"FABRICANTE_ROLE"`
  - Calls `getRoleByName("FABRICANTE")` on-chain → gets role hash
  - Calls `grantRole(roleHash, userAddress)` on the contract
- **Transaction is sent to Anvil (or mainnet)**
- Contract emits `RoleGranted` event

### 3. **Role Applied Instantly**
- Contract updates internal role membership
- All components (`ApprovedAccountsList`, `UserRolesChart`, etc.) read directly from contract using `getRoleMembers(roleHash)`
- UI updates automatically via `useSupplyChainService().getAllRolesSummary()`
- No polling or DB sync needed — state is always consistent

### 4. **Admin Revoke Role**
- Click "Revocar" on approved user
- Calls `revokeRole(roleHash, userAddress)` on-chain
- Contract emits `RoleRevoked`
- User loses access immediately
- UI updates in real-time

---

## 📊 Dashboard Components (No DB)

| Component | Data Source | How It Works |
|---------|-------------|--------------|
| **ApprovedAccountsList** | `getRoleMembers(roleHash)` | Reads live list of addresses with each role from contract |
| **UserRolesChart** | `getRoleMemberCount(roleHash)` | Counts members per role directly from contract |
| **NetbookStatusChart** | `getNetbooksByState(state)` | Fetches serial numbers by state (FABRICADA, HW_APROBADO, etc.) |
| **PendingRoleRequests** | `localStorage` | Shows only locally stored pending requests — **not from DB** |
| **SystemHealth** | `checkConnection()` | Verifies wallet and contract connection — no external service |

> 💡 **Note**: The "Pending" list is **only visible to the admin who sees it** — it’s not synchronized across users. This is intentional: approvals are **on-chain**, so the only thing pending is the UI state before the transaction is confirmed.

---

## 🔄 Data Consistency & Real-Time Updates

- All data is **read directly from the blockchain** — no caching, no stale data
- `useSupplyChainService().getAllRolesSummary()` fetches fresh data on load and on interval (30s)
- Events (`RoleGranted`, `RoleRevoked`) trigger `eventBus` → UI refreshes immediately
- **No need to refresh page** — components auto-update

---

## 🔐 Security Best Practices

- ✅ **No `MONGODB_URI`** — eliminated all database exposure
- ✅ **No server-side logic** — all operations are client-side + contract
- ✅ **Role names normalized** — `roleMapper` ensures consistent encoding
- ✅ **Role hashes resolved on-demand** — no hardcoded values (fallbacks only)
- ✅ **All transactions signed by user** — admin cannot act without wallet approval
- ✅ **No private data stored** — only public addresses and public role hashes

---

## 🚀 How to Test as Admin

1. Start Anvil: `cd ./sc && forge script script/DeployAnvil.s.sol --fork-url http://localhost:8545 --broadcast`
2. Open browser → Connect wallet (use Anvil account #0 as admin)
3. Go to `/admin`
4. Have another wallet (e.g., Anvil #1) request a role
5. Approve it → verify it appears in `ApprovedAccountsList`
6. Revoke it → verify it disappears
7. Check transaction on [Anvil Explorer](http://localhost:8545) or `anvil` logs

---

## 📁 What’s Gone (Removed)

- `./web/src/lib/mongodb/`
- `./web/src/services/RoleRequestService.ts`
- `./web/src/services/RoleDataService.ts`
- `./web/src/app/api/mongodb/`
- `./web/src/types/mongodb.ts`
- `MONGODB_URI` from `.env.local`
- `mongodb` package from `package.json`

---

> ✅ **Final Verdict**: The admin dashboard is now a **true Web3 interface** — fully decentralized, auditable, and secure. No server. No database. Just smart contracts and wallets.