// Importar los hashes de roles directamente de las constantes
import { ROLE_HASHES } from '@/lib/constants/roles';

// Get a map of role names to their hashes from the contract
// Updated RoleMap to include full role names as keys
export type RoleMap = {
  FABRICANTE: `0x${string}`;
  AUDITOR_HW: `0x${string}`;
  TECNICO_SW: `0x${string}`;
  ESCUELA: `0x${string}`;
  ADMIN: `0x${string}`;
};

let cachedRoleHashes: RoleMap | null = null;

export const getRoleHashes = async (): Promise<RoleMap> => {
  if (cachedRoleHashes) return cachedRoleHashes;

  try {
    console.log('[roleUtils] Fetching role hashes from constants...');
    
    // Los hashes de roles son constantes y no dependen de la dirección del contrato

    // Crear el objeto result con los hashes de roles directamente de las constantes
    const result: RoleMap = {
      FABRICANTE: ROLE_HASHES.FABRICANTE,
      AUDITOR_HW: ROLE_HASHES.AUDITOR_HW,
      TECNICO_SW: ROLE_HASHES.TECNICO_SW,
      ESCUELA: ROLE_HASHES.ESCUELA,
      ADMIN: ROLE_HASHES.ADMIN,
    };
    
    console.log('Role hashes retrieved:', result);
    cachedRoleHashes = result;
    return result;
  } catch (error) {
    console.error('Unexpected error in getRoleHashes:', error);
    // Este caso no debería ocurrir ya que no estamos haciendo llamadas al contrato
    // Pero por seguridad, retornamos los hashes de las constantes
    cachedRoleHashes = {
      FABRICANTE: ROLE_HASHES.FABRICANTE,
      AUDITOR_HW: ROLE_HASHES.AUDITOR_HW,
      TECNICO_SW: ROLE_HASHES.TECNICO_SW,
      ESCUELA: ROLE_HASHES.ESCUELA,
      ADMIN: ROLE_HASHES.ADMIN,
    };
    return cachedRoleHashes;
  }
};
