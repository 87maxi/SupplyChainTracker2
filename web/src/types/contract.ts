// Contract types and interfaces

/**
 * Available contract roles
 */
export type ContractRoles = 
  | 'FABRICANTE_ROLE'
  | 'AUDITOR_HW_ROLE'
  | 'TECNICO_SW_ROLE'
  | 'ESCUELA_ROLE'
  | 'DEFAULT_ADMIN_ROLE';

/**
 * Role names as keys
 */
export type RoleName = ContractRoles;

/**
 * Netbook state enum
 */
export enum NetbookState {
  FABRICADA = 0,
  HW_APROBADO = 1,
  SW_VALIDADO = 2,
  DISTRIBUIDA = 3
}

/**
 * Netbook interface
 */
export interface Netbook {
  serial: string;
  batch: string;
  specs: string;
  currentState: NetbookState;
  distributionTimestamp: string;
}

/**
 * Type for role summary data
 */
export type RoleSummary = {
  count: number;
  members: string[];
};

/**
 * Type for roles summary object
 */
export type AllRolesSummary = {
  [key in ContractRoles]: RoleSummary;
};
