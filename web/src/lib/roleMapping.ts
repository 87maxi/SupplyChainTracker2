// web/src/lib/roleMapping.ts
// Central role mapping utility for consistent role name to hash conversion
// Maps role keys (FABRICANTE, AUDITOR_HW, etc.) to their full role names

import { getRoleHashes } from './roleUtils';

type RoleKey = 'FABRICANTE' | 'AUDITOR_HW' | 'TECNICO_SW' | 'ESCUELA' | 'ADMIN';
type RoleName = 'FABRICANTE_ROLE' | 'AUDITOR_HW_ROLE' | 'TECNICO_SW_ROLE' | 'ESCUELA_ROLE' | 'DEFAULT_ADMIN_ROLE';

// Mapping from short keys to full role names as defined in the contract
class RoleMapper {
  private readonly keyToName: Record<RoleKey, RoleName> = {
    FABRICANTE: 'FABRICANTE_ROLE',
    AUDITOR_HW: 'AUDITOR_HW_ROLE',
    TECNICO_SW: 'TECNICO_SW_ROLE',
    ESCUELA: 'ESCUELA_ROLE',
    ADMIN: 'DEFAULT_ADMIN_ROLE'
  };

  private readonly nameToKey: Record<RoleName, RoleKey> = {
    'FABRICANTE_ROLE': 'FABRICANTE',
    'AUDITOR_HW_ROLE': 'AUDITOR_HW',
    'TECNICO_SW_ROLE': 'TECNICO_SW',
    'ESCUELA_ROLE': 'ESCUELA',
    'DEFAULT_ADMIN_ROLE': 'ADMIN'
  };

  // Convert short key to full role name
  toFullName(key: RoleKey): RoleName {
    return this.keyToName[key];
  }

  // Convert full role name to short key
  toKey(name: RoleName): RoleKey {
    const key = this.nameToKey[name];
    if (!key) {
      console.warn(`[roleMapping] No key found for role name: ${name}`);
      return 'ADMIN'; // fallback
    }
    return key;
  }

  // Convert any role name (with or without _ROLE suffix) to full role name
  normalizeRoleName(name: string): RoleName {
    const originalName = name;
    if (!name) {
      console.warn('[roleMapping] Empty role name provided, defaulting to ADMIN');
      return 'DEFAULT_ADMIN_ROLE';
    }

    const upperName = name.toUpperCase().trim();
    console.log(`[roleMapping] Normalizing role: "${originalName}" (upper: "${upperName}")`);

    // Handle case where name is already a hash
    // This block cannot be async, so we cannot use await here
    // We'll handle hash to role conversion in a different way
    if (upperName.startsWith('0x') && upperName.length === 66) {
      console.log(`[roleMapping] Name appears to be a hash, but cannot resolve to role name without async operation`);
      
      // We cannot await getRoleHashes() here since this method is not async
      // For now, return a fallback
      return 'DEFAULT_ADMIN_ROLE';
    }

    // 1. Normalize known variants to standard form
    const normalizedMap: Record<string, RoleName> = {
      'ADMIN': 'DEFAULT_ADMIN_ROLE',
      'DEFAULT_ADMIN': 'DEFAULT_ADMIN_ROLE',
      'DEFAULT_ADMIN_ROLE': 'DEFAULT_ADMIN_ROLE',
      'MANAGER': 'DEFAULT_ADMIN_ROLE',
      'OWNER': 'DEFAULT_ADMIN_ROLE'
    };

    if (upperName in normalizedMap) {
      console.log(`[roleMapping] Normalized ${name} -> ${normalizedMap[upperName]}`);
      return normalizedMap[upperName];
    }

    // 2. Direct match with full names in our mapping
    if (upperName in this.nameToKey) {
      console.log(`[roleMapping] Direct match with full name: ${originalName} -> ${upperName}`);
      return upperName as RoleName;
    }

    // 3. Match short keys
    if (upperName in this.keyToName) {
      const result = this.keyToName[upperName as RoleKey];
      console.log(`[roleMapping] Matched short key ${upperName} -> ${result}`);
      return result;
    }

    // 4. Try removing _ROLE suffix
    if (upperName.endsWith('_ROLE')) {
      const key = upperName.slice(0, -5);
      if (key in this.keyToName) {
        const result = this.keyToName[key as RoleKey];
        console.log(`[roleMapping] Removed _ROLE suffix: ${upperName} -> ${result}`);
        return result;
      }
    }

    // 5. Try adding _ROLE suffix
    const withRole = `${upperName}_ROLE` as RoleName;
    if (withRole in this.nameToKey) {
      console.log(`[roleMapping] Added _ROLE suffix: ${name} -> ${withRole}`);
      return withRole;
    }

    console.error(`[roleMapping] Failed to normalize role: "${name}" (upper: "${upperName}")`);
    console.warn(`[roleMapping] Using DEFAULT_ADMIN_ROLE as fallback for: ${name}`);
    return 'DEFAULT_ADMIN_ROLE';
  }

  // Get role hash for any role name format
  async getRoleHash(name: string): Promise<`0x${string}`> {
    const upperName = name.toUpperCase().trim();

    // If name is already a hash, return it directly
    if (upperName.startsWith('0x') && upperName.length === 66) {
      console.log(`[roleMapper] Name is already a hash, returning directly: ${name}`);
      return upperName as `0x${string}`;
    }

    // Handle special case for admin roles
    if (['ADMIN', 'DEFAULT_ADMIN', 'MANAGER', 'OWNER', 'DEFAULT_ADMIN_ROLE'].includes(upperName)) {
      console.log('[roleMapper] Using bytes32(0) for admin role:', upperName);
      return '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`;
    }

    console.log(`[roleMapper] Attempting to get hash for role: "${name}"`);
    const fullRoleName = this.normalizeRoleName(name);

    // Fallback to roleHashes if contract call fails or is unnecessary
    const roleHashes = await getRoleHashes();
    const key = this.nameToKey[fullRoleName];

    if (key) {
      const hash = roleHashes[key];
      if (hash && hash !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
        console.log(`[roleMapper] Using hash from roleHashes cache: ${hash}`);
        return hash;
      }
    }

    console.error(`[roleMapper] Failed to get hash for role: ${name} (full: ${fullRoleName})`);
    return '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`;
  }
}

// Singleton instance
export const roleMapper = new RoleMapper();

// Export types for convenience
export type { RoleKey, RoleName };