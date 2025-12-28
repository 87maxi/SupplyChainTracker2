# Análisis de Diseño: Migración del Sistema de Roles

## Resumen de la Arquitectura Actual

El sistema implementó inicialmente un flujo de roles que utilizaba APIs intermedias como capa intermedia entre el frontend y el contrato inteligente:

```
Frontend → API REST (/api/role-requests) → Contrato
```

Este diseño tenía las siguientes características:

1. **API REST para Solicitudes de Roles**: El endpoint `/api/role-requests` manejaba solicitudes CRUD para solicitudes de rol, almacenándolas en un archivo JSON.
2. **Capa RPC Intermedia**: El endpoint `/api/rpc` actuaba como proxy para llamadas al contrato inteligente.
3. **Almacenamiento Servidor**: Las solicitudes pendientes se almacenaban en `role-requests.json` en el servidor.

## Problemas Identificados

Este diseño introducía varias capas de complejidad innecesarias:

1. **Acoplamiento Innecesario**: La API intermedia añadía complejidad sin proporcionar beneficios significativos en un entorno de prueba con Anvil.
2. **Latencia Incrementada**: Cada operación requería múltiples saltos (frontend → API → contrato → API → frontend).
3. **Mantenimiento Duplicado**: El código de servicio (`RoleRequestService.ts`) y los endpoints API requerían mantenimiento separado.
4. **Inconsistencias de Estado**: Existía riesgo de desincronización entre el estado en el archivo `role-requests.json` y el estado blockchain.

## Solución Propuesta: Comunicación Directa

Se propone eliminar completamente las APIs intermedias y comunicarse directamente con el contrato inteligente a través del cliente, utilizando `wagmi` y `viem`:

```
Frontend ⇄ Contrato (Anvil)
```

### Beneficios de la Solución

1. **Simplificación del Flujo**: Elimina la capa intermedia, reduciendo latencia y puntos de fallo.
2. **Consistencia de Estado**: El estado de las solicitudes de roles se gestiona directamente en el contrato inteligente.
3. **Reducción de Código**: Elimina aproximadamente 300+ líneas de código de servicios y endpoints API innecesarios.
4. **Mejor Experiencia de Usuario**: Interacciones más rápidas y directas con la blockchain.

### Implementación Requerida

1. **Eliminar Endpoints API**:
   - `web/src/app/api/role-requests/route.ts`
   - `web/src/app/api/role-requests/[id]/route.ts`
   -> `web/src/app/api/role-requests/[id]/status/route.ts`
   -> `web/src/app/api/rpc/route.ts`

2. **Actualizar Hooks y Servicios**:
   - Modificar `useRoleRequests.ts` para interactuar directamente con el contrato
   - Simplificar `SupplyChainService.ts` eliminando dependencias de endpoints RPC

3. **Migrar Estado a Blockchain**:
   - Las solicitudes de rol se registrarán directamente en el contrato inteligente
   - Eliminar el archivo `web/role-requests.json`

## Impacto en Componentes

Los siguientes componentes se verán afectados por esta migración:

- `ProfilePage`: Actualizar para enviar solicitudes directamente al contrato
- `AdminUsersPage`: Actualizar para aprobar/rechazar solicitudes directamente en el contrato

Esta simplificación alinea mejor el sistema con las mejores prácticas de aplicaciones Web3, donde el frontend interactúa directamente con la blockchain.