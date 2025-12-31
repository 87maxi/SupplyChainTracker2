"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeriodSummary = PeriodSummary;
const card_1 = require("@/components/ui/card");
const badge_1 = require("@/components/ui/badge");
const lucide_react_1 = require("lucide-react");
function PeriodSummary() {
    return (<card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle>Resumen del Periodo</card_1.CardTitle>
        <card_1.CardDescription>Estadísticas para el rango seleccionado</card_1.CardDescription>
      </card_1.CardHeader>
      <card_1.CardContent>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col rounded-lg border p-4">
            <div className="flex items-center">
              <badge_1.Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                <lucide_react_1.ArrowUp className="h-3 w-3 mr-1"/>
                +24%
              </badge_1.Badge>
              <span className="ml-auto text-sm text-muted-foreground">semana pasada</span>
            </div>
            <span className="mt-2 text-2xl font-bold">1,234</span>
            <span className="text-sm text-muted-foreground">Usuarios Registrados</span>
          </div>

          <div className="flex flex-col rounded-lg border p-4">
            <div className="flex items-center">
              <badge_1.Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                <lucide_react_1.ArrowUp className="h-3 w-3 mr-1"/>
                +15%
              </badge_1.Badge>
              <span className="ml-auto text-sm text-muted-foreground">semana pasada</span>
            </div>
            <span className="mt-2 text-2xl font-bold">567</span>
            <span className="text-sm text-muted-foreground">Solicitudes de Rol</span>
          </div>

          <div className="flex flex-col rounded-lg border p-4">
            <div className="flex items-center">
              <badge_1.Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                <lucide_react_1.ArrowUp className="h-3 w-4 mr-1"/>
                +32%
              </badge_1.Badge>
              <span className="ml-auto text-sm text-muted-foreground">mes pasado</span>
            </div>
            <span className="mt-2 text-2xl font-bold">89</span>
            <span className="text-sm text-muted-foreground">Roles Aprobados</span>
          </div>

          <div className="flex flex-col rounded-lg border p-4">
            <div className="flex items-center">
              <badge_1.Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                <lucide_react_1.TrendingUp className="h-3 w-3 mr-1"/>
                -8%
              </badge_1.Badge>
              <span className="ml-auto text-sm text-muted-foreground">mes pasado</span>
            </div>
            <span className="mt-2 text-2xl font-bold">12</span>
            <span className="text-sm text-muted-foreground">Incidencias</span>
          </div>
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
