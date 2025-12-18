import { ethers } from 'ethers';

// Calculate role hashes using keccak256 to match the contract
const calculateRoleHash = (roleName: string) => {
  return ethers.keccak256(ethers.toUtf8Bytes(roleName));
};

// Roles constants for better maintainability
export const ROLES = {
  FABRICANTE: {
    hash: calculateRoleHash('FABRICANTE_ROLE'),
    label: 'Fabricante',
    description: 'Registro inicial de netbooks'
  },
  AUDITOR_HW: {
    hash: calculateRoleHash('AUDITOR_HW_ROLE'),
    label: 'Auditor HW',
    description: 'Verificación de hardware'
  },
  TECNICO_SW: {
    hash: calculateRoleHash('TECNICO_SW_ROLE'),
    label: 'Técnico SW',
    description: 'Instalación y validación de software'
  },
  ESCUELA: {
    hash: calculateRoleHash('ESCUELA_ROLE'),
    label: 'Escuela',
    description: 'Asignación a estudiantes'
  },
  ADMIN: {
    hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    label: 'Administrador',
    description: 'Gestión del sistema'
  }
} as const;

export const ROLE_NAMES = {
  [ROLES.FABRICANTE.hash]: ROLES.FABRICANTE.label,
  [ROLES.AUDITOR_HW.hash]: ROLES.AUDITOR_HW.label,
  [ROLES.TECNICO_SW.hash]: ROLES.TECNICO_SW.label,
  [ROLES.ESCUELA.hash]: ROLES.ESCUELA.label,
  [ROLES.ADMIN.hash]: ROLES.ADMIN.label,
};

export type UserRole = keyof typeof ROLES;