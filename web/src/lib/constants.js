"use strict";
// Role constants - only include non-calculable values
// All role hashes should be retrieved from the contract, not hardcoded
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_ADMIN_ROLE = void 0;
// The DEFAULT_ADMIN_ROLE is a special case in OpenZeppelin AccessControl - it's always 0x00
exports.DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';
// Removed hardcoded ROLES object - all role information should be retrieved from the contract
// via getRoleHashes() in roleUtils.ts
