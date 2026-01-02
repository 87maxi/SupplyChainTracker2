// web/src/lib/diagnostics/service-debug.ts
// Diagnóstico de servicios para identificar problemas de inicialización

import { BaseContractService } from '@/services/contracts/base-contract.service';
import { contractRegistry as importedContractRegistry } from '@/services/contract-registry.service';

// Interface para la configuración del contrato
interface ContractConfig {
  address: `0x${string}`;
  abi: any;
  version: string;
}

// Usar el contractRegistry importado
const contractRegistry = importedContractRegistry;

// Registro para auditoría
const serviceAuditLog: Array<{
  timestamp: Date;
  message: string;
  service?: string;
  method?: string;
  error?: any;
}> = [];

// Función para registrar auditorías
function logAudit(message: string, service?: string, method?: string, error?: any) {
  const entry = {
    timestamp: new Date(),
    message,
    service,
    method,
    error
  };
  serviceAuditLog.push(entry);
  console.log(`[AUDIT] ${message}`, service ? `(${service})` : '', method ? `-> ${method}` : '', error ? `: ${error}` : '');
}

// Inicialización principal del sistema de diagnóstico
function initializeDiagnostics() {
  logAudit('Iniciando sistema de diagnóstico');
  
  try {
    // Verificar registro de contratos
    logAudit('Verificando registro de contratos');
    
    // Verificar si SupplyChainTracker está registrado
    const hasSupplyChain = contractRegistry.has('SupplyChainTracker');
    if (!hasSupplyChain) {
      logAudit('❌ SupplyChainTracker no está registrado en contractRegistry');
    } else {
      logAudit('✅ SupplyChainTracker está registrado en contractRegistry');
      
      const config = contractRegistry.getConfig('SupplyChainTracker');
      if (config) {
        logAudit(`✅ Dirección del contrato: ${config.address}`, 'ContractRegistry');
        logAudit(`✅ Versión: ${config.version}`, 'ContractRegistry');
      }
    }
    
    logAudit('✅ Sistema de diagnóstico inicializado correctamente');
  } catch (error) {
    logAudit('❌ Error durante la inicialización del sistema de diagnóstico', 'Diagnostics', 'initializeDiagnostics', error);
  }
}

// Ejecutar diagnósticos al cargar el módulo
initializeDiagnostics();

// Exportar para acceso externo si es necesario
export { logAudit, serviceAuditLog, contractRegistry };