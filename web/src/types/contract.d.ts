// Type definitions for SupplyChainTracker contract

export interface Netbook {
  serialNumber: string;
  batchId: string;
  initialModelSpecs: string;
  hwAuditor: string;
  hwIntegrityPassed: boolean;
  hwReportHash: string; // bytes32 is returned as hex string
  swTechnician: string;
  osVersion: string;
  swValidationPassed: boolean;
  destinationSchoolHash: string; // bytes32 is returned as hex string
  studentIdHash: string; // bytes32 is returned as hex string
  distributionTimestamp: string; // uint is returned as string (hex or decimal)
  currentState: number; // State enum as number (0, 1, 2, 3)
}

export type State = 0 | 1 | 2 | 3; // FABRICADA, HW_APROBADO, SW_VALIDADO, DISTRIBUIDA