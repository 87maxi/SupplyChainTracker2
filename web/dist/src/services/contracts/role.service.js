"use strict";
// web/src/services/contracts/role.service.ts
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
exports.RoleService = void 0;
const base_contract_service_1 = require("./base-contract.service");
const SupplyChainTracker_json_1 = __importDefault(require("@/contracts/abi/SupplyChainTracker.json"));
const env_1 = require("@/lib/env");
const cache_service_1 = require("@/lib/cache/cache-service");
const roleUtils_1 = require("@/lib/roleUtils");
/**
 * Servicio para gestionar roles en el contrato inteligente
 */
class RoleService extends base_contract_service_1.BaseContractService {
    constructor() {
        super(env_1.NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS, SupplyChainTracker_json_1.default, 'role');
        this.logger = console;
        /**
         * Verifica si una dirección tiene un rol específico
         * @param roleName Nombre del rol
         * @param userAddress Dirección del usuario
         * @returns True si tiene el rol, false en caso contrario
         */
        this.hasRole = (roleName, userAddress) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Obtener hash del rol
                const roleHashes = yield (0, roleUtils_1.getRoleHashes)();
                // Mapeo de nombres de roles ContractRoles a las claves esperadas por getRoleByName
                // Remueve '_ROLE' del nombre para que coincida con lo esperado por getRoleByName
                const roleKeyMap = {
                    'DEFAULT_ADMIN_ROLE': 'ADMIN',
                    'FABRICANTE_ROLE': 'FABRICANTE',
                    'AUDITOR_HW_ROLE': 'AUDITOR_HW',
                    'TECNICO_SW_ROLE': 'TECNICO_SW',
                    'ESCUELA_ROLE': 'ESCUELA'
                };
                // Verificar que roleName sea válido
                if (!roleKeyMap[roleName]) {
                    throw new Error(`Nombre de rol inválido: ${roleName}`);
                }
                const roleKey = roleKeyMap[roleName];
                const roleHash = roleHashes[roleKey];
                if (!roleHash) {
                    throw new Error(`Rol ${roleName} no encontrado: ${roleKey}. Hash no definido.`);
                }
                // Leer del contrato
                // Properties are initialized in constructor, so this check is redundant but kept as defensive programming
                if (!this.contractAddress || !this.abi) {
                    throw new Error('Contract configuration is not initialized');
                }
                const result = yield this.read('hasRole', [roleHash, userAddress]);
                console.log('[RoleService] Verificación de rol:', { roleName, roleHash, userAddress, result });
                return result;
            }
            catch (error) {
                console.error('[RoleService] Error en hasRole:', error);
                throw error;
            }
        });
        /**
         * Otorga un rol a una dirección
         * @param roleName Nombre del rol
         * @param userAddress Dirección del usuario
         * @returns Resultado de la transacción
         */
        this.grantRole = (roleName, userAddress) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Obtener hash del rol
                const roleHashes = yield (0, roleUtils_1.getRoleHashes)();
                // Mapeo de nombres de roles ContractRoles a las claves esperadas por getRoleByName
                // Remueve '_ROLE' del nombre para que coincida con lo esperado por getRoleByName
                const roleKeyMap = {
                    'DEFAULT_ADMIN_ROLE': 'ADMIN',
                    'FABRICANTE_ROLE': 'FABRICANTE',
                    'AUDITOR_HW_ROLE': 'AUDITOR_HW',
                    'TECNICO_SW_ROLE': 'TECNICO_SW',
                    'ESCUELA_ROLE': 'ESCUELA'
                };
                // Verificar que roleName sea válido
                if (!roleKeyMap[roleName]) {
                    return { success: false, error: `Nombre de rol inválido: ${roleName}` };
                }
                const roleKey = roleKeyMap[roleName];
                const roleHash = roleHashes[roleKey];
                if (!roleHash) {
                    return { success: false, error: `Hash no encontrado para el rol: ${roleName}` };
                }
                // Realizar transacción
                const { hash } = yield this.write('grantRole', [roleHash, userAddress]);
                // Esperar confirmación
                const receipt = yield this.waitForTransaction(hash);
                // Invalidar caché
                this.invalidateCache(`hasRole:${userAddress}`);
                this.invalidateCache(`getAllMembers`);
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
         * Revoca un rol de una dirección
         * @param roleName Nombre del rol
         * @param userAddress Dirección del usuario
         * @returns Resultado de la transacción
         */
        this.revokeRole = (roleName, userAddress) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Obtener hash del rol
                const roleHashes = yield (0, roleUtils_1.getRoleHashes)();
                // Mapeo de nombres de roles ContractRoles a las claves esperadas por getRoleByName
                // Remueve '_ROLE' del nombre para que coincida con lo esperado por getRoleByName
                const roleKeyMap = {
                    'DEFAULT_ADMIN_ROLE': 'ADMIN',
                    'FABRICANTE_ROLE': 'FABRICANTE',
                    'AUDITOR_HW_ROLE': 'AUDITOR_HW',
                    'TECNICO_SW_ROLE': 'TECNICO_SW',
                    'ESCUELA_ROLE': 'ESCUELA'
                };
                // Verificar que roleName sea válido
                if (!roleKeyMap[roleName]) {
                    return { success: false, error: `Nombre de rol inválido: ${roleName}` };
                }
                const roleKey = roleKeyMap[roleName];
                const roleHash = roleHashes[roleKey];
                if (!roleHash) {
                    return { success: false, error: `Hash no encontrado para el rol: ${roleName}` };
                }
                // Realizar transacción
                const { hash } = yield this.write('revokeRole', [roleHash, userAddress]);
                // Esperar confirmación
                const receipt = yield this.waitForTransaction(hash);
                // Invalidar caché
                this.invalidateCache(`hasRole:${userAddress}`);
                this.invalidateCache(`getAllMembers`);
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
         * Obtiene todos los miembros de un rol
         * @param roleName Nombre del rol
         * @returns Miembros del rol
         */
        this.getRoleMembers = (roleName) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Intentar obtener de caché primero
                const cacheKey = `getRoleMembers:${roleName}`;
                const cached = cache_service_1.CacheService.get(cacheKey);
                if (cached) {
                    return cached;
                }
                // Obtener hash del rol
                const roleHashes = yield (0, roleUtils_1.getRoleHashes)();
                // Mapeo de nombres de roles ContractRoles a las claves esperadas por getRoleByName
                // Remueve '_ROLE' del nombre para que coincida con lo esperado por getRoleByName
                const roleKeyMap = {
                    'DEFAULT_ADMIN_ROLE': 'ADMIN',
                    'FABRICANTE_ROLE': 'FABRICANTE',
                    'AUDITOR_HW_ROLE': 'AUDITOR_HW',
                    'TECNICO_SW_ROLE': 'TECNICO_SW',
                    'ESCUELA_ROLE': 'ESCUELA'
                };
                // Verificar que roleName sea válido
                if (!roleKeyMap[roleName]) {
                    throw new Error(`Nombre de rol inválido: ${roleName}`);
                }
                const roleKey = roleKeyMap[roleName];
                const roleHash = roleHashes[roleKey];
                if (!roleHash) {
                    throw new Error(`Rol ${roleName} no encontrado: ${roleKey}. Hash no definido.`);
                }
                // Leer del contrato
                const members = yield this.read('getAllMembers', [roleHash]);
                // Preparar resultado
                const result = {
                    role: roleName,
                    members,
                    count: members.length
                };
                // Almacenar en caché
                cache_service_1.CacheService.set(cacheKey, result);
                return result;
            }
            catch (error) {
                throw error;
            }
        });
        /**
         * Obtiene todos los miembros de todos los roles
         * @returns Mapa de roles con sus miembros
         */
        this.getAllRolesSummary = () => __awaiter(this, void 0, void 0, function* () {
            try {
                // Intentar obtener de caché primero
                const cacheKey = 'getAllRolesSummary';
                const cached = cache_service_1.CacheService.get(cacheKey);
                if (cached) {
                    return cached;
                }
                // Obtener todos los nombres de roles
                const roleNames = [
                    'DEFAULT_ADMIN_ROLE',
                    'FABRICANTE_ROLE',
                    'AUDITOR_HW_ROLE',
                    'TECNICO_SW_ROLE',
                    'ESCUELA_ROLE'
                ];
                // Obtener miembros de cada rol concurrentemente
                const results = yield Promise.all(roleNames.map((roleName) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        const members = yield this.getRoleMembers(roleName);
                        return [roleName, members];
                    }
                    catch (error) {
                        console.error(`Error obteniendo miembros de ${roleName}:`, error);
                        return [roleName, { role: roleName, members: [], count: 0 }];
                    }
                })));
                // Convertir a objeto
                const summary = Object.fromEntries(results);
                // Almacenar en caché
                cache_service_1.CacheService.set(cacheKey, summary);
                return summary;
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.RoleService = RoleService;
