"use strict";
'use client';
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
exports.AuditTimeline = AuditTimeline;
const card_1 = require("@/components/ui/card");
const useSupplyChainService_1 = require("@/hooks/useSupplyChainService");
const react_1 = require("react");
function AuditTimeline({ serial }) {
    const { getNetbookReport } = (0, useSupplyChainService_1.useSupplyChainService)();
    const [report, setReport] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        const fetchReport = () => __awaiter(this, void 0, void 0, function* () {
            if (serial) {
                const data = yield getNetbookReport(serial);
                setReport(data);
            }
        });
        fetchReport();
    }, [serial, getNetbookReport]);
    return (<card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle>Seguimiento de Auditoría</card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent>
        <div className="space-y-4">
          {(report === null || report === void 0 ? void 0 : report.hwAuditor) && (<div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-800 text-sm font-medium">H</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  Auditoría de Hardware
                </p>
                <p className="text-sm text-gray-500 truncate">
                  Auditor: {report.hwAuditor}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  Resultado: {report.hwIntegrityPassed ? 'Aprobado' : 'Rechazado'}
                </p>
              </div>
            </div>)}
          
          {(report === null || report === void 0 ? void 0 : report.swTechnician) && (<div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-800 text-sm font-medium">S</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  Validación de Software
                </p>
                <p className="text-sm text-gray-500 truncate">
                  Técnico: {report.swTechnician}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  OS: {report.osVersion} - {report.swValidationPassed ? 'Aprobado' : 'Rechazado'}
                </p>
              </div>
            </div>)}
          
          {(report === null || report === void 0 ? void 0 : report.studentIdHash) && (<div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-purple-800 text-sm font-medium">E</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  Asignación a Estudiante
                </p>
                <p className="text-sm text-gray-500 truncate">
                  Escuela: {report.destinationSchoolHash}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  Estudiante: {report.studentIdHash}
                </p>
              </div>
            </div>)}
          
          {!report && !serial && (<p className="text-sm text-gray-500">Seleccione un serial para ver el seguimiento</p>)}
          
          {report && !report.hwAuditor && !report.swTechnician && !report.studentIdHash && (<p className="text-sm text-gray-500">No hay registros de auditoría para este dispositivo</p>)}
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
