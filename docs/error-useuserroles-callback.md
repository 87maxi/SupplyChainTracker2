# 🐞 Análisis del Error en `useUserRoles.ts`

## 📍 Error Reportado

```
src/hooks/useUserRoles.ts (77:23) @ async useUserRoles.useCallback[checkRoles]
```

Y en consola:
```
CRITICAL: Origin http://localhost:3000 not found on Allowlist. Please update your configuration on cloud.reown.com
```

## 🔍 Análisis Detallado

El error ocurre en el hook `useUserRoles.ts` dentro de la función `useCallback[checkRoles]`, específicamente cuando se intenta leer los roles del contrato usando `readContract` de wagmi/core.

### Causas Identificadas:

1. **Error Principal**: 
   - El origen `http://localhost:3000` no está en la allowlist de WalletConnect/Reown
   - Esto impide que la conexión wallet se establezca correctamente
   - La conexión falla antes de poder leer los roles del contrato

2. **Error Secundario (Código)**: 
   - El hook realiza 4 llamadas separadas a `readContract` para obtener los hashes de roles
   - Esto es ineficiente y puede fallar parcialmente
   - Mejor práctica: usar una sola llamada si el contrato lo permite, o manejar fallos individuales

### Flujo del Error:

```ts
const rolePromises = [
  readContract(config, { functionName: 'FABRICANTE_ROLE' }),
  readContract(config, { functionName: 'AUDITOR_HW_ROLE' }),
  readContract(config, { functionName: 'TECNICO_SW_ROLE' }),
  readContract(config, { functionName: 'ESCUELA_ROLE' })
];

const results = await Promise.all(rolePromises); // ← Falla aquí si WC no está permitido
```

## ✅ Soluciones Propuestas

### 1. Solución Inmediata (Externa)

✅ **Agregar `http://localhost:3000` a la allowlist en [cloud.reown.com](https://cloud.reown.com)**

Este es el paso CRÍTICO que resuelve el problema principal.

### 2. Solución de Código (Mejora)

Mejorar el manejo de errores en `Promise.all` para que no falle completamente si una sola llamada falla:

```ts
// src/hooks/useUserRoles.ts
const results = await Promise.all(
  rolePromises.map(promise => promise.catch(error => {
    console.error('Failed to fetch role hash:', error);
    return null;
  }))
);

// Validar resultados antes de usarlos
const [fabricanteRole, auditorHwRole, tecnicoSwRole, escuelaRole] = results;

if (!fabricanteRole || !auditorHwRole || !tecnicoSwRole || !escuelaRole) {
  console.error('No se pudieron obtener todos los hashes de roles');
  setUserRoles(prev => ({ ...prev, isLoading: false }));
  return;
}
```

### 3. Solución Óptima (Arquitectura)

Agregar los hashes de roles como constantes en el contrato o backend para evitar lecturas repetidas:

```ts
// En lugar de leer de contrato, usar valores predefinidos
const ROLE_HASHES = {
  FABRICANTE_ROLE: '0x...',
  AUDITOR_HW_ROLE: '0x...',
  // ...
} as const;
```

## 📌 Recomendación Final

1. **Prioridad 1**: Registrar `http://localhost:3000` en cloud.reown.com
2. **Prioridad 2**: Implementar manejo de errores robusto en `Promise.all`
3. **Prioridad 3**: Considerar cachear o definir manualmente los hashes de roles

> El error principal es de configuración, no de código. Sin acceso al dashboard de Reown, no puede resolverse completamente desde el frontend.