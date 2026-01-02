// web/src/lib/diagnostics/service-debug.ts
// Diagnóstico de servicios para identificar problemas de inicialización

import { SupplyChainService } from '@/services/SupplyChainService';
import { BaseContractService } from '@/services/contracts/base-contract.service';

// Interface para la configuración del contrato
interface ContractConfig {
  address: `0x${string}`;
  abi: any;
  version: string;
}

// Registro de contratos por tipo - exportado para acceso externo
export const contractRegistry = new Map<string, { service: BaseContractService; config: ContractConfig }>();

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

// Lista de métodos que deben estar disponibles en SupplyChainService
const requiredMethods = [
  'readContract',
  'writeContract',
  'waitForTransactionReceipt',
  'getAddress',
  'read',
  'write',
  'waitForTransaction',
  'invalidateCache',
  'registerNetbooks',
  'auditHardware',
  'validateSoftware',
  'assignToStudent',
  'grantRole',
  'revokeRole',
  'hasRole',
  'getNetbookReport',
  'getRoleByName',
  'hasRoleByName',
  'grantRoleByName',
  'revokeRoleByName'
];

// Verificar los métodos disponibles
function verifyMethods(service: any, serviceName: string) {
  logAudit('Verificando métodos disponibles', serviceName);
  
  // Verificar todos los métodos requeridos
  requiredMethods.forEach(method => {
    const hasMethod = typeof service[method] === 'function';
    if (!hasMethod) {
      logAudit(`❌ Falta método: ${method}`, serviceName);
    } else {
      logAudit(`✅ Método presente: ${method}`, serviceName);
      
      // Para métodos protegidos, verificar el prototype
      if (method === 'readContract' || method === 'writeContract' || 
          method === 'waitForTransactionReceipt' || method === 'getAddress') {
        const hasMethodInPrototype = typeof (service as any).__proto__[method] === 'function';
        if (hasMethodInPrototype) {
          logAudit(`✅ ${method} presente en prototype`, serviceName);
          
          // Verificar si está sobrescrito o es la implementación base
          const methodString = (service as any).__proto__[method].toString();
          const isBaseImplementation = methodString.includes('must be implemented by specific service');
          if (isBaseImplementation) {
            logAudit(`⚠️ ${method} usa implementación base (no sobrescrito)`, serviceName);
          } else {
            logAudit(`✅ ${method} está sobrescrito correctamente`, serviceName);
          }
        } else {
          logAudit(`❌ ${method} no presente en prototype`, serviceName);
        }
      }
    }
  });
}

// Verificar la jerarquía de clases
function verifyClassHierarchy(service: any, serviceName: string) {
  logAudit('Verificando jerarquía de clases', serviceName);
  
  // Verificar que es instancia de SupplyChainService
  const isSupplyChainService = service instanceof SupplyChainService;
  if (!isSupplyChainService) {
    logAudit('❌ No es instancia de SupplyChainService', serviceName);
  } else {
    logAudit('✅ Es instancia de SupplyChainService', serviceName);
  }
  
  // Verificar que es instancia de BaseContractService
  const isBaseContractService = service instanceof BaseContractService;
  if (!isBaseContractService) {
    logAudit('❌ No es instancia de BaseContractService', serviceName);
  } else {
    logAudit('✅ Es instancia de BaseContractService', serviceName);
  }
}

// Verificar la instancia singleton
function verifySingleton() {
  logAudit('Verificando singleton de SupplyChainService');
  
  // Obtener instancia
  const instance1 = SupplyChainService.getInstance();
  const instance2 = SupplyChainService.getInstance();
  
  // Verificar que es el mismo objeto
  const isSingleton = instance1 === instance2;
  if (!isSingleton) {
    logAudit('❌ getInstance() no devuelve la misma instancia');
  } else {
    logAudit('✅ getInstance() devuelve la misma instancia (singleton correcto)');
  }
  
  // Verificar métodos disponibles en la instancia
  verifyMethods(instance1, 'SupplyChainService.instance');
  
  // Verificar la jerarquía de clases de la instancia
  verifyClassHierarchy(instance1, 'SupplyChainService.instance');
  
  return instance1;
}

// Verificar la configuración base del servicio
function verifyBaseConfiguration(service: BaseContractService, serviceName: string) {
  logAudit('Verificando configuración base', serviceName);
  
  // Verificar propiedades básicas
  if (!service.contractAddress) {
    logAudit('❌ Falta contractAddress', serviceName);
  } else {
    logAudit(`✅ contractAddress presente: ${service.contractAddress}`, serviceName);
  }
  
  if (!service.abi) {
    logAudit('❌ Falta abi', serviceName);
  } else {
    logAudit('✅ abi presente', serviceName);
  }
  
  if (!service.cachePrefix) {
    logAudit('❌ Falta cachePrefix', serviceName);
  } else {
    logAudit(`✅ cachePrefix presente: ${service.cachePrefix}`, serviceName);
  }
}

// Verificar el registro de contratos
function verifyContractRegistry(registry: any) {
  logAudit('Verificando registro de contratos');
  
  // Verificar si SupplyChainTracker está registrado
  const hasSupplyChain = registry.has('SupplyChainTracker');
  if (!hasSupplyChain) {
    logAudit('❌ SupplyChainTracker no está registrado en contractRegistry');
  } else {
    logAudit('✅ SupplyChainTracker está registrado en contractRegistry');
    
    const entry = registry.get('SupplyChainTracker');
    if (entry) {
      logAudit(`✅ Dirección del contrato: ${entry.config.address}`, 'ContractRegistry');
      logAudit(`✅ Versión: ${entry.config.version}`, 'ContractRegistry');
      logAudit(`✅ Servicio de contrato presente`, 'ContractRegistry');
      logAudit('✅ Configuración completa verificada', 'ContractRegistry');
    }
  }
}

// Verificar el flujo de llamadas
function verifyCallFlow() {
  logAudit('Configurando verificación del flujo de llamadas');
  
  // Guardar la implementación original de los métodos
  const originalRead = BaseContractService.prototype.read;
  const originalWrite = BaseContractService.prototype.write;
  const originalWaitForTransaction = BaseContractService.prototype.waitForTransaction;
  const originalReadContract = BaseContractService.prototype.readContract;
  const originalWriteContract = BaseContractService.prototype.writeContract;
  const originalWaitForTransactionReceipt = BaseContractService.prototype.waitForTransactionReceipt;
  const originalGetAddress = BaseContractService.prototype.getAddress;

  // Decorar los métodos para registrar las llamadas
  BaseContractService.prototype.read = function(...args: any[]) {
    logAudit('Llamada a BaseContractService.read', 'CallFlow', 'read', {args});
    return originalRead.apply(this, args);
  };

  BaseContractService.prototype.write = function(...args: any[]) {
    logAudit('Llamada a BaseContractService.write', 'CallFlow', 'write', {args});
    return originalWrite.apply(this, args);
  };

  BaseContractService.prototype.waitForTransaction = function(...args: any[]) {
    logAudit('Llamada a BaseContractService.waitForTransaction', 'CallFlow', 'waitForTransaction', {args});
    return originalWaitForTransaction.apply(this, args);
  };

  BaseContractService.prototype.readContract = function(...args: any[]) {
    logAudit('Llamada a BaseContractService.readContract', 'CallFlow', 'readContract', {args});
    return originalReadContract.apply(this, args);
  };

  BaseContractService.prototype.writeContract = function(...args: any[]) {
    logAudit('Llamada a BaseContractService.writeContract', 'CallFlow', 'writeContract', {args});
    return originalWriteContract.apply(this, args);
  };

  BaseContractService.prototype.waitForTransactionReceipt = function(...args: any[]) {
    logAudit('Llamada a BaseContractService.waitForTransactionReceipt', 'CallFlow', 'waitForTransactionReceipt', {args});
    return originalWaitForTransactionReceipt.apply(this, args);
  };

  BaseContractService.prototype.getAddress = function(...args: any[]) {
    logAudit('Llamada a BaseContractService.getAddress', 'CallFlow', 'getAddress', {args});
    return originalGetAddress.apply(this, args);
  };
}

// Inicialización principal del sistema de diagnóstico
function initializeDiagnostics() {
  logAudit('Iniciando sistema de diagnóstico');
  
  try {
    // Verificar instancia singleton
    const instance = verifySingleton();
    
    // Verificar configuración base
    verifyBaseConfiguration(instance, 'SupplyChainService');
    
    // Verificar métodos
    verifyMethods(instance, 'SupplyChainService');
    
    // Verificar jerarquía de clases
    verifyClassHierarchy(instance, 'SupplyChainService');
    
    // Verificar registro de contratos usando la instancia correcta
    verifyContractRegistry(contractRegistry);
    
    // Verificar flujo de llamadas
    verifyCallFlow();
    
    logAudit('✅ Sistema de diagnóstico inicializado correctamente');
  } catch (error) {
    logAudit('❌ Error durante la inicialización del sistema de diagnóstico', 'Diagnostics', 'initializeDiagnostics', error);
  }
}

// Ejecutar diagnósticos al cargar el módulo
initializeDiagnostics();

// Exportar para acceso externo si es necesario
export { logAudit, serviceAuditLog, contractRegistry };
