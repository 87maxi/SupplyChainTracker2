"use strict";
// web/src/services/SupplyChainService.ts
// Re-export services for backward compatibility
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoleMembersByRole = exports.revokeRole = exports.grantRole = exports.hasRole = exports.getRoleMembers = exports.getAllMembers = exports.getNetbooksByState = exports.getAllSerialNumbers = exports.getNetbookReport = exports.getNetbookState = exports.assignToStudent = exports.validateSoftware = exports.auditHardware = exports.registerNetbooks = exports.roleService = exports.supplyChainService = void 0;
__exportStar(require("./contracts/supply-chain.service"), exports);
__exportStar(require("./contracts/role.service"), exports);
// Create a singleton instance for backward compatibility
const supply_chain_service_1 = require("./contracts/supply-chain.service");
const role_service_1 = require("./contracts/role.service");
exports.supplyChainService = new supply_chain_service_1.SupplyChainService();
exports.roleService = new role_service_1.RoleService();
// Export individual methods for backward compatibility
exports.registerNetbooks = exports.supplyChainService.registerNetbooks, exports.auditHardware = exports.supplyChainService.auditHardware, exports.validateSoftware = exports.supplyChainService.validateSoftware, exports.assignToStudent = exports.supplyChainService.assignToStudent, exports.getNetbookState = exports.supplyChainService.getNetbookState, exports.getNetbookReport = exports.supplyChainService.getNetbookReport, exports.getAllSerialNumbers = exports.supplyChainService.getAllSerialNumbers, exports.getNetbooksByState = exports.supplyChainService.getNetbooksByState, exports.getAllMembers = exports.supplyChainService.getAllMembers, exports.getRoleMembers = exports.supplyChainService.getRoleMembers;
exports.hasRole = exports.roleService.hasRole, exports.grantRole = exports.roleService.grantRole, exports.revokeRole = exports.roleService.revokeRole, exports.getRoleMembersByRole = exports.roleService.getRoleMembers;
