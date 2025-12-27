import { Address, Hex } from 'viem';

// Type definitions for SupplyChainTracker contract

export type ContractRoles = 'DEFAULT_ADMIN_ROLE' | 'FABRICANTE_ROLE' | 'AUDITOR_HW_ROLE' | 'TECNICO_SW_ROLE' | 'ESCUELA_ROLE';

export interface AllRolesSummary {
  DEFAULT_ADMIN_ROLE: { count: number; members: string[] };
  FABRICANTE_ROLE: { count: number; members: string[] };
  AUDITOR_HW_ROLE: { count: number; members: string[] };
  TECNICO_SW_ROLE: { count: number; members: string[] };
  ESCUELA_ROLE: { count: number; members: string[] };
}

export enum NetbookState {
  FABRICADA = 0,
  HW_APROBADO = 1,
  SW_VALIDADO = 2,
  DISTRIBUIDA = 3,
}

export interface Netbook {
  serialNumber: string;
  batchId: string;
  initialModelSpecs: string;
  hwAuditor: Address;
  hwIntegrityPassed: boolean;
  hwReportHash: Hex;
  swTechnician: Address;
  osVersion: string;
  swValidationPassed: boolean;
  destinationSchoolHash: Hex;
  studentIdHash: Hex;
  distributionTimestamp: bigint;
  currentState: NetbookState;
}