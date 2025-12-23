---
description: Ensure contract addresses are correctly configured to prevent
  execution reverted errors.
alwaysApply: true
---

Always verify that the contract address in environment variables matches the deployed contract address. After deploying a new version of the contract, update NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS in env.ts with the new address.