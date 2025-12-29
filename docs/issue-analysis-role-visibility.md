# Análisis del Problema: Visibilidad de Solicitudes de Roles para Administrador

## Problema Reportado

Las solicitudes de roles realizadas por usuarios no aparecen en el panel de administrador para su aprobación/rechazo. Este es el problema más crítico del sistema actual, ya que impide la gestión de accesos.

## Investigación del Flujo Completo

### 1. Flujo de Solicitud de Rol

Análisis del componente `profile/page.tsx`:

```tsx
// Llamada a addRequest cuando se envía una solicitud
addRequest({
  address,
  role: selectedRole
});
```

El hook `useRoleRequests` maneja esta solicitud:

```tsx
// En useRoleRequests.ts
const addRequest = (request: Omit<RoleRequest, 'id' | 'status' | 'timestamp'>) => {
  const newRequest: RoleRequest = {
    ...request,
    id: Math.random().toString(36).substring(7),
    status: 'pending',
    timestamp: Date.now()
  };
  
  setPendingRequests(prev => [...prev, newRequest]);
  
  // Guarda en localStorage
  // ...
};
```

### 2. Persistencia de Datos

El sistema actual tiene dos mecanismos de persistencia:

1. **localStorage** - Usado por el hook useRoleRequests
2. **web/role-requests.json** - Archivo estático en el servidor

### 3. Lectura de Solicitudes por el Administrador

Análisis de `PendingRoleRequests.tsx`:

```tsx
// El componente lee las solicitudes del hook
const { requests } = useRoleRequests();
```

El hook `useRoleRequests` lee desde localStorage:

```tsx
// En useRoleRequests.ts - useEffect para cargar datos
useEffect(() => {
  try {
    const stored = localStorage.getItem('role_requests');
    if (stored) {
      const requests = JSON.parse(stored);
      const pending = requests.filter((req: RoleRequest) => req.status === 'pending');
      setPendingRequests(pending);
    }
  } catch (error) {
    console.error('Error loading role requests from localStorage:', error);
    setPendingRequests([]);
  }
}, []);
```

## Diagnóstico del Problema

El problema principal identificado es una **inconsistencia en los mecanismos de persistencia**:

1. El componente de perfil parece guardar solicitudes en `web/role-requests.json` a través de una API que ya fue eliminada
2. El componente de administrador lee únicamente desde localStorage
3. No hay sincronización entre estos dos mecanismos de almacenamiento

Además, la API que debería manejar estas solicitudes (`/api/role-requests`) ha sido eliminada, lo que rompe completamente el flujo.

## Conclusión

El sistema tiene un grave problema de arquitectura: **hay dos fuentes de datos distintas para las solicitudes de roles, pero no están sincronizadas entre sí**. El administrador no puede ver las solicitudes porque está leyendo de una fuente (localStorage) mientras que las solicitudes se almacenan en otra (web/role-requests.json) o simplemente se pierden al no haber API para procesarlas.