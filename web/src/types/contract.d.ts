import { Address, Hex } from 'viem';

// Type definitions for SupplyChainTracker contract

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