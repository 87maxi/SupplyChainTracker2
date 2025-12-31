"use strict";
// web/src/components/ui/notifications.tsx
'use client';
// web/src/components/ui/notifications.tsx
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionProgress = exports.Notifications = void 0;
const react_1 = __importDefault(require("react"));
const lucide_react_1 = require("lucide-react");
const iconMap = {
    success: lucide_react_1.CheckCircle,
    error: lucide_react_1.XCircle,
    warning: lucide_react_1.AlertCircle,
    info: lucide_react_1.Info
};
const bgColorMap = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200'
};
const textColorMap = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800'
};
const iconColorMap = {
    success: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400'
};
const Notifications = ({ notifications, onRemove }) => {
    if (notifications.length === 0) {
        return null;
    }
    return (<div className="fixed top-4 right-4 z-50 space-y-3 w-80 max-w-full">
      {notifications.map((notification) => {
            const Icon = iconMap[notification.type];
            return (<div key={notification.id} className={`
              p-4 rounded-lg border shadow-lg transform transition-all duration-300
              animate-in slide-in-from-right-full
              ${bgColorMap[notification.type]}
            `} role="alert">
            <div className="flex items-start">
              <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${iconColorMap[notification.type]}`}/>
              
              <div className="ml-3 flex-1">
                <h3 className={`text-sm font-medium ${textColorMap[notification.type]}`}>
                  {notification.title}
                </h3>
                
                <p className={`mt-1 text-sm ${textColorMap[notification.type]}`}>
                  {notification.message}
                </p>
                
                <div className="mt-2 text-xs text-gray-500">
                  {notification.timestamp.toLocaleTimeString()}
                </div>
              </div>
              
              <button onClick={() => onRemove(notification.id)} className="ml-4 flex-shrink-0 rounded-md p-1 hover:bg-black hover:bg-opacity-10 transition-colors" aria-label="Cerrar notificación">
                <lucide_react_1.X className="h-4 w-4 text-gray-500"/>
              </button>
            </div>
          </div>);
        })}
    </div>);
};
exports.Notifications = Notifications;
// Componente para mostrar progreso de transacción
const TransactionProgress = ({ isPending, message = 'Procesando transacción...' }) => {
    if (!isPending)
        return null;
    return (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          <span className="text-gray-700">{message}</span>
        </div>
      </div>
    </div>);
};
exports.TransactionProgress = TransactionProgress;
