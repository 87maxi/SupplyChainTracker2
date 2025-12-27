# Implementación del Sistema de Gestión de Roles

Este documento describe la implementación del sistema de gestión de roles en la aplicación SupplyChainTracker2, que permite a los administradores aprobar solicitudes de acceso y gestionar roles en la cadena de suministro.

## Arquitectura del Sistema

El sistema de gestión de roles sigue un patrón de capas que separa las responsabilidades entre diferentes componentes:

```
+---------------------+
|   UI Components     |
| (PendingRequests,   |
|  Admin Dashboard)   |
+----------+----------+
           |
+----------v----------+
|   Hooks              |
| (useRoleRequests,    |
|  useSupplyChainService)|
+----------+----------+
           |
+----------v----------+
|   Services           |
| (SupplyChainService, |
|  RoleService)        |
+----------+----------+
           |
+----------v----------+
|   Smart Contract     |
| (SupplyChainTracker) |
+---------------------+
```

## Componentes Clave

### 1. `useRoleRequests` Hook

El hook principal que gestiona el flujo de solicitudes de rol en el panel de administración.

**Responsabilidades:**
- Obtener solicitudes pendientes desde la API
- Aprobar solicitudes mediante transacciones blockchain
- Rechazar solicitudes
- Borrar solicitudes
- Proveer estado de carga y manejo de errores

**Dependencias:**
- `useSupplyChainService`: Para interactuar con el contrato inteligente
- `useToast`: Para notificaciones de usuario
- `@tanstack/react-query`: Para gestión de estado asincrónico
- `eventBus`: Para comunicación entre componentes

### 2. `useSupplyChainService` Hook

Hook que proporciona acceso a las funciones del contrato inteligente para operaciones de cadena de suministro.

**Funciones clave:**
- `grantRole(role: string, userAddress: Address)`: Otorga un rol a una dirección
- `hasRole(role: string, userAddress: Address)`: Verifica si una dirección tiene un rol
- `getRoleCounts()`: Obtiene el número de miembros por rol
- `getRoleMembers(role: string)`: Obtiene todos los miembros de un rol

### 3. `SupplyChainService` y `RoleService`

Servicios que encapsulan la lógica de interacción con el contrato inteligente.

**Características:**
- Uso de `wagmi/core` para operaciones de lectura/escritura
- Manejo de errores robusto
- Caché local para optimizar el rendimiento
- Normalización de nombres de roles (FABRICANTE_ROLE → FABRICANTE)

## Flujo de Aprobación de Roles

1. El administrador ve solicitudes pendientes en el panel
2. Al hacer clic en "Aprobar":
   - Se llama a `approveRequest` en `useRoleRequests`
   - El hook marca localmente la solicitud como procesada
   - Se llama a `grantRole` en `useSupplyChainService`
   - Se realiza la transacción blockchain
   - Se recepciona la transacción en segundo plano
   - Se elimina la solicitud del servidor (efecto silencioso)
   - Se emite un evento `ROLE_UPDATED`

## Manejo de Errores

El sistema implementa un manejo de errores comprehensivo:

- **Errores de transacción**: Se muestran como toast con mensaje descriptivo
- **Errores de red**: Se manejan transparentemente
- **Rechazo de usuario**: Se notifica adecuadamente
- **Revertidos**: Se explican con mensajes claros

## Seguridad y Mejores Prácticas

- Valida que el usuario tenga rol de administrador antes de mostrar el panel
- Uso de caché local con expiration para datos de roles
- Normalización segura de nombres de roles
- Validación de direcciones
- Manejo consistente de estados de carga

## Consideraciones de Diseño

- **Experiencia de usuario**: Feedback inmediato al procesar solicitudes
- **Resiliencia**: La falla en la eliminación de la solicitud del servidor no afecta el resultado blockchain
- **Persistencia**: Estado procesado se guarda en localStorage para sobrevivir a recargas
- **Rendimiento**: Caché agresivo de datos de roles para minimizar llamadas al contrato

## Puntos de Mejora

- Implementar paginación para grandes volúmenes de solicitudes
- Añadir filtros avanzados para solicitudes
- Incluir detalles de auditoría en el registro de actividad
- Implementar reintentos automáticos para transacciones fallidas
