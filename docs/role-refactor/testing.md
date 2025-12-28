# Pruebas del Flujo de Gestión de Roles

## Objetivo

Verificar la integridad del flujo de gestión de roles después de la refactorización para eliminar las APIs intermedias.

## Escenarios a Probar

### 1. Solicitud de Rol

**Escenario**: Un usuario solicita un rol desde su perfil

**Pasos**:
1. Conectar una wallet no administradora
2. Navegar a la página de perfil
3. Seleccionar un rol (ej: FABRICANTE) y enviar la solicitud

**Verificación**:
- [ ] La solicitud se registra en localStorage en `role_requests`
- [ ] Se muestra notificación de "Solicitud enviada"
- [ ] La solicitud aparece en la lista de solicitudes pendientes (si existiera un componente de visualización)


### 2. Aprobación de Rol

**Escenario**: Un administrador aprueba una solicitud de rol

**Pasos**:
1. Conectar una wallet de administrador
2. Aprobar una solicitud de rol existente

**Verificación**:
- [ ] Se inicia una transacción para otorgar el rol
- [ ] La transacción se confirma en la blockchain
- [ ] Se muestra notificación de "Transacción Enviada" y luego "Confirmado en Blockchain"
- [ ] La solicitud se elimina de localStorage
- [ ] El usuario ahora tiene el rol asignado (verificable mediante `hasRole`)


### 3. Revocación de Rol

**Escenario**: Un administrador revoca un rol asignado

**Pasos**:
1. Conectar una wallet de administrador
2. Usar el componente AdminUsersPage para revocar un rol

**Verificación**:
- [ ] Se inicia una transacción para revocar el rol
- [ ] La transacción se confirma en la blockchain
- [ ] El usuario ya no tiene el rol asignado (verificable mediante `hasRole`)

### 4. Persistencia entre Recargas

**Escenario**: El estado de solicitudes pendientes persiste entre recargas de página

**Pasos**:
1. Enviar una solicitud de rol
2. Recargar la página
3. Verificar el estado local

**Verificación**:
- [ ] La solicitud pendiente sigue presente en localStorage
- [ ] El estado se restaura correctamente en el hook `useRoleRequests`

## Resultados Esperados

- Todos los casos de prueba deben pasar
- No deben haber llamadas a APIs REST `/api/role-requests` o `/api/rpc`
- Todas las operaciones de roles deben realizarse directamente con el contrato inteligente Anvil
- El estado de solicitudes pendientes debe persistir en localStorage

Este plan de pruebas asegura que la refactorización mantuvo la funcionalidad mientras simplificó la arquitectura.