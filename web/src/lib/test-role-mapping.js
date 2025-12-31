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
exports.testRoleMapping = testRoleMapping;
// Script de prueba para verificar el mapeo de roles
const roleUtils_1 = require("./roleUtils");
function testRoleMapping() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('=== Testing Role Mapping ===');
        try {
            const roleHashes = yield (0, roleUtils_1.getRoleHashes)();
            console.log('Available role hashes keys:', Object.keys(roleHashes));
            // Test cases para verificar el mapeo
            const testCases = [
                'FABRICANTE',
                'FABRICANTE_ROLE',
                'AUDITOR_HW',
                'AUDITOR_HW_ROLE',
                'TECNICO_SW',
                'TECNICO_SW_ROLE',
                'ESCUELA',
                'ESCUELA_ROLE',
                'ADMIN',
                'DEFAULT_ADMIN_ROLE',
                'DEFAULT_ADMIN'
            ];
            const roleKeyMap = {
                'FABRICANTE': 'FABRICANTE',
                'FABRICANTE_ROLE': 'FABRICANTE',
                'AUDITOR_HW': 'AUDITOR_HW',
                'AUDITOR_HW_ROLE': 'AUDITOR_HW',
                'TECNICO_SW': 'TECNICO_SW',
                'TECNICO_SW_ROLE': 'TECNICO_SW',
                'ESCUELA': 'ESCUELA',
                'ESCUELA_ROLE': 'ESCUELA',
                'ADMIN': 'ADMIN',
                'DEFAULT_ADMIN_ROLE': 'ADMIN',
                'DEFAULT_ADMIN': 'ADMIN'
            };
            for (const role of testCases) {
                const roleKey = roleKeyMap[role] || role;
                if (roleKey in roleHashes) {
                    const hash = roleHashes[roleKey];
                    console.log(`✅ ${role} -> ${roleKey}: ${hash}`);
                }
                else {
                    console.log(`❌ ${role} -> ${roleKey}: NOT FOUND`);
                }
            }
            console.log('=== Role Mapping Test Complete ===');
        }
        catch (error) {
            console.error('Error testing role mapping:', error);
        }
    });
}
// Ejecutar la prueba si este archivo se ejecuta directamente
if (require.main === module) {
    testRoleMapping();
}
