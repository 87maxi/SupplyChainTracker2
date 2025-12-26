# Documentación del Sistema de Gestión de Roles

## Componentes Principales

### AdminPage
Punto de entrada principal para la interfaz de administración. Maneja:
- Autenticación y verificación de roles
- Carga de datos iniciales
- Estado de carga y errores
- Navegación y layout principal

### DashboardMetrics
Componente de métricas que muestra:
- Solicitudes pendientes
- Actividad reciente
- Resumen de roles y usuarios
- Indicadores clave de rendimiento

### RoleManagementSection
Gestión completa de roles del sistema:
- Selección de rol
- Muestra de miembros
- Añadir/remover miembros
- Integración con contrato inteligente

### PendingRoleRequests
Manejo de solicitudes pendientes:
- Listado de solicitudes
- Aprobación/rechazo
- Notificaciones de estado
- Actualización en tiempo real

## Flujo de Datos

1. **Inicialización**: AdminPage verifica rol de administrador
2. **Carga de datos**: Se recuperan roles, solicitudes y logs
3. **Visualización**: Componentes muestran datos relevantes
4. **Interacción**: Usuario realiza acciones de gestión
5. **Actualización**: Estados se actualizan y se registran cambios

## Integración con Contratos

Los componentes interactúan con el contrato inteligente a través de:
- Hooks personalizados (useRoleContract)
- Servicios de contrato (RoleService)
- Configuración de Wagmi para transacciones

## Registro de Actividad

Todas las acciones se registran mediante ActivityLogger con:
- Tipo de acción
- Dirección del usuario
- Estado de la operación
- Metadata adicional
- Timestamp

Este registro permite auditoría completa del sistema.
