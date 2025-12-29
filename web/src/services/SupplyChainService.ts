// web/src/services/SupplyChainService.ts
// Re-export services for backward compatibility

export * from './contracts/supply-chain.service';
export * from './contracts/role.service';

// Create a singleton instance for backward compatibility
import { SupplyChainService } from './contracts/supply-chain.service';
import { RoleService } from './contracts/role.service';

export const supplyChainService = new SupplyChainService();
export const roleService = new RoleService();

// Export individual methods for backward compatibility
export const { 
  registerNetbooks, 
  auditHardware, 
  validateSoftware, 
  assignToStudent,
  getNetbookState,
  getNetbookReport,
  getAllSerialNumbers,
  getNetbooksByState,
  getAllMembers,
  getRoleMembers
} = supplyChainService;

export const { hasRole, grantRole, revokeRole, getRoleMembers: getRoleMembersByRole } = roleService;