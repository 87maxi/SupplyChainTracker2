"use strict";
// web/src/lib/role-validation.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCriticalAction = exports.CRITICAL_ACTIONS = exports.validateAccess = exports.getUserPermissions = exports.hasAnyPermission = exports.hasAllPermissions = exports.hasPermission = exports.ROLE_PERMISSIONS = void 0;
// Permisos específicos para cada rol
exports.ROLE_PERMISSIONS = {
    DEFAULT_ADMIN_ROLE: [
        'manage_roles',
        'view_all_data',
        'manage_system',
        'override_permissions'
    ],
    FABRICANTE_ROLE: [
        'create_tokens',
        'view_own_tokens',
        'update_manufacturing_data'
    ],
    AUDITOR_HW_ROLE: [
        'approve_hardware',
        'view_hardware_data',
        'create_hardware_reports'
    ],
    TECNICO_SW_ROLE: [
        'validate_software',
        'view_software_data',
        'update_software_info'
    ],
    ESCUELA_ROLE: [
        'distribute_tokens',
        'view_distribution_data',
        'manage_student_assignments'
    ]
};
// Validar si un usuario tiene un permiso específico
const hasPermission = (userRoles, requiredPermission) => {
    return userRoles.some(role => { var _a; return (_a = exports.ROLE_PERMISSIONS[role]) === null || _a === void 0 ? void 0 : _a.includes(requiredPermission); });
};
exports.hasPermission = hasPermission;
// Validar múltiples permisos
const hasAllPermissions = (userRoles, requiredPermissions) => {
    return requiredPermissions.every(permission => (0, exports.hasPermission)(userRoles, permission));
};
exports.hasAllPermissions = hasAllPermissions;
// Validar al menos uno de los permisos
const hasAnyPermission = (userRoles, requiredPermissions) => {
    return requiredPermissions.some(permission => (0, exports.hasPermission)(userRoles, permission));
};
exports.hasAnyPermission = hasAnyPermission;
// Obtener todos los permisos de un usuario
const getUserPermissions = (userRoles) => {
    const permissions = new Set();
    userRoles.forEach(role => {
        var _a;
        (_a = exports.ROLE_PERMISSIONS[role]) === null || _a === void 0 ? void 0 : _a.forEach(permission => {
            permissions.add(permission);
        });
    });
    return Array.from(permissions);
};
exports.getUserPermissions = getUserPermissions;
// Validar acceso a una funcionalidad específica
const validateAccess = (userRoles, requiredPermission, resourceOwner, currentUser) => {
    // Validar permiso básico
    if (!(0, exports.hasPermission)(userRoles, requiredPermission)) {
        return {
            hasAccess: false,
            reason: 'Permisos insuficientes para esta acción'
        };
    }
    // Validar ownership si es aplicable
    if (resourceOwner && currentUser && resourceOwner !== currentUser) {
        // Solo admin puede acceder a recursos de otros usuarios
        if (!(0, exports.hasPermission)(userRoles, 'view_all_data')) {
            return {
                hasAccess: false,
                reason: 'Solo puede acceder a sus propios recursos'
            };
        }
    }
    return { hasAccess: true };
};
exports.validateAccess = validateAccess;
// Restricciones específicas para acciones críticas
exports.CRITICAL_ACTIONS = {
    MANAGE_ROLES: 'manage_roles',
    OVERRIDE_PERMISSIONS: 'override_permissions',
    SYSTEM_CONFIG: 'manage_system'
};
// Validar acciones críticas (requieren confirmación adicional)
const isCriticalAction = (permission) => {
    return Object.values(exports.CRITICAL_ACTIONS).includes(permission);
};
exports.isCriticalAction = isCriticalAction;
