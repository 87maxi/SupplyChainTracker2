"use strict";
// web/src/lib/validation/schemas.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignToStudentSchema = exports.ValidateSoftwareSchema = exports.AuditHardwareSchema = exports.RegisterNetbooksSchema = exports.RoleSchema = exports.OsVersionSchema = exports.HashSchema = exports.ModelSpecsSchema = exports.BatchIdSchema = exports.SerialNumberSchema = exports.AddressSchema = void 0;
const zod_1 = require("zod");
// Esquema para validación de direcciones de Ethereum
exports.AddressSchema = zod_1.z
    .string()
    .min(1, 'La dirección es requerida')
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Debe ser una dirección hexadecimal válida (0x...)')
    .describe('Dirección de Ethereum');
// Esquema para validación de serial numbers de netbooks
exports.SerialNumberSchema = zod_1.z
    .string()
    .min(1, 'El número de serie es requerido')
    .max(100, 'El número de serie no debe exceder 100 caracteres')
    .regex(/^[a-zA-Z0-9-]+$/, 'Solo se permiten letras, números y guiones')
    .describe('Número de serie de netbook');
// Esquema para validación de batch IDs
exports.BatchIdSchema = zod_1.z
    .string()
    .min(1, 'El ID de lote es requerido')
    .max(50, 'El ID de lote no debe exceder 50 caracteres')
    .regex(/^[a-zA-Z0-9-]+$/, 'Solo se permiten letras, números y guiones')
    .describe('ID de lote de producción');
// Esquema para validación de especificaciones del modelo
exports.ModelSpecsSchema = zod_1.z
    .string()
    .min(1, 'Las especificaciones del modelo son requeridas')
    .max(500, 'Las especificaciones no deben exceder 500 caracteres')
    .describe('Especificaciones técnicas del modelo');
// Esquema para validación de hashes (reporte de auditoría, etc.)
exports.HashSchema = zod_1.z
    .string()
    .min(1, 'El hash es requerido')
    .regex(/^0x[a-fA-F0-9]{64}$/, 'Debe ser un hash SHA-256 válido (0x...)')
    .describe('Hash criptográfico');
// Esquema para validación de versiones de sistema operativo
exports.OsVersionSchema = zod_1.z
    .string()
    .min(1, 'La versión del sistema operativo es requerida')
    .max(50, 'La versión no debe exceder 50 caracteres')
    .regex(/^[0-9]+\.[0-9]+\.[0-9]+$/, 'Debe tener formato major.minor.patch')
    .describe('Versión del sistema operativo');
// Esquema para validación de roles
exports.RoleSchema = zod_1.z.enum([
    'DEFAULT_ADMIN_ROLE',
    'FABRICANTE_ROLE',
    'AUDITOR_HW_ROLE',
    'TECNICO_SW_ROLE',
    'ESCUELA_ROLE'
]);
// Esquema combinado para el registro de múltiples netbooks
exports.RegisterNetbooksSchema = zod_1.z.object({
    serials: zod_1.z.array(exports.SerialNumberSchema).min(1, 'Debe registrar al menos una netbook'),
    batches: zod_1.z.array(exports.BatchIdSchema),
    specs: zod_1.z.array(exports.ModelSpecsSchema),
}).refine(data => data.serials.length === data.batches.length &&
    data.serials.length === data.specs.length, {
    message: 'Las longitudes de los arrays deben coincidir',
    path: ['batches'] // Asociar el error con el campo batches
});
// Esquema para validación de auditoría de hardware
exports.AuditHardwareSchema = zod_1.z.object({
    serial: exports.SerialNumberSchema,
    passed: zod_1.z.boolean(),
    reportHash: exports.HashSchema
});
// Esquema para validación de validación de software
exports.ValidateSoftwareSchema = zod_1.z.object({
    serial: exports.SerialNumberSchema,
    osVersion: exports.OsVersionSchema,
    passed: zod_1.z.boolean()
});
// Esquema para validación de asignación a estudiante
exports.AssignToStudentSchema = zod_1.z.object({
    serial: exports.SerialNumberSchema,
    schoolHash: exports.HashSchema,
    studentHash: exports.HashSchema
});
