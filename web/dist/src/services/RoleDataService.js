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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleDataService = void 0;
const mongodb_1 = require("@/lib/mongodb");
/**
 * Service to handle role data persistence in MongoDB
 */
class RoleDataService {
    /**
     * Save role action data to MongoDB
     * @param params Role data parameters
     * @returns Saved role data
     */
    static saveRoleData(params) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const roleData = yield mongodb_1.mongodbService.saveRoleData({
                    transactionHash: params.transactionHash,
                    role: params.role,
                    userAddress: params.userAddress,
                    data: params.data,
                    timestamp: params.timestamp || new Date()
                });
                console.log(`[RoleDataService] Saved role data for transaction ${params.transactionHash}`);
                return roleData;
            }
            catch (error) {
                console.error('[RoleDataService] Error saving role data:', error);
                throw error;
            }
        });
    }
    /**
     * Save netbook data to MongoDB
     * @param params Netbook data parameters
     * @returns Saved netbook data
     */
    static saveNetbookData(params) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const netbookData = yield mongodb_1.mongodbService.saveNetbookData({
                    serialNumber: params.serialNumber,
                    transactionHash: params.transactionHash,
                    role: params.role,
                    userAddress: params.userAddress,
                    data: params.data,
                    timestamp: params.timestamp || new Date()
                });
                console.log(`[RoleDataService] Saved netbook data for serial ${params.serialNumber}, transaction ${params.transactionHash}`);
                return netbookData;
            }
            catch (error) {
                console.error('[RoleDataService] Error saving netbook data:', error);
                throw error;
            }
        });
    }
    /**
     * Get role data by transaction hash
     * @param transactionHash Transaction hash
     * @returns Role data or null
     */
    static getRoleDataByTransactionHash(transactionHash) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield mongodb_1.mongodbService.getRoleDataByTransactionHash(transactionHash);
            }
            catch (error) {
                console.error('[RoleDataService] Error getting role data by transaction hash:', error);
                throw error;
            }
        });
    }
    /**
     * Get role data by role
     * @param role Role name
     * @returns Array of role data
     */
    static getRoleDataByRole(role) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield mongodb_1.mongodbService.getRoleDataByRole(role);
            }
            catch (error) {
                console.error('[RoleDataService] Error getting role data by role:', error);
                throw error;
            }
        });
    }
    /**
     * Get role data by user address
     * @param userAddress User address
     * @returns Array of role data
     */
    static getRoleDataByUser(userAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield mongodb_1.mongodbService.getRoleDataByUser(userAddress);
            }
            catch (error) {
                console.error('[RoleDataService] Error getting role data by user:', error);
                throw error;
            }
        });
    }
    /**
     * Get netbook data by serial number
     * @param serialNumber Serial number
     * @returns Array of netbook data
     */
    static getNetbookDataBySerial(serialNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield mongodb_1.mongodbService.getNetbookDataBySerial(serialNumber);
            }
            catch (error) {
                console.error('[RoleDataService] Error getting netbook data by serial:', error);
                throw error;
            }
        });
    }
    /**
     * Get netbook data by transaction hash
     * @param transactionHash Transaction hash
     * @returns Netbook data or null
     */
    static getNetbookDataByTransactionHash(transactionHash) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield mongodb_1.mongodbService.getNetbookDataByTransactionHash(transactionHash);
            }
            catch (error) {
                console.error('[RoleDataService] Error getting netbook data by transaction hash:', error);
                throw error;
            }
        });
    }
    /**
     * Get netbook data by serial number and role
     * @param serialNumber Serial number
     * @param role Role name
     * @returns Netbook data or null
     */
    static getNetbookDataByRole(serialNumber, role) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield mongodb_1.mongodbService.getNetbookDataByRole(serialNumber, role);
            }
            catch (error) {
                console.error('[RoleDataService] Error getting netbook data by role:', error);
                throw error;
            }
        });
    }
    /**
     * Get all netbook data across all roles
     * @param serialNumber Serial number
     * @returns Array of netbook data
     */
    static getAllNetbookData(serialNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield mongodb_1.mongodbService.getAllNetbookData(serialNumber);
            }
            catch (error) {
                console.error('[RoleDataService] Error getting all netbook data:', error);
                throw error;
            }
        });
    }
}
exports.RoleDataService = RoleDataService;
