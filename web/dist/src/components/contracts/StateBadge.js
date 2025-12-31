"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateBadge = StateBadge;
const badge_1 = require("@/components/ui/badge");
function StateBadge({ state, className = '' }) {
    // Get the label and variant for the given state
    const label = getStateLabel(state);
    const variant = getVariant(state);
    return <badge_1.Badge variant={variant} className={className}>{label}</badge_1.Badge>;
}
function getStateLabel(state) {
    switch (state) {
        case 0:
            return 'Fabricada';
        case 1:
            return 'HW Aprobado';
        case 2:
            return 'SW Validado';
        case 3:
            return 'Distribuida';
        default:
            return 'Desconocido';
    }
}
function getVariant(state) {
    switch (state) {
        case 0:
            return 'outline';
        case 1:
            return 'success';
        case 2:
            return 'warning';
        case 3:
            return 'default';
        default:
            return 'secondary';
    }
}
