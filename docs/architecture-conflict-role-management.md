# Conflicto en la Arquitectura de Gestión de Roles

## Hallazgo Crítico

Se ha identificado un conflicto grave en la arquitectura de gestión de roles que explica por qué las solicitudes pendientes no son visibles para la cuenta de administrador.

## Dos Sistemas Paralelos

El sistema actual tiene dos implementaciones completamente diferentes para la gestión de roles, que coexisten pero no están sincronizadas:

### Sistema 1: Hook useRoleRequests (Nuevo)

- Implementado en `web/src/hooks/useRoleRequests.ts`
- Usa localStorage como mecanismo de persistencia
- Es el sistema que se supone debe ser el actual
- Comunica directamente con Anvil a través de contratos

### Sistema 2: Servicio RoleRequestService (Antiguo)
- Implementado en `web/src/services/RoleRequestService.ts`
- Usa un archivo JSON (`role-requests.json`) como almacenamiento
- Depende de una API REST (que fue eliminada)
- Es el sistema que probablemente aún se está utilizando

## ¿Por qué el Administrador No Ve las Solicitudes?

El problema fundamental es que **estos dos sistemas están completamente desconectados**:

1. Cuando un usuario envía una solicitud desde `profile/page.tsx`, llama a `addRequest` del hook `useRoleRequests` que guarda en localStorage
2. El componente `DashboardOverview` en `web/src/components/admin/DashboardOverview.tsx` lee las solicitudes desde `getRoleRequests()` de `RoleRequestService` que lee desde `role-requests.json`
3. Nunca se sincronizan estos dos almacenamientos

## Flujo de Datos

```
Usuario (perfil)
    ↓ llama addRequest()
Hook useRoleRequests.ts
    ↓ guarda en
localStorage ('role_requests')   ≠   role-requests.json
    ↑ lee desde                     ↑ lee desde
PendingRoleRequests.tsx       DashboardOverview.tsx
(panel de admin - no usado)   (panel de admin - en uso)
```

## Conclusión

El sistema está dirigiendo las solicitudes a través de un sistema (hook con localStorage) pero el panel de administrador está buscando en otro sistema completamente diferente (servicio con archivo JSON). Esta desconexión es la causa principal del problema.

## Solución Recomendada

1. Elegir uno de los dos sistemas (recomendado: el nuevo con localStorage)
2. Eliminar completamente el sistema obsoleto
3. Actualizar `DashboardOverview.tsx` para usar el mismo sistema de almacenamiento que las solicitudes
4. Asegurar que todos los componentes usen el mismo mecanismo de persistencia y recuperación de datos

Este conflicto de arquitectura debe resolverse urgentemente para que el sistema de gestión de roles funcione correctamente.