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
    console.log(`[roleMapping] Normalizing role: "${name}"`);

    if (!name) {
      console.warn('[roleMapping] Empty role name provided, defaulting to ADMIN');
      return 'DEFAULT_ADMIN_ROLE';
    }

    const upperName = name.toUpperCase().trim();

    // 1. Normalize known variants to standard form
    const normalizedMap: Record<string, RoleName> = {
      'ADMIN': 'DEFAULT_ADMIN_ROLE',
      'DEFAULT_ADMIN': 'DEFAULT_ADMIN_ROLE',
      'MANAGER': 'DEFAULT_ADMIN_ROLE',
      'OWNER': 'DEFAULT_ADMIN_ROLE'
    };

    if (upperName in normalizedMap) {
      console.log(`[roleMapping] Normalized ${name} -> ${normalizedMap[upperName]}`);
      return normalizedMap[upperName];
    }

    // 2. Direct match with full names in our mapping
    if (upperName in this.nameToKey) {
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
    const fullRoleName = this.normalizeRoleName(name);
    const roleHashes = await getRoleHashes();

    // Use the short key to get the hash
    const key = this.nameToKey[fullRoleName];
    const hash = roleHashes[key];
    if (!hash) {
      throw new Error(`Role hash not found for role: ${fullRoleName} (key: ${key})`);
    }
    return hash;
  }
}

// Singleton instance
export const roleMapper = new RoleMapper();

// Export types for convenience
export type { RoleKey, RoleName };