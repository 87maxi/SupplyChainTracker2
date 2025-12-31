"use strict";
// web/src/services/contracts/supply-chain.service.ts
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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.SupplyChainService = void 0;
const base_contract_service_1 = require("./base-contract.service");
const SupplyChainTracker_json_1 = __importDefault(require("@/contracts/abi/SupplyChainTracker.json"));
const env_1 = require("@/lib/env");
const schemas_1 = require("@/lib/validation/schemas");
const zod_1 = require("zod");
// Validaciones
const validateRegisterInput = zod_1.z.object({
    serials: zod_1.z.array(zod_1.z.string()).min(1),
    batches: zod_1.z.array(zod_1.z.string()),
    specs: zod_1.z.array(zod_1.z.string())
}).refine(data => data.serials.length === data.batches.length &&
    data.serials.length === data.specs.length, {
    message: 'Los arrays deben tener la misma longitud'
});
/**
 * Servicio para interactuar con el contrato SupplyChainTracker
 */
class SupplyChainService extends base_contract_service_1.BaseContractService {
    constructor() {
        super(env_1.NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS, SupplyChainTracker_json_1.default, 'supplychain');
        /**
         * Verifica si una dirección tiene un rol específico
         * @param roleHash Hash del rol
         * @param userAddress Dirección del usuario
         * @returns True si el usuario tiene el rol
         */
        this.hasRole = (roleHash, userAddress) => __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.read('hasRole', [roleHash, userAddress]);
            }
            catch (error) {
                console.error('Error in hasRole:', error);
                return false;
            }
        });
        /**
         * Registra múltiples netbooks en el contrato
         * @param serials Array de números de serie
         * @param batches Array de IDs de lote
         * @param specs Array de especificaciones del modelo
         * @param userAddress Dirección del usuario
         * @returns Resultado de la transacción
         */
        this.registerNetbooks = (serials, batches, specs, userAddress) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Validar entrada
                validateRegisterInput.parse({ serials, batches, specs });
                // Realizar transacción
                const { hash } = yield this.write('registerNetbooks', [serials, batches, specs], {
                    role: 'FABRICANTE_ROLE',
                    userAddress: userAddress,
                    relatedSerial: serials[0] // Usar el primer serial como referencia
                });
                // Esperar confirmación
                const receipt = yield this.waitForTransaction(hash);
                // Save to MongoDB via API route
                try {
                    yield fetch('/api/mongodb/supply-chain-actions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            serials,
                            transactionHash: hash,
                            role: 'FABRICANTE_ROLE',
                            userAddress,
                            data: { batches, specs }
                        })
                    });
                }
                catch (apiError) {
                    console.error('Error saving to MongoDB via API:', apiError);
                }
                // Invalidar caché relacionada
                this.invalidateCache('getNetbook');
                this.invalidateCache('getAllSerialNumbers');
                return {
                    success: true,
                    hash
                };
            }
            catch (error) {
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Error desconocido'
                };
            }
        });
        /**
         * Auditoría del hardware de una netbook
         * @param serial Número de serie
         * @param passed Si el hardware pasó la auditoría
         * @param reportHash Hash del informe de auditoría
         * @param userAddress Dirección del usuario
         * @returns Resultado de la transacción
         */
        this.auditHardware = (serial, passed, reportHash, userAddress) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Validar entrada
                schemas_1.AuditHardwareSchema.parse({ serial, passed, reportHash });
                // Realizar transacción
                const { hash } = yield this.write('auditHardware', [serial, passed, reportHash], {
                    role: 'AUDITOR_HW_ROLE',
                    userAddress: userAddress,
                    relatedSerial: serial
                });
                // Esperar confirmación
                const receipt = yield this.waitForTransaction(hash);
                // Save to MongoDB via API route
                try {
                    yield fetch('/api/mongodb/supply-chain-actions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            serialNumber: serial,
                            transactionHash: hash,
                            role: 'AUDITOR_HW_ROLE',
                            userAddress,
                            data: { passed, reportHash }
                        })
                    });
                }
                catch (apiError) {
                    console.error('Error saving to MongoDB via API:', apiError);
                }
                // Invalidar caché
                this.invalidateCache(`getNetbook:${serial}`);
                return {
                    success: true,
                    hash
                };
            }
            catch (error) {
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Error desconocido'
                };
            }
        });
        /**
         * Validación del software de una netbook
         * @param serial Número de serie
         * @param osVersion Versión del sistema operativo
         * @param passed Si el software pasó la validación
         * @param userAddress Dirección del usuario
         * @returns Resultado de la transacción
         */
        this.validateSoftware = (serial, osVersion, passed, userAddress) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Validar entrada
                schemas_1.ValidateSoftwareSchema.parse({ serial, osVersion, passed });
                // Realizar transacción
                const { hash } = yield this.write('validateSoftware', [serial, osVersion, passed], {
                    role: 'TECNICO_SW_ROLE',
                    userAddress: userAddress,
                    relatedSerial: serial
                });
                // Esperar confirmación
                const receipt = yield this.waitForTransaction(hash);
                // Save to MongoDB via API route
                try {
                    yield fetch('/api/mongodb/supply-chain-actions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            serialNumber: serial,
                            transactionHash: hash,
                            role: 'TECNICO_SW_ROLE',
                            userAddress,
                            data: { osVersion, passed }
                        })
                    });
                }
                catch (apiError) {
                    console.error('Error saving to MongoDB via API:', apiError);
                }
                // Invalidar caché
                this.invalidateCache(`getNetbook:${serial}`);
                return {
                    success: true,
                    hash
                };
            }
            catch (error) {
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Error desconocido'
                };
            }
        });
        /**
         * Asignación de una netbook a un estudiante
         * @param serial Número de serie
         * @param schoolHash Hash de la escuela
         * @param studentHash Hash del estudiante
         * @param userAddress Dirección del usuario
         * @returns Resultado de la transacción
         */
        this.assignToStudent = (serial, schoolHash, studentHash, userAddress) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Validar entrada
                schemas_1.AssignToStudentSchema.parse({ serial, schoolHash, studentHash });
                // Realizar transacción
                const { hash } = yield this.write('assignToStudent', [serial, schoolHash, studentHash], {
                    role: 'ESCUELA_ROLE',
                    userAddress: userAddress,
                    relatedSerial: serial
                });
                // Esperar confirmación
                const receipt = yield this.waitForTransaction(hash);
                // Save to MongoDB via API route
                try {
                    yield fetch('/api/mongodb/supply-chain-actions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            serialNumber: serial,
                            transactionHash: hash,
                            role: 'ESCUELA_ROLE',
                            userAddress,
                            data: { schoolHash, studentHash }
                        })
                    });
                }
                catch (apiError) {
                    console.error('Error saving to MongoDB via API:', apiError);
                }
                // Invalidar caché
                this.invalidateCache(`getNetbook:${serial}`);
                return {
                    success: true,
                    hash
                };
            }
            catch (error) {
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Error desconocido'
                };
            }
        });
        /**
         * Obtiene el estado actual de una netbook
         * @param serial Número de serie
         * @returns Estado de la netbook
         */
        this.getNetbookState = (serial) => __awaiter(this, void 0, void 0, function* () {
            // Validar entrada
            zod_1.z.string().min(1).parse(serial);
            // Leer estado
            const result = yield this.read('getNetbookState', [serial]);
            // Mapear número a estado
            const states = ['FABRICADA', 'HW_APROBADO', 'SW_VALIDADO', 'DISTRIBUIDA'];
            return states[result];
        });
        /**
         * Obtiene el reporte completo de una netbook
         * @param serial Número de serie
         * @returns Reporte completo de la netbook
         */
        this.getNetbookReport = (serial) => __awaiter(this, void 0, void 0, function* () {
            // Validar entrada
            zod_1.z.string().min(1).parse(serial);
            // Leer reporte
            const result = yield this.read('getNetbookReport', [serial]);
            // Asegurar que distributionTimestamp sea string
            const distributionTimestamp = typeof result.distributionTimestamp === 'string'
                ? result.distributionTimestamp
                : typeof result.distributionTimestamp === 'number'
                    ? result.distributionTimestamp.toString()
                    : '0';
            // Transformar datos
            const states = ['FABRICADA', 'HW_APROBADO', 'SW_VALIDADO', 'DISTRIBUIDA'];
            return {
                serialNumber: typeof result.serialNumber === 'string' ? result.serialNumber : '',
                batchId: typeof result.batchId === 'string' ? result.batchId : '',
                initialModelSpecs: typeof result.initialModelSpecs === 'string' ? result.initialModelSpecs : '',
                hwAuditor: typeof result.hwAuditor === 'string' ? result.hwAuditor : '',
                hwIntegrityPassed: typeof result.hwIntegrityPassed === 'boolean' ? result.hwIntegrityPassed : false,
                hwReportHash: typeof result.hwReportHash === 'string' ? result.hwReportHash : '',
                swTechnician: typeof result.swTechnician === 'string' ? result.swTechnician : '',
                osVersion: typeof result.osVersion === 'string' ? result.osVersion : '',
                swValidationPassed: typeof result.swValidationPassed === 'boolean' ? result.swValidationPassed : false,
                destinationSchoolHash: typeof result.destinationSchoolHash === 'string' ? result.destinationSchoolHash : '',
                studentIdHash: typeof result.studentIdHash === 'string' ? result.studentIdHash : '',
                distributionTimestamp,
                currentState: states[Number(result.currentState)] || 'FABRICADA'
            };
        });
        /**
         * Obtiene todos los números de serie registrados
         * @returns Array de números de serie
         */
        this.getAllSerialNumbers = () => __awaiter(this, void 0, void 0, function* () {
            // Leer todos los números de serie
            const result = yield this.read('getAllSerialNumbers', []);
            return Array.isArray(result) ? result : [];
        });
        /**
         * Obtiene todas las netbooks por estado
         * @param state Estado de las netbooks a obtener
         * @returns Array de números de serie
         */
        this.getNetbooksByState = (state) => __awaiter(this, void 0, void 0, function* () {
            // Leer netbooks por estado
            const result = yield this.read('getNetbooksByState', [state]);
            return result;
        });
        /**
         * Obtiene todos los miembros de un rol
         * @param roleHash Hash del rol
         * @returns Array de direcciones de miembros
         */
        this.getAllMembers = (roleHash) => __awaiter(this, void 0, void 0, function* () {
            // Leer todos los miembros del rol
            const result = yield this.read('getAllMembers', [roleHash]);
            return result;
        });
        /**
         * Obtiene los miembros de un rol
         * @param roleHash Hash del rol
         * @returns Array de direcciones de miembros
         */
        this.getRoleMembers = (roleHash) => __awaiter(this, void 0, void 0, function* () {
            // Leer miembros del rol
            const result = yield this.read('getRoleMembers', [roleHash]);
            return Array.isArray(result) ? result : [];
        });
        this.getRoleCounts = () => __awaiter(this, void 0, void 0, function* () {
            const roleHashes = yield Promise.resolve().then(() => __importStar(require('@/lib/roleUtils'))).then(m => m.getRoleHashes());
            const counts = {
                'FABRICANTE_ROLE': 0,
                'AUDITOR_HW_ROLE': 0,
                'TECNICO_SW_ROLE': 0,
                'ESCUELA_ROLE': 0,
                'DEFAULT_ADMIN_ROLE': 0
            };
            for (const [role, hash] of Object.entries(roleHashes)) {
                const members = yield this.getRoleMembers(hash);
                const contractRole = `${role}_ROLE`;
                counts[contractRole] = members.length;
            }
            return counts;
        });
        this.getAccountBalance = (userAddress) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Asumimos que el contrato tiene una función para obtener el balance
                // Si no existe, retornamos '0'
                return '0';
            }
            catch (error) {
                console.error('Error getting account balance:', error);
                return '0';
            }
        });
        /**
         * Otorga un rol a una dirección
         * @param roleHash Hash del rol
         * @param userAddress Dirección del usuario
         * @returns Resultado de la transacción
         */
        this.grantRole = (roleHash, userAddress) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { hash } = yield this.write('grantRole', [roleHash, userAddress], {
                    role: 'DEFAULT_ADMIN_ROLE',
                    userAddress: userAddress,
                    relatedSerial: undefined
                });
                const receipt = yield this.waitForTransaction(hash);
                // Guardar en MongoDB
                try {
                    yield fetch('/api/mongodb/supply-chain-actions', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            transactionHash: hash,
                            role: 'DEFAULT_ADMIN_ROLE',
                            userAddress,
                            data: { roleHash }
                        })
                    });
                }
                catch (apiError) {
                    console.error('Error saving to MongoDB via API:', apiError);
                }
                this.invalidateCache('getRoleMembers');
                this.invalidateCache('getAllRolesSummary');
                return { success: true, hash };
            }
            catch (error) {
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Error desconocido'
                };
            }
        });
        /**
         * Revoca un rol de una dirección
         * @param roleHash Hash del rol
         * @param userAddress Dirección del usuario
         * @returns Resultado de la transacción
         */
        this.revokeRole = (roleHash, userAddress) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { hash } = yield this.write('revokeRole', [roleHash, userAddress], {
                    role: 'DEFAULT_ADMIN_ROLE',
                    userAddress: userAddress,
                    relatedSerial: undefined
                });
                const receipt = yield this.waitForTransaction(hash);
                // Guardar en MongoDB
                try {
                    yield fetch('/api/mongodb/supply-chain-actions', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            transactionHash: hash,
                            role: 'DEFAULT_ADMIN_ROLE',
                            userAddress,
                            data: { roleHash }
                        })
                    });
                }
                catch (apiError) {
                    console.error('Error saving to MongoDB via API:', apiError);
                }
                this.invalidateCache('getRoleMembers');
                this.invalidateCache('getAllRolesSummary');
                return { success: true, hash };
            }
            catch (error) {
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Error desconocido'
                };
            }
        });
    }
}
exports.SupplyChainService = SupplyChainService;
