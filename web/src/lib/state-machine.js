"use strict";
// web/src/lib/state-machine.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFinalState = exports.getNextPossibleStates = exports.validateStateTransition = exports.getRequiredRoleForTransition = exports.isValidStateTransition = exports.STATE_TRANSITION_ROLES = exports.STATE_MACHINE = void 0;
// Máquina de estados con transiciones válidas
exports.STATE_MACHINE = {
    FABRICADA: ['HW_APROBADO'],
    HW_APROBADO: ['SW_VALIDADO'],
    SW_VALIDADO: ['DISTRIBUIDA'],
    DISTRIBUIDA: [] // Estado final - sin transiciones
};
// Roles requeridos para cada transición
exports.STATE_TRANSITION_ROLES = {
    'FABRICADA→HW_APROBADO': 'AUDITOR_HW_ROLE',
    'HW_APROBADO→SW_VALIDADO': 'TECNICO_SW_ROLE',
    'SW_VALIDADO→DISTRIBUIDA': 'ESCUELA_ROLE'
};
// Validar si una transición de estado es válida
const isValidStateTransition = (currentState, nextState) => {
    return exports.STATE_MACHINE[currentState].includes(nextState);
};
exports.isValidStateTransition = isValidStateTransition;
// Obtener el rol requerido para una transición
const getRequiredRoleForTransition = (currentState, nextState) => {
    const transitionKey = `${currentState}→${nextState}`;
    return exports.STATE_TRANSITION_ROLES[transitionKey] || null;
};
exports.getRequiredRoleForTransition = getRequiredRoleForTransition;
// Validar transición completa con rol de usuario
const validateStateTransition = (currentState, nextState, userRoles) => {
    // Validar transición de estado
    if (!(0, exports.isValidStateTransition)(currentState, nextState)) {
        return {
            isValid: false,
            error: `Transición inválida: No se puede cambiar de ${currentState} a ${nextState}`
        };
    }
    // Validar rol requerido
    const requiredRole = (0, exports.getRequiredRoleForTransition)(currentState, nextState);
    if (!requiredRole) {
        return {
            isValid: false,
            error: 'No se encontró el rol requerido para esta transición'
        };
    }
    // Validar que el usuario tenga el rol necesario
    if (!userRoles.includes(requiredRole)) {
        return {
            isValid: false,
            error: `Se requiere el rol ${requiredRole} para esta acción`
        };
    }
    return { isValid: true };
};
exports.validateStateTransition = validateStateTransition;
// Obtener el siguiente estado posible
const getNextPossibleStates = (currentState) => {
    return exports.STATE_MACHINE[currentState];
};
exports.getNextPossibleStates = getNextPossibleStates;
// Verificar si un estado es final
const isFinalState = (state) => {
    return exports.STATE_MACHINE[state].length === 0;
};
exports.isFinalState = isFinalState;
