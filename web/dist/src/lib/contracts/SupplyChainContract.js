"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllSerialNumbers = getAllSerialNumbers;
exports.getNetbookState = getNetbookState;
exports.getNetbookReport = getNetbookReport;
exports.registerNetbooks = registerNetbooks;
exports.auditHardware = auditHardware;
exports.validateSoftware = validateSoftware;
exports.assignToStudent = assignToStudent;
exports.getAllMembers = getAllMembers;
exports.getRoleMemberCount = getRoleMemberCount;
exports.hasRole = hasRole;
exports.getRoleByName = getRoleByName;
exports.grantRole = grantRole;
exports.revokeRole = revokeRole;
exports.getNetbooksByState = getNetbooksByState;
const config_1 = require("@/lib/wagmi/config");
const core_1 = require("@wagmi/core");
// Importar el ABI y la dirección del contrato
const SupplyChainTracker_json_1 = __importDefault(require("@/contracts/abi/SupplyChainTracker.json"));
const env_1 = require("@/lib/env");
const contractAddress = env_1.NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS;
const abi = SupplyChainTracker_json_1.default;
// Función para obtener todos los números de serie
function getAllSerialNumbers() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield (0, core_1.readContract)(config_1.config, {
                address: contractAddress,
                abi,
                functionName: 'getAllSerialNumbers',
                args: []
            });
            return result;
        }
        catch (error) {
            console.error('Error al obtener números de serie:', error);
            throw error;
        }
    });
}
// Función para obtener el estado de una netbook
function getNetbookState(serial) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield (0, core_1.readContract)(config_1.config, {
                address: contractAddress,
                abi,
                functionName: 'getNetbookState',
                args: [serial]
            });
            return result;
        }
        catch (error) {
            console.error('Error al obtener estado de netbook:', error);
            throw error;
        }
    });
}
// Función para obtener el reporte de una netbook
function getNetbookReport(serial) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield (0, core_1.readContract)(config_1.config, {
                address: contractAddress,
                abi,
                functionName: 'getNetbookReport',
                args: [serial]
            });
            return result;
        }
        catch (error) {
            console.error('Error al obtener reporte de netbook:', error);
            throw error;
        }
    });
}
// Función para registrar netbooks
function registerNetbooks(serials, batches, specs) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield (0, core_1.writeContract)(config_1.config, {
                address: contractAddress,
                abi,
                functionName: 'registerNetbooks',
                args: [serials, batches, specs]
            });
            // Simular transacción exitosa
            return result;
        }
        catch (error) {
            console.error('Error al registrar netbooks:', error);
            throw error;
        }
    });
}
// Función para auditar hardware
function auditHardware(serial, passed, reportHash) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield (0, core_1.writeContract)(config_1.config, {
                address: contractAddress,
                abi,
                functionName: 'auditHardware',
                args: [serial, passed, reportHash]
            });
            // Simular transacción exitosa
            return result;
        }
        catch (error) {
            console.error('Error al auditar hardware:', error);
            throw error;
        }
    });
}
// Función para validar software
function validateSoftware(serial, osVersion, passed) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield (0, core_1.writeContract)(config_1.config, {
                address: contractAddress,
                abi,
                functionName: 'validateSoftware',
                args: [serial, osVersion, passed]
            });
            // Simular transacción exitosa
            return result;
        }
        catch (error) {
            console.error('Error al validar software:', error);
            throw error;
        }
    });
}
// Función para asignar a estudiante
function assignToStudent(serial, schoolHash, studentHash) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield (0, core_1.writeContract)(config_1.config, {
                address: contractAddress,
                abi,
                functionName: 'assignToStudent',
                args: [serial, schoolHash, studentHash]
            });
            // Simular transacción exitosa
            return result;
        }
        catch (error) {
            console.error('Error al asignar a estudiante:', error);
            throw error;
        }
    });
}
// Función para obtener miembros de un rol
function getAllMembers(roleHash) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield (0, core_1.readContract)(config_1.config, {
                address: contractAddress,
                abi,
                functionName: 'getAllMembers',
                args: [roleHash]
            });
            return result;
        }
        catch (error) {
            console.error('Error al obtener miembros del rol:', error);
            throw error;
        }
    });
}
// Función para obtener conteo de miembros de un rol
function getRoleMemberCount(roleHash) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield (0, core_1.readContract)(config_1.config, {
                address: contractAddress,
                abi,
                functionName: 'getRoleMemberCount',
                args: [roleHash]
            });
            return result;
        }
        catch (error) {
            console.error('Error al obtener conteo de miembros del rol:', error);
            throw error;
        }
    });
}
// Función para verificar si una cuenta tiene un rol
function hasRole(roleHash, address) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield (0, core_1.readContract)(config_1.config, {
                address: contractAddress,
                abi,
                functionName: 'hasRole',
                args: [roleHash, address]
            });
            return result;
        }
        catch (error) {
            console.error('Error al verificar rol:', error);
            return false;
        }
    });
}
// Función para obtener el rol por nombre
function getRoleByName(roleType) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Map roleType to the expected values in the contract
            // Mapeo de nombres de roles con sufijo _ROLE a los nombres que acepta el contrato
            const roleMap = {
                'FABRICANTE_ROLE': 'FABRICANTE',
                'AUDITOR_HW_ROLE': 'AUDITOR_HW',
                'TECNICO_SW_ROLE': 'TECNICO_SW',
                'ESCUELA_ROLE': 'ESCUELA',
                'DEFAULT_ADMIN_ROLE': 'ADMIN', // El contrato mapea ADMIN -> DEFAULT_ADMIN_ROLE
                'ADMIN': 'ADMIN' // Caso directo para ADMIN
            };
            // Si el roleType tiene sufijo _ROLE, intentamos mapearlo
            const mappedRoleType = roleMap[roleType] || roleType;
            const result = yield (0, core_1.readContract)(config_1.config, {
                address: contractAddress,
                abi,
                functionName: 'getRoleByName',
                args: [mappedRoleType]
            });
            return result;
        }
        catch (error) {
            console.error('Error al obtener rol por nombre:', error);
            // For ADMIN role, return the known hash
            if (roleType === 'ADMIN') {
                return '0x0000000000000000000000000000000000000000000000000000000000000000';
            }
            throw error;
        }
    });
}
// Funciones para gestión de roles
// Solicita el rol usando el nombre base del rol (sin sufijo _ROLE) en lugar del hash.
function grantRole(roleName, account) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Asegurarnos de que el nombre del rol esté en mayúsculas
            // Keep the role name as-is since contract expects exact case matching
            // The contract uses keccak256 encoding which is case-sensitive
            const contractRoleName = roleName.trim();
            // Validar que no se esté pasando un hash como roleName
            if (contractRoleName.startsWith('0x')) {
                throw new Error('grantRole espera un nombre de rol, no un hash');
            }
            const result = yield (0, core_1.writeContract)(config_1.config, {
                address: contractAddress,
                abi,
                functionName: 'grantRole',
                args: [account, contractRoleName]
            });
            // Simular transacción exitosa
            return result;
        }
        catch (error) {
            console.error('Error al otorgar rol:', error);
            throw error;
        }
    });
}
function revokeRole(roleHash, account) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield (0, core_1.writeContract)(config_1.config, {
                address: contractAddress,
                abi,
                functionName: 'revokeRole',
                args: [account, roleHash]
            });
            // Simular transacción exitosa
            return result;
        }
        catch (error) {
            console.error('Error al revocar rol:', error);
            throw error;
        }
    });
}
// Función para obtener netbooks por estado
function getNetbooksByState(state) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield (0, core_1.readContract)(config_1.config, {
                address: contractAddress,
                abi,
                functionName: 'getNetbooksByState',
                args: [state]
            });
            return result;
        }
        catch (error) {
            console.error('Error al obtener netbooks por estado:', error);
            throw error;
        }
    });
}
