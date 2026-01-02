# Diagnóstico de Servicios

Este documento describe el sistema de diagnóstico implementado para identificar y resolver el error "readContract must be implemented by specific service".

## Objetivo

El objetivo principal es identificar por qué el método `readContract` de la clase base está siendo llamado en lugar de la implementación específica en `SupplyChainService`, lo que sugiere un problema con:

1. La inicialización del servicio
2. La jerarquía de clases y herencia
3. El patrón singleton
4. El registro de contratos

## Sistema de Diagnóstico Implementado

### 1. Herramienta Principal: service-debug.ts

La herramienta de diagnóstico `service-debug.ts` realiza un análisis integral del servicio `SupplyChainService` y registra resultados detallados en la consola. Las verificaciones incluyen:

- **Verificación de instancia singleton**: Confirma que `getInstance()` devuelve la misma instancia en múltiples llamadas.
- **Verificación de configuración base**: Valida que `contractAddress`, `abi`, y `cachePrefix` están correctamente configurados.
- **Verificación de jerarquía de clases**: Asegura que el servicio es una instancia válida de `SupplyChainService` y `BaseContractService`.
- **Verificación de métodos**: Confirma que todos los métodos requeridos están presentes, con especial atención a los métodos protegidos (`readContract`, `writeContract`, `waitForTransactionReceipt`, `getAddress`) para verificar que están correctamente sobrescritos y no usando la implementación base.
- **Verificación del registro de contratos**: Confirma que `SupplyChainTracker` está registrado en el `contractRegistry` con su configuración completa (dirección, ABI, versión).
- **Verificación del flujo de llamadas**: Intercepta llamadas a métodos clave de `BaseContractService` para rastrear el flujo de ejecución y determinar exactamente qué implementación de `readContract` se está ejecutando.

### 2. Integración y Ejecución Automática

El sistema de diagnóstico se ha integrado para ejecutar automáticamente cuando la aplicación se carga:

- El módulo `service-debug.ts` se importa en `layout.tsx`
- Una función `initializeDiagnostics()` ejecuta todas las verificaciones al cargar el módulo
- Todos los resultados se registran en la consola con el prefijo `[AUDIT]` para fácil identificación

### 3. Mejoras Clave Implementadas

1. **Exportación del contractRegistry**: Se modificó `service-debug.ts` para exportar el `contractRegistry`, resolviendo un conflicto con la importación desde `contract-registry.service.ts`.
2. **Inicialización centralizada**: Se creó una función `initializeDiagnostics()` que coordina todas las verificaciones en un orden lógico.
3. **Manejo de errores completo**: Se agregó manejo de errores en la inicialización del sistema de diagnóstico.
4. **Exports para depuración**: Se exportan `logAudit`, `serviceAuditLog`, y `contractRegistry` para permitir acceso externo durante la depuración.

## Uso

Las herramientas de diagnóstico se ejecutan automáticamente cuando la aplicación se carga. Los resultados se registran en la consola del navegador, donde se pueden inspeccionar:

1. Abrir las herramientas de desarrollo del navegador
2. Ir a la pestaña "Console"
3. Buscar mensajes con el prefijo `[AUDIT]`
4. Analizar los resultados para identificar dónde está fallando la configuración

## Siguientes Pasos

1. Ejecutar la aplicación y recopilar los resultados del diagnóstico desde la consola
2. Analizar los logs para identificar la causa raíz específica del problema
3. Implementar una solución dirigida basada en los hallazgos del diagnóstico
4. Verificar que el error "readContract must be implemented" ha sido resuelto
5. Limpiar las herramientas de diagnóstico si son innecesarias en producción

Este sistema proporciona una base sólida para resolver el problema al proporcionar visibilidad completa en el estado y comportamiento del servicio, permitiendo una solución dirigida basada en evidencia concreta.