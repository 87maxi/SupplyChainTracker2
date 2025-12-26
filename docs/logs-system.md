# Sistema de Logs de Actividad

## Descripción

El sistema de logs de actividad registra todas las acciones realizadas en la aplicación, permitiendo un seguimiento completo de la actividad del sistema. Los logs se almacenan en localStorage y proporcionan una interfaz para su visualización, filtrado y exportación.

## Estructura de Datos

### ActivityLog Interface

```typescript
interface ActivityLog {
  id: string; // UUID generado automáticamente
  type: 'role_change' | 'token_created' | 'transfer' | 'approval' | 'system' | 'error'; // Tipo de acción
  action: string; // Descripción breve de la acción
  description: string; // Descripción detallada opcional
  address: string; // Dirección del usuario que realizó la acción
  metadata?: Record<string, any>; // Metadatos adicionales del sistema
  status: 'success' | 'pending' | 'failed'; // Estado de la acción
  timestamp: Date; // Fecha y hora de la acción
  duration?: number; // Duración de la acción en ms
}
```

## Funcionalidades

### Logging de Actividad

El sistema proporciona funciones para registrar diferentes tipos de actividades:

- **logActivity**: Registra una acción general del sistema
- **logRoleChange**: Registra cambios de roles (asignación, revocación)
- **logTokenCreation**: Registra la creación de tokens
- **logTransfer**: Registra transferencias de tokens
- **logApproval**: Registra aprobaciones de roles
- **logError**: Registra errores del sistema
- **logSystemEvent**: Registra eventos del sistema

### Almacenamiento

Los logs se almacenan en localStorage bajo la clave `supply-chain-activity-logs`. El sistema maneja automáticamente:

- Serialización y deserialización de objetos Date
- Límite de almacenamiento (máximo 1000 registros)
- Persistencia entre sesiones
- Manejo de errores de almacenamiento

### Visualización

El componente `ActivityLogs` proporciona una interfaz completa para:

- **Listado de logs**: Tabla con paginación y ordenamiento
- **Filtros avanzados**:
  - Tipo de actividad
  - Estado (éxito, pendiente, fallido)
  - Dirección del usuario
  - Rango de fechas
  - Búsqueda de texto
- **Estadísticas en tiempo real**:
  - Total de registros
  - Registros en las últimas 24 horas
  - Éxitos
  - Errores
- **Exportación**: Descarga de logs en formato CSV

### Búsqueda y Filtros

El sistema permite filtrar logs por múltiples criterios combinados:

```typescript
interface LogFilter {
  type?: string;
  status?: 'success' | 'pending' | 'failed';
  address?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}
```

## Seguridad

El sistema de logs implementa medidas de seguridad:

- **Validación de entradas**: Todas las propiedades se validan antes de almacenarse
- **Sanitización**: Datos potencialmente peligrosos son sanitizados
- **Tamaño limitado**: El almacenamiento se limita para prevenir abuso
- **Acceso controlado**: Solo usuarios autorizados pueden ver ciertos tipos de logs
- **Enmascaramiento**: Información sensible puede ser enmascarada

## Integración con el Sistema

El sistema de logs está integrado con:

1. **Sistema de Roles**: Registra todos los cambios de roles
2. **Wallet Connect**: Registra conexiones y desconexiones
3. **Interacciones con Contratos**: Registra todas las transacciones
4. **Sistema de Errores**: Captura y registra excepciones

## Mejoras Futuras

- **Exportación a formatos adicionales** (PDF, JSON)
- **Alertas en tiempo real** para actividades críticas
- **Integración con servicios externos** (Sentry, LogRocket)
- **Búsqueda avanzada con expresiones regulares**
- **Gráficos de tendencias** de actividad
- **Sistema de auditoría** para cumplimiento normativo
- **Retención programada** de logs antiguos