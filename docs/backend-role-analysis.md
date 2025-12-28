# Análisis del Backend para Asignación de Roles

## Estado Actual del Sistema

Tras un análisis detallado del backend, se ha determinado que:

1. **El archivo `role-requests.json` contiene los nombres completos de roles** con el sufijo `_ROLE` (por ejemplo, `FABRICANTE_ROLE`)
2. **El servicio `RoleRequestService.ts` almacena los roles exactamente como se reciben** del frontend
3. **La API `/api/role-requests` pasa directamente el nombre del rol** sin modificaciones
4. **Las solicitudes de ejemplo muestran que los roles se almacenan correctamente** con el formato completo

## Flujo de Datos

```
Frontend → API POST /role-requests → RoleRequestService → role-requests.json
     ↑                                     ↓
     └── API GET /role-requests ←───────────┘
```

El flujo muestra que no hay transformación de nombres de roles en el backend. Lo que se envía es lo que se almacena y lo que se recupera.

## Próximos Pasos

Dado que el backend está funcionando correctamente y almacenando los nombres de roles con el formato adecuado (`_ROLE`), el problema debe estar en el frontend o en la interacción con el contrato inteligente.

1. **Verificar la función `grantRole` en el servicio de contrato**
2. **Validar que el ABI del contrato esté actualizado**
3. **Revisar la lógica de mapeo de roles en `roleMapping.ts`**
4. **Confirmar que los hashes de roles coincidan entre el contrato y el frontend**