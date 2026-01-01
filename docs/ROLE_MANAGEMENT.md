# Sistema de Gestión de Roles

## 🎯 Visión General

Este documento describe el sistema de gestión de roles implementado en el contrato inteligente SupplyChainTracker.sol y su integración con el frontend. El sistema sigue un flujo riguroso de solicitud y aprobación para todos los roles, asegurando que solo el administrador pueda otorgar privilegios en el sistema.

## 🔐 Modelo de Seguridad

### Principios de Diseño

1. **Administrador Único en el Despliegue**:
   - Solo la primera cuenta de Anvil (0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266) recibe el rol de administrador durante el despliegue
   - No se asignan roles de FABRICANTE, AUDITOR_HW, TECNICO_SW ni ESCUELA durante el despliegue

2. **Flujo Obligatorio de Solicitud y Aprobación**:
   - Todos los usuarios deben solicitar roles explícitamente
   - Solo el administrador puede aprobar solicitudes
   - No se permiten asignaciones directas de roles

3. **Control de Acceso Basado en Roles (RBAC)**:
   - Sistema de permisos granular usando `AccessControl` de OpenZeppelin
   - Cada función requiere un rol específico asignado
   - Trazabilidad pública para auditoría

## 🛠️ Arquitectura del Sistema

### Contrato Inteligente (SupplyChainTracker.sol)

El contrato inteligente implementa una solución completa para la gestión de roles con los siguientes componentes:

#### Estructuras de Datos

```solidity
// Estado de las solicitudes de roles
enum RequestStatus {
    PENDING,
    APPROVED,
    REJECTED
}

// Estructura para almacenar solicitudes de roles
struct RoleRequest {
    address requester;
    bytes32 role;
    RequestStatus status;
    uint256 timestamp;
    string metadata;
}
```

#### Mapeos para Eficiencia

```solidity
// Mapping para almacenar solicitudes de roles
uint256 private requestCounter;
mapping(uint256 => RoleRequest) public roleRequests;
mapping(address => mapping(bytes32 => uint256)) public userRoleToRequestId;
mapping(bytes32 => uint256[]) private roleToRequestIds;
mapping(address => uint256[]) private userRequestIds;
```

#### Eventos para Trazabilidad

```solidity
// Eventos para gestión de roles
event RoleRequested(
    uint256 indexed requestId,
    address indexed requester,
    bytes32 indexed role,
    uint256 timestamp
);
    
event RoleRequestApproved(
    uint256 indexed requestId,
    address indexed requester,
    bytes32 indexed role,
    uint256 timestamp
);
    
event RoleRequestRejected(
    uint256 indexed requestId,
    address indexed requester,
    bytes32 indexed role,
    uint256 timestamp
);
```

#### Funciones Clave

1. `requestRole(bytes32 role, string memory metadata)`:
   - Permite a cualquier usuario solicitar un rol (excepto el rol de administrador)
   - Verifica que el usuario no tenga ya el rol solicitado
   - Comprueba que no exista una solicitud pendiente para ese rol
   - Emite un evento `RoleRequested`

2. `grantRole(bytes32 role, address account)`:
   - Modificada para que solo el administrador pueda otorgar roles (`onlyRole(DEFAULT_ADMIN_ROLE)`)
   - Al otorgar un rol, busca si existe una solicitud pendiente y la marca como aprobada
   - Emite eventos `RoleGranted` y `RoleRequestApproved`

3. `rejectRoleRequest(uint256 requestId)`:
   - Permite al administrador rechazar explícitamente una solicitud
   - Actualiza el estado de la solicitud a REJECTED
   - Emite el evento `RoleRequestRejected`


## 🔄 Flujo de Trabajo

### Proceso de Solicitud de Rol

1. **Solicitud (Usuario)**:
   - El usuario selecciona un rol a través del modal "Solicitar Rol"
   - El frontend llama a `requestRole(roleHash, metadata)`
   - El contrato registra la solicitud con estado PENDING
   - Se emite el evento `RoleRequested`

2. **Aprobación (Administrador)**:
   - El administrador ve la solicitud en el panel de "Solicitudes de Rol Pendientes"
   - Al hacer clic en "Aprobar", el frontend llama a `grantRole(roleHash, userAddress)`
   - El contrato otorga el rol y automáticamente marca la solicitud como aprobada
   - Se emiten los eventos `RoleGranted` y `RoleRequestApproved`

3. **Rechazo (Administrador)**:
   - El administrador puede seleccionar "Rechazar" en una solicitud
   - El frontend llama a `rejectRoleRequest(requestId)`
   - El contrato actualiza el estado de la solicitud a REJECTED
   - Se emite el evento `RoleRequestRejected`


### Validaciones de Seguridad

- **Protección contra reutilización de solicitudes**: Una vez que un usuario tiene un rol, no puede solicitarlo nuevamente
- **Protección contra solicitudes duplicadas**: Solo puede haber una solicitud pendiente por (usuario, rol)
- **Control estricto del administrador**: Solo el administrador puede aprobar o rechazar solicitudes
- **Verificación de estado en tiempo real**: Antes de aprobar, se verifica que la solicitud aún esté pendiente

## 🌐 Integración Frontend

El frontend integra completamente este sistema mediante:

1. **RoleRequestModal**: Modal que permite a los usuarios solicitar roles
2. **useRoleRequests Hook**: Hook que gestiona el estado de las solicitudes y las interacciones con el contrato
3. **PendingRoleRequests Component**: Tabla que muestra todas las solicitudes pendientes para el administrador

## 🛡️ Ventajas de Seguridad

1. **Reducción de Ataques de Elevación de Privilegios**: Al eliminar la posibilidad de asignación directa de roles, se elimina un vector de ataque común
2. **Trazabilidad Completa**: Todas las solicitudes y decisiones están registradas en la blockchain
3. **Auditoría Simplificada**: Los eventos permiten fácilmente auditar quién solicitó un rol, cuándo y qué decisión se tomó
4. **Compliance**: El flujo de aprobación dual satisface requisitos normativos comunes que requieren aprobación para cambios de privilegios

Este sistema asegura un modelo de seguridad robusto y adecuado para ambientes de producción donde el control de acceso es crítico.