"use strict";
'use server';
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardData = getDashboardData;
function getDashboardData() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Dynamically import serverRpc functions to avoid build-time evaluation issues
            const { getAllSerialNumbers, getRoleMemberCount, getNetbooksByState } = yield Promise.resolve().then(() => __importStar(require('@/lib/api/serverRpc')));
            // Get all serial numbers
            const serialNumbers = yield getAllSerialNumbers();
            // Get role hashes from our utility
            const { FABRICANTE, AUDITOR_HW, TECNICO_SW, ESCUELA } = yield Promise.resolve().then(() => __importStar(require('@/lib/roleUtils'))).then(({ getRoleHashes }) => getRoleHashes());
            // Get role members
            const [fabricanteCount, auditorHwCount, tecnicoSwCount, escuelaCount] = yield Promise.all([
                getRoleMemberCount(FABRICANTE),
                getRoleMemberCount(AUDITOR_HW),
                getRoleMemberCount(TECNICO_SW),
                getRoleMemberCount(ESCUELA)
            ]);
            // Get netbook counts by state
            const [fabricadaSerials, hwAprobadaSerials, swValidadaSerials, distribuidaSerials] = yield Promise.all([
                getNetbooksByState(0),
                getNetbooksByState(1),
                getNetbooksByState(2),
                getNetbooksByState(3)
            ]);
            return {
                fabricanteCount,
                auditorHwCount,
                tecnicoSwCount,
                escuelaCount,
                totalFabricadas: fabricadaSerials.length,
                totalHwAprobadas: hwAprobadaSerials.length,
                totalSwValidadas: swValidadaSerials.length,
                totalDistribuidas: distribuidaSerials.length
            };
        }
        catch (error) {
            console.error('Error fetching dashboard data:', error);
            return {
                fabricanteCount: 0,
                auditorHwCount: 0,
                tecnicoSwCount: 0,
                escuelaCount: 0,
                totalFabricadas: 0,
                totalHwAprobadas: 0,
                totalSwValidadas: 0,
                totalDistribuidas: 0
            };
        }
    });
}
