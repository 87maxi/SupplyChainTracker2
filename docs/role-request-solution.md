# Solución para la Gestión de Solicitudes de Rol

## Problema
Se identificaron múltiples problemas al gestionar solicitudes de roles desde la interfaz web hasta la blockchain:

1. **Error en RoleService**: Uso incorrecto de React hooks en una clase de servicio
2. **Variables indefinidas**: Referencia a `mockRoleRequests` que no existe
3. **Error de ABI**: El error "abi.filter is not a function" indica que el ABI no está en formato de array cuando se intenta filtrarlo

## Solución Implementada

### 1. Corrección del error de ABI en SupplyChainContract

El problema principal era que el ABI JSON de Solidity puede ser un objeto o un array dependiendo de cómo se exporte. Nuestra función `readContract` espera un array pero recibía un objeto, causando el error `abi.filter is not a function`.

**Cambio implementado en `SupplyChainContract.ts`:**
```typescript
// Antes
const abi = SupplyChainTrackerABI;

// Después
const abi = Array.isArray(SupplyChainTrackerABI) ? SupplyChainTrackerABI : Object.values(SupplyChainTrackerABI).flat();
```

Esta solución convierte cualquier formato de ABI (objeto o array) en un array plano antes de pasarlo a las funciones de contrato.

### 2. Corrección del RoleService

El `RoleService` estaba intentando usar React hooks como `useRoleData` dentro de una clase de servicio, lo cual no es válido ya que los hooks solo pueden usarse en componentes funcionales o custom hooks.


**Solución:**
- Eliminamos todos los hooks del `RoleService`
- Mantenimos únicamente la lógica de negocio relacionada con el contrato
- Las dependencias de hooks deben manejarse en los componentes o custom hooks que consumen el servicio

### 3. Corrección de variables indefinidas

Se removieron referencias a `mockRoleRequests` que no estaban definidas en el código fuente, ya que no existía la variable.


## Impacto

Esta solución debería:
1. Resolver el error crítico `abi.filter is not a function` que impedía la comunicación con el contrato
2. Corregir problemas de arquitectura al eliminar el uso incorrecto de React hooks en servicios
3. Eliminar referencias a variables inexistentes que causaban errores

## Próximos Pasos

1. Verificar que todas las funciones del contrato funcionen correctamente después del cambio del ABI
2. Implementar pruebas unitarias para validar el manejo de diferentes formatos de ABI
3. Revisar otras instancias donde se importe el ABI del contrato para asegurar consistencia
4. Documentar el formato esperado del ABI en el código fuente

## Contribución

Este commit es una compresión de todas las correcciones necesarias para resolver los problemas de gestión de roles en la interfaz.

Generated with [Continue](https://continue.dev)

Co-Authored-By: Continue <noreply@continue.dev>