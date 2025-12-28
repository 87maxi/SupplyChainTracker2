# Plan de Implementación: Refactorización del Sistema de Roles

## Objetivo

Eliminar las APIs intermedias y establecer comunicación directa entre el frontend y el contrato inteligente para la gestión de roles, simplificando la arquitectura y mejorando la eficiencia.

## Cambios a Implementar

### 1. Actualizar Hook useRoleRequests

Modificar `web/src/hooks/useRoleRequests.ts` para eliminar dependencias de APIs REST y comunicarse directamente con el contrato inteligente.

#### Acciones:

- Eliminar todas las llamadas a `/api/role-requests` (fetch, POST, DELETE, PATCH)
- Implementar un mecanismo para persistir solicitudes de roles directamente en el contrato inteligente
- Mantener la lógica de mutación para `approveRequest`, `rejectRequest` y `deleteRequest` pero adaptándola para operaciones directas con el contrato
- Actualizar el `queryFn` para obtener solicitudes directamente desde el contrato o desde almacenamiento local si es necesario

#### Consideraciones:

- Las solicitudes de rol ahora deben gestionarse completamente en el frontend con respaldo en blockchain
- Implementar almacenamiento local (localStorage) para mantener el estado de solicitudes pendientes entre recargas
- Asegurar que la experiencia de usuario sea fluida, manteniendo notificaciones y actualizaciones optimistas

### 2. Actualizar Servicio de Cadena de Suministro

Refactorizar `web/src/services/SupplyChainService.ts` para eliminar dependencias de endpoints RPC.

#### Acciones:

- Eliminar cualquier función que haga llamadas a `/api/rpc`
- Asegurar que todas las funciones de lectura y escritura utilicen directamente `@wagmi/core` y `viem`
- Verificar que funciones como `grantRole`, `revokeRole`, `hasRole` funcionen correctamente sin intermediarios

### 3. Actualizar Componentes del Frontend

Actualizar los componentes que dependen de los hooks modificados.

#### Componentes a Actualizar:

1. `web/src/app/profile/page.tsx`
   - Actualizar `submitRoleRequest` para usar el nuevo hook o contrato directamente
   - Eliminar llamadas a `/api/role-requests`

2. `web/src/app/admin/users/page.tsx`
   - Asegurar que las funciones de aprobación/rechazo de solicitudes funcionen con el sistema actualizado
   - Verificar que la visualización de usuarios y roles sea consistente

### 4. Pruebas y Verificación

- Ejecutar pruebas de integración para verificar el flujo completo de solicitud y aprobación de roles
- Probar casos extremos: conexión perdida, transacciones rechazadas, múltiples solicitudes
- Verificar la persistencia del estado entre recargas de página

## Secuencia de Implementación

1. Completar análisis de impacto
2. Eliminar APIs intermedias
3. Actualizar hooks y servicios
4. Modificar componentes del frontend
5. Ejecutar pruebas end-to-end
6. Documentar cambios realizados

Este plan asegura una migración ordenada y segura hacia una arquitectura más eficiente y directa, alineada con las mejores prácticas de aplicaciones Web3.