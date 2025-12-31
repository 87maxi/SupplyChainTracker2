"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportGenerator = ReportGenerator;
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const lucide_react_1 = require("lucide-react");
function ReportGenerator() {
    return (<card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle>Generar Reportes</card_1.CardTitle>
        <card_1.CardDescription>Exporta datos para análisis detallado</card_1.CardDescription>
      </card_1.CardHeader>
      <card_1.CardContent>
        <div className="space-y-4">
          <button_1.Button variant="outline" className="w-full justify-start">
            <lucide_react_1.Download className="mr-2 h-4 w-4"/>
            Exportar Datos de Usuarios
          </button_1.Button>
          
          <button_1.Button variant="outline" className="w-full justify-start">
            <lucide_react_1.Download className="mr-2 h-4 w-4"/>
            Exportar Solicitudes de Rol
          </button_1.Button>
          
          <button_1.Button variant="outline" className="w-full justify-start">
            <lucide_react_1.Download className="mr-2 h-4 w-4"/>
            Exportar Historial de Transacciones
          </button_1.Button>
          
          <button_1.Button variant="outline" className="w-full justify-start">
            <lucide_react_1.Download className="mr-2 h-4 w-4"/>
            Exportar Estadísticas de Actividad
          </button_1.Button>
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
