"use strict";
// web/src/lib/metadata-validation.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatValidationErrors = exports.sanitizeMetadata = exports.validateStateSpecificMetadata = exports.validateNetbookMetadata = exports.NETBOOK_METADATA_SCHEMA = void 0;
// Esquema de validación para metadata de netbooks
exports.NETBOOK_METADATA_SCHEMA = {
    serialNumber: {
        required: true,
        type: 'string',
        pattern: /^[A-Z0-9]{8,16}$/,
        message: 'Serial number debe ser alfanumérico (8-16 caracteres)'
    },
    batchId: {
        required: true,
        type: 'string',
        pattern: /^BATCH-[A-Z0-9]{6}$/,
        message: 'Batch ID debe tener formato BATCH-XXXXXX'
    },
    initialModelSpecs: {
        required: true,
        type: 'string',
        minLength: 10,
        maxLength: 500,
        message: 'Especificaciones deben tener 10-500 caracteres'
    },
    hwIntegrityPassed: {
        required: false,
        type: 'boolean',
        message: 'hwIntegrityPassed debe ser booleano'
    },
    hwReportHash: {
        required: false,
        type: 'string',
        pattern: /^0x[a-fA-F0-9]{64}$/,
        message: 'Hash de reporte debe ser un hash SHA256 válido'
    },
    osVersion: {
        required: false,
        type: 'string',
        pattern: /^[0-9]+\.[0-9]+(\.[0-9]+)?$/,
        message: 'Versión de OS debe ser semántica (X.Y.Z)'
    },
    swValidationPassed: {
        required: false,
        type: 'boolean',
        message: 'swValidationPassed debe ser booleano'
    },
    destinationSchoolHash: {
        required: false,
        type: 'string',
        pattern: /^0x[a-fA-F0-9]{64}$/,
        message: 'Hash de escuela debe ser un hash SHA256 válido'
    },
    studentIdHash: {
        required: false,
        type: 'string',
        pattern: /^0x[a-fA-F0-9]{64}$/,
        message: 'Hash de estudiante debe ser un hash SHA256 válido'
    }
};
// Validar metadata contra el esquema
const validateNetbookMetadata = (metadata, currentState) => {
    const errors = [];
    const warnings = [];
    // Validar campos requeridos
    Object.entries(exports.NETBOOK_METADATA_SCHEMA).forEach(([field, rules]) => {
        const value = metadata[field];
        // Campo requerido pero no presente
        if (rules.required && (value === undefined || value === null || value === '')) {
            errors.push(`Campo requerido: ${field}`);
            return;
        }
        // Validar tipo
        if (value !== undefined && value !== null) {
            if (rules.type === 'string' && typeof value !== 'string') {
                errors.push(`${field}: debe ser string`);
            }
            else if (rules.type === 'boolean' && typeof value !== 'boolean') {
                errors.push(`${field}: debe ser booleano`);
            }
        }
        // Validar patrón regex
        if ('pattern' in rules && rules.pattern && value && typeof value === 'string') {
            if (!rules.pattern.test(value)) {
                errors.push(`${field}: ${rules.message}`);
            }
        }
        // Validar longitud
        if ('minLength' in rules && rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
            errors.push(`${field}: mínimo ${rules.minLength} caracteres`);
        }
        if ('maxLength' in rules && rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
            errors.push(`${field}: máximo ${rules.maxLength} caracteres`);
        }
    });
    // Validaciones específicas por estado
    if (currentState) {
        (0, exports.validateStateSpecificMetadata)(metadata, currentState, errors, warnings);
    }
    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
};
exports.validateNetbookMetadata = validateNetbookMetadata;
// Validaciones específicas por estado
const validateStateSpecificMetadata = (metadata, currentState, errors, warnings) => {
    switch (currentState) {
        case 'HW_APROBADO':
            if (!metadata.hwIntegrityPassed && metadata.hwIntegrityPassed !== false) {
                errors.push('hwIntegrityPassed es requerido para estado HW_APROBADO');
            }
            if (!metadata.hwReportHash) {
                warnings.push('Se recomienda agregar hash del reporte de hardware');
            }
            break;
        case 'SW_VALIDADO':
            if (!metadata.swValidationPassed && metadata.swValidationPassed !== false) {
                errors.push('swValidationPassed es requerido para estado SW_VALIDADO');
            }
            if (!metadata.osVersion) {
                warnings.push('Se recomienda especificar la versión del OS');
            }
            break;
        case 'DISTRIBUIDA':
            if (!metadata.destinationSchoolHash) {
                errors.push('destinationSchoolHash es requerido para estado DISTRIBUIDA');
            }
            if (!metadata.studentIdHash) {
                errors.push('studentIdHash es requerido para estado DISTRIBUIDA');
            }
            break;
    }
};
exports.validateStateSpecificMetadata = validateStateSpecificMetadata;
// Sanitizar metadata (eliminar campos no deseados)
const sanitizeMetadata = (metadata) => {
    const allowedFields = Object.keys(exports.NETBOOK_METADATA_SCHEMA);
    const sanitized = {};
    Object.entries(metadata).forEach(([key, value]) => {
        if (allowedFields.includes(key)) {
            sanitized[key] = value;
        }
    });
    return sanitized;
};
exports.sanitizeMetadata = sanitizeMetadata;
// Formatear errores para mostrar al usuario
const formatValidationErrors = (result) => {
    if (result.isValid) {
        return 'Metadata válida';
    }
    return `Errores de validación:\n${result.errors.join('\n')}${result.warnings.length > 0 ? `\nAdvertencias:\n${result.warnings.join('\n')}` : ''}`;
};
exports.formatValidationErrors = formatValidationErrors;
