import { ethers } from 'ethers';

// Calculate role hashes using keccak256 to match the contract
const calculateRoleHash = (roleName: string) => {
  return ethers.keccak256(ethers.toUtf8Bytes(roleName));
};

// Role hashes (must match contract definitions)
export const FABRICANTE_ROLE = '0x77158a1a868f1a2c65d799578edd3b70d91fe41d35a0873530f1675e734b03ea';
export const AUDITOR_HW_ROLE = '0x1b936a89e5e4bda7649c98d9e9505d97f27e27d48c04ee16fe3626e927b10223';
export const TECNICO_SW_ROLE = '0x82c5ab743a5cc7f634910cb398752a71d2d53dfaf4533e36bea6a488818753ab';
export const ESCUELA_ROLE = '0xc1a00cfc59ca80abcf3bceb0faa0349adfbe88d3298de8601c5e848e293322e7';
export const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';

// Roles constants for better maintainability
export const ROLES = {
  FABRICANTE: {
    hash: FABRICANTE_ROLE,
    label: 'Fabricante',
    description: 'Registro inicial de netbooks'
  },
  AUDITOR_HW: {
    hash: AUDITOR_HW_ROLE,
    label: 'Auditor HW',
    description: 'Verificación de hardware'
  },
  TECNICO_SW: {
    hash: TECNICO_SW_ROLE,
    label: 'Técnico SW',
    description: 'Instalación y validación de software'
  },
  ESCUELA: {
    hash: ESCUELA_ROLE,
    label: 'Escuela',
    description: 'Asignación a estudiantes'
  },
  ADMIN: {
    hash: DEFAULT_ADMIN_ROLE,
    label: 'Administrador',
    description: 'Gestión del sistema'
  }
} as const;

export const ROLE_LABELS = {
  [ROLES.FABRICANTE.hash]: ROLES.FABRICANTE.label,
  [ROLES.AUDITOR_HW.hash]: ROLES.AUDITOR_HW.label,
  [ROLES.TECNICO_SW.hash]: ROLES.TECNICO_SW.label,
  [ROLES.ESCUELA.hash]: ROLES.ESCUELA.label,
  [ROLES.ADMIN.hash]: ROLES.ADMIN.label,
} as const;

export type UserRole = keyof typeof ROLES;