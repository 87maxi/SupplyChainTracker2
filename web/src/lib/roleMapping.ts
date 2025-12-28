// web/src/lib/roleMapping.ts
// Central role mapping utility for consistent role name to hash conversion
// Maps role keys (FABRICANTE, AUDITOR_HW, etc.) to their full role names

import { getRoleHashes } from '@/lib/roleUtils';

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
    return this.nameToKey[name];
  }

  // Convert any role name (with or without _ROLE suffix) to full role name
  normalizeRoleName(name: string): RoleName {
    // If already a full name, return as is
    if (name in this.nameToKey) {
      return name as RoleName;
    }
    
    // Try to match by removing _ROLE suffix
    if (name.endsWith('_ROLE')) {
      const key = name.slice(0, -5) as RoleKey;
      if (key in this.keyToName) {
        return this.keyToName[key];
      }
    }
    
    // Try to match as short key
    const roleKey = name as RoleKey;
    if (roleKey in this.keyToName) {
      return this.keyToName[roleKey];
    }
    
    throw new Error(`Invalid role name: ${name}`);
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