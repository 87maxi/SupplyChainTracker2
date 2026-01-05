# Diagrama UML del Proyecto

## Componentes Principales

### Web UI (`./web`)

#### Admin Panel
- **ApprovedAccountsList**: Lista de cuentas aprobadas.
- **DashboardMetrics**: Métricas del panel de control.
- **EnhancedRoleApprovalDialog**: Diálogo de aprobación de roles mejorado.
- **NetbookStateMetrics**: Métricas del estado de los netbooks.
- **PendingRoleRequests**: Solicitudes de roles pendientes.
- **RoleManagementSection**: Sección de gestión de roles.
- **RoleRequestsDashboard**: Tablero de solicitudes de roles.
- **SystemHealth**: Estado del sistema.

#### Dashboard
- **NetbookDataTable**: Tabla de datos de netbooks.
- **NetbookStats**: Estadísticas de netbooks.
- **PendingRoleApprovals**: Aprobaciones de roles pendientes.
- **RoleActions**: Acciones de roles.
- **StatusBadge**: Etiqueta de estado.
- **TrackingCard**: Tarjeta de seguimiento.
- **UserDataTable**: Tabla de datos de usuarios.
- **UserStats**: Estadísticas de usuarios.

#### Contracts
- **SupplyChainTracker**: Contrato principal de la cadena de suministro.
- **Counter**: Contrato de ejemplo.

#### UI Components
- **Button**: Botón reutilizable.
- **Calendar**: Calendario reutilizable.
- **Chart**: Gráfico reutilizable.
- **Popover**: Popover reutilizable.
- **Select**: Selección reutilizable.
- **Types**: Tipos reutilizables.

### Smart Contract (`./sc`)

- **SupplyChainTracker**: Contrato principal de la cadena de suministro.
- **Counter**: Contrato de ejemplo.

## Relaciones y Componentes

### Admin Panel
- **ApprovedAccountsList** se comunica con **SupplyChainTracker**.
- **DashboardMetrics** se comunica con **SupplyChainTracker**.
- **EnhancedRoleApprovalDialog** se comunica con **SupplyChainTracker**.
- **NetbookStateMetrics** se comunica con **SupplyChainTracker**.
- **PendingRoleRequests** se comunica con **SupplyChainTracker**.
- **RoleManagementSection** se comunica con **SupplyChainTracker**.
- **RoleRequestsDashboard** se comunica con **SupplyChainTracker**.
- **SystemHealth** se comunica con **SupplyChainTracker**.

### Dashboard
- **NetbookDataTable** se comunica con **SupplyChainTracker**.
- **NetbookStats** se comunica con **SupplyChainTracker**.
- **PendingRoleApprovals** se comunica con **SupplyChainTracker**.
- **RoleActions** se comunica con **SupplyChainTracker**.
- **StatusBadge** se comunica con **SupplyChainTracker**.
- **TrackingCard** se comunica con **SupplyChainTracker**.
- **UserDataTable** se comunica con **SupplyChainTracker**.
- **UserStats** se comunica con **SupplyChainTracker**.

### UI Components
- **Button** se utiliza en **Admin Panel**.
- **Calendar** se utiliza en **Admin Panel**.
- **Chart** se utiliza en **Admin Panel**.
- **Popover** se utiliza en **Admin Panel**.
- **Select** se utiliza en **Admin Panel**.
- **Types** se utiliza en **Admin Panel**.

- **Button** se utiliza en **Dashboard**.
- **Calendar** se utiliza en **Dashboard**.
- **Chart** se utiliza en **Dashboard**.
- **Popover** se utiliza en **Dashboard**.
- **Select** se utiliza en **Dashboard**.
- **Types** se utiliza en **Dashboard**.

- **Button** se utiliza en **UI Components**.
- **Calendar** se utiliza en **UI Components**.
- **Chart** se utiliza en **UI Components**.
- **Popover** se utiliza en **UI Components**.
- **Select** se utiliza en **UI Components**.
- **Types** se utiliza en **UI Components**.

### Smart Contract (`./sc`)
- **SupplyChainTracker** se comunica con **Counter**.