# Corrección del Formato de Nombre de Rol

## Problema Identificado

El problema radicaba en que las solicitudes de rol almacenadas en `role-requests.json` y mostradas en la interfaz de usuario no incluían el sufijo `_ROLE` necesario por el contrato inteligente. Cuando se aprobaba una solicitud, se utilizaba el nombre del rol tal como estaba almacenado (por ejemplo, "FABRICANTE"), pero el contrato esperaba el nombre completo ("FABRICANTE_ROLE").

## Solución Implementada

Se modificó la función de aprobación en `useRoleRequests.ts` para asegurar que el nombre del rol tenga el sufijo `_ROLE` antes de pasarlo a `grantRole`:

```typescript
// Antes: usaba el nombre del rol directamente
const result = await grantRole(role, userAddress as `0x${string}`);

// Después: asegura el sufijo _ROLE
let roleToSend = role;
if (!role.endsWith('_ROLE')) {
  roleToSend = `${role}_ROLE`;
}
const result = await grantRole(roleToSend, userAddress as `0x${string}`);
```

## Cambios Realizados

1. **Validación del formato del nombre del rol** en el hook `useRoleRequests`
2. **Agregación automática del sufijo `_ROLE`** si no está presente
3. **Mantenimiento de la funcionalidad existente** para nombres de rol que ya incluyen el sufijo

## Resultado

Ahora el sistema:

- Acepta nombres de roles tanto con como sin el sufijo `_ROLE`
- Normaliza automáticamente los nombres de roles al formato esperado por el contrato
- Asigna correctamente los roles después de la aprobación de solicitudes
- Mantiene la compatibilidad con los datos existentes

## Próximos Pasos

1. Considerar normalizar los nombres de roles en el momento de la creación de la solicitud
2. Validar los nombres de roles en el backend antes de almacenarlos
3. Asegurar que todos los componentes que muestran nombres de roles usen un formato consistente