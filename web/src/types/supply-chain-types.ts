export interface RoleSummary {
  role: string;
  members: string[];
  count: number;
}

export interface AllRolesSummary {
  [role: string]: RoleSummary;
}

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
  currentState: string;
}

export type NetbookState = 
  | 'FABRICADA'
  | 'HW_APROBADO'
  | 'SW_VALIDADO'
  | 'DISTRIBUIDA';

export type ContractRoles = 
  | 'FABRICANTE_ROLE'
  | 'AUDITOR_HW_ROLE'
  | 'TECNICO_SW_ROLE'
  | 'ESCUELA_ROLE'
  | 'DEFAULT_ADMIN_ROLE';