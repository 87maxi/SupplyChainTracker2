"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleActions = RoleActions;
const react_1 = require("react");
const useUserRoles_1 = require("@/hooks/useUserRoles");
const button_1 = require("@/components/ui/button");
const lucide_react_1 = require("lucide-react");
const NetbookForm_1 = require("@/components/contracts/NetbookForm");
const HardwareAuditForm_1 = require("@/components/contracts/HardwareAuditForm");
const SoftwareValidationForm_1 = require("@/components/contracts/SoftwareValidationForm");
const StudentAssignmentForm_1 = require("@/components/contracts/StudentAssignmentForm");
const card_1 = require("@/components/ui/card");
function RoleActions() {
    const { isManufacturer, isHardwareAuditor, isSoftwareTechnician, isSchool, isAdmin } = (0, useUserRoles_1.useUserRoles)();
    const [showRegisterForm, setShowRegisterForm] = (0, react_1.useState)(false);
    const [showAuditForm, setShowAuditForm] = (0, react_1.useState)(false);
    const [showValidationForm, setShowValidationForm] = (0, react_1.useState)(false);
    const [showAssignmentForm, setShowAssignmentForm] = (0, react_1.useState)(false);
    // If no relevant roles, return null
    if (!isManufacturer && !isHardwareAuditor && !isSoftwareTechnician && !isSchool && !isAdmin) {
        return null;
    }
    return (<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
            {(isManufacturer || isAdmin) && (<card_1.Card className="border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 transition-colors">
                    <card_1.CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <card_1.CardTitle className="text-lg font-bold text-blue-400">Fabricante</card_1.CardTitle>
                            <lucide_react_1.Plus className="h-5 w-5 text-blue-400"/>
                        </div>
                        <card_1.CardDescription className="text-xs">Registro inicial de netbooks en la blockchain.</card_1.CardDescription>
                    </card_1.CardHeader>
                    <card_1.CardContent>
                        <button_1.Button onClick={() => setShowRegisterForm(true)} className="w-full gap-2 bg-blue-600 hover:bg-blue-700 mt-2">
                            Registrar Netbook
                        </button_1.Button>
                        <NetbookForm_1.NetbookForm isOpen={showRegisterForm} onOpenChange={setShowRegisterForm} onComplete={() => window.location.reload()}/>
                    </card_1.CardContent>
                </card_1.Card>)}

            {(isHardwareAuditor || isAdmin) && (<card_1.Card className="border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors">
                    <card_1.CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <card_1.CardTitle className="text-lg font-bold text-emerald-400">Auditor HW</card_1.CardTitle>
                            <lucide_react_1.ShieldCheck className="h-5 w-5 text-emerald-400"/>
                        </div>
                        <card_1.CardDescription className="text-xs">Verificación y aprobación de integridad física.</card_1.CardDescription>
                    </card_1.CardHeader>
                    <card_1.CardContent>
                        <button_1.Button onClick={() => setShowAuditForm(true)} className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 mt-2">
                            Auditar Hardware
                        </button_1.Button>
                        <HardwareAuditForm_1.HardwareAuditForm isOpen={showAuditForm} onOpenChange={setShowAuditForm} onComplete={() => window.location.reload()}/>
                    </card_1.CardContent>
                </card_1.Card>)}

            {(isSoftwareTechnician || isAdmin) && (<card_1.Card className="border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 transition-colors">
                    <card_1.CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <card_1.CardTitle className="text-lg font-bold text-purple-400">Técnico SW</card_1.CardTitle>
                            <lucide_react_1.Monitor className="h-5 w-5 text-purple-400"/>
                        </div>
                        <card_1.CardDescription className="text-xs">Instalación y validación del sistema operativo.</card_1.CardDescription>
                    </card_1.CardHeader>
                    <card_1.CardContent>
                        <button_1.Button onClick={() => setShowValidationForm(true)} className="w-full gap-2 bg-purple-600 hover:bg-purple-700 mt-2">
                            Validar Software
                        </button_1.Button>
                        <SoftwareValidationForm_1.SoftwareValidationForm isOpen={showValidationForm} onOpenChange={setShowValidationForm} onComplete={() => window.location.reload()}/>
                    </card_1.CardContent>
                </card_1.Card>)}

            {(isSchool || isAdmin) && (<card_1.Card className="border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-colors">
                    <card_1.CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <card_1.CardTitle className="text-lg font-bold text-amber-400">Escuela</card_1.CardTitle>
                            <lucide_react_1.UserPlus className="h-5 w-5 text-amber-400"/>
                        </div>
                        <card_1.CardDescription className="text-xs">Asignación final de la netbook al estudiante.</card_1.CardDescription>
                    </card_1.CardHeader>
                    <card_1.CardContent>
                        <button_1.Button onClick={() => setShowAssignmentForm(true)} className="w-full gap-2 bg-amber-600 hover:bg-amber-700 mt-2">
                            Asignar Estudiante
                        </button_1.Button>
                        <StudentAssignmentForm_1.StudentAssignmentForm isOpen={showAssignmentForm} onOpenChange={setShowAssignmentForm} onComplete={() => window.location.reload()}/>
                    </card_1.CardContent>
                </card_1.Card>)}
        </div>);
}
