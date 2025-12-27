// web/src/types/supply-chain-types.ts

// Estados de la netbook
export type NetbookState = 'FABRICADA' | 'HW_APROBADO' | 'SW_VALIDADO' | 'DISTRIBUIDA';

// Información completa de una netbook
export interface Netbook {
  serialNumber: string;
  batchId: string;
  initialModelSpecs: string;
  hwAuditor: string;
  hwIntegrityPassed: boolean;
  hwReportHash: string;
  swTechnician: string;
  osVersion: string;
  swValidationPassed: boolean;
  destinationSchoolHash: string;
  studentIdHash: string;
  distributionTimestamp: string;
  currentState: NetbookState;
  setTimestamp?: number; // Add setTimestamp as optional property
}

// Roles del contrato
export type ContractRoles = 'DEFAULT_ADMIN_ROLE' | 'FABRICANTE_ROLE' | 'AUDITOR_HW_ROLE' | 'TECNICO_SW_ROLE' | 'ESCUELA_ROLE';

// Miembros de un rol
export interface RoleMembers {
  role: ContractRoles;
  members: string[];
  count: number;
}

// Resumen de todos los roles
export interface AllRolesSummary {
  DEFAULT_ADMIN_ROLE?: {
    count: number;
    members: string[];
  };
  FABRICANTE_ROLE?: {
    count: number;
    members: string[];
  };
  AUDITOR_HW_ROLE?: {
    count: number;
    members: string[];
  };
  TECNICO_SW_ROLE?: {
    count: number;
    members: string[];
  };
  ESCUELA_ROLE?: {
    count: number;
    members: string[];
  };
}

// ROLES constant has been removed - use role labels and hashes from contract via getRoleHashes()
// See getRoleHashes() in lib/roleUtils.ts for retrieving role information from the contract