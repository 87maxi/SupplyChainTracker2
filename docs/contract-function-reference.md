# Referencia de Funciones del Contrato SupplyChainTracker

Este documento detalla todas las funciones disponibles en el contrato inteligente SupplyChainTracker, incluyendo sus parámetros, valores de retorno y eventos emitidos.

## Funciones de Escritura (Transacciones)

### grantRole

**Descripción**: Otorga un rol a una dirección específica.

**Parámetros**:
- `role` (bytes32): Hash del nombre del rol (por ejemplo: keccak256("AUDITOR_HW"))
- `account` (address): Dirección de la cuenta que recibirá el rol

**Eventos emitidos**:
- `RoleGranted(role, account, msg.sender)`

**Requisitos**:
- El llamante debe tener el rol administrador (DEFAULT_ADMIN_ROLE)
- El rol debe estar registrado en el sistema

**Gas estimate**: >= 30000

### requestRole

**Descripción**: Solicita un rol específico para la dirección del llamante.

**Parámetros**:
- `roleName` (string): Nombre del rol solicitado (por ejemplo: "AUDITOR_HW")

**Eventos emitidos**:
- `RoleRequested(role, msg.sender)`

**Requisitos**:
- El nombre del rol debe ser válido y estar configurado en el sistema
- El llamante no debe tener ya el rol solicitado

**Gas estimate**: >= 45000

### rejectRoleRequest

**Descripción**: Rechaza una solicitud de rol pendiente.

**Parámetros**:
- `account` (address): Dirección de la cuenta cuya solicitud será rechazada
- `role` (bytes32): Hash del rol que se está rechazando

**Eventos emitidos**:
- `RoleRequestRejected(role, account, msg.sender)`

**Requisitos**:
- El llamante debe tener el rol administrador (DEFAULT_ADMIN_ROLE)
- Debe existir una solicitud pendiente para esa cuenta y rol

**Gas estimate**: >= 30000

### registerNetbooks

**Descripción**: Registra múltiples netbooks en el sistema.

**Parámetros**:
- `serialNumbers` (string[]): Lista de números de serie de las netbooks
- `studentIds` (string[]): Lista de identificadores de estudiantes asociados (mismo tamaño que serialNumbers)
- `assignmentDates` (uint256[]): Lista de fechas de asignación (en timestamp)

**Eventos emitidos**:
- `NetbooksRegistered(serialNumbers, studentIds)`

**Requisitos**:
- El llamante debe tener el rol administrador (DEFAULT_ADMIN_ROLE)
- Todas las listas deben tener el mismo tamaño
- Los números de serie no deben estar duplicados ni ya registrados

**Gas estimate**: >= 100000 (depende del número de netbooks)

### approveHardware

**Descripción**: Aprueba la verificación de hardware para una netbook específica.

**Parámetros**:
- `serialNumber` (string): Número de serie de la netbook

**Eventos emitidos**:
- `HardwareApproved(serialNumber, msg.sender)`
- `NetbookStateChanged(serialNumber, previousState, newState)`

**Requisitos**:
- El llamante debe tener el rol de auditor de hardware (AUDITOR_HW_ROLE)
- La netbook debe existir
- El estado actual debe ser UNVERIFIED o HARDWARE_PENDING

**Gas estimate**: >= 45000

### validateSoftware

**Descripción**: Valida la instalación de software para una netbook específica.

**Parámetros**:
- `serialNumber` (string): Número de serie de la netbook
- `packageHash` (string): Hash del paquete de software instalado

**Eventos emitidos**:
- `SoftwareValidated(serialNumber, packageHash, msg.sender)`
- `NetbookStateChanged(serialNumber, previousState, newState)`

**Requisitos**:
- El llamante debe tener el rol de técnico de software (TECNICO_SW_ROLE)
- La netbook debe existir
- El estado actual debe ser HARDWARE_APPROVED o SOFTWARE_PENDING

**Gas estimate**: >= 50000

### distribute

**Descripción**: Marca una netbook como distribuida a su estudiante.

**Parámetros**:
- `serialNumber` (string): Número de serie de la netbook

**Eventos emitidos**:
- `NetbookDistributed(serialNumber, msg.sender)`
- `NetbookStateChanged(serialNumber, previousState, newState)`

**Requisitos**:
- El llamante debe tener el rol administrador (DEFAULT_ADMIN_ROLE)
- La netbook debe existir
- El estado actual debe ser SOFTWARE_APPROVED

**Gas estimate**: >= 40000

### setData

**Descripción**: Establece datos adicionales para una netbook.

**Parámetros**:
- `serialNumber` (string): Número de serie de la netbook
- `key` (string): Clave del dato a almacenar
- `value` (string): Valor del dato a almacenar

**Eventos emitidos**:
- `DataUpdated(serialNumber, key, value, msg.sender)`

**Requisitos**:
- El llamante debe tener el rol de auditor de hardware (AUDITOR_HW_ROLE) o técnico de software (TECNICO_SW_ROLE)
- La netbook debe existir

**Gas estimate**: >= 35000

## Funciones de Lectura (View/Pure)

### getRoleByName

**Descripción**: Obtiene el hash de un rol dado su nombre.

**Parámetros**:
- `roleName` (string): Nombre del rol (por ejemplo: "AUDITOR_HW")

**Valor de retorno**:
- `bytes32`: Hash del rol (por ejemplo: keccak256("AUDITOR_HW"))

**Tipo**: Pure

### hasRole

**Descripción**: Verifica si una cuenta tiene un rol específico.

**Parámetros**:
- `role` (bytes32): Hash del rol a verificar
- `account` (address): Dirección de la cuenta a verificar

**Valor de retorno**:
- `bool`: true si la cuenta tiene el rol, false en caso contrario

**Tipo**: View

### getPendingRoleRequests

**Descripción**: Obtiene todas las solicitudes de rol pendientes.

**Parámetros**: Ninguno

**Valor de retorno**:
- `PendingRoleRequest[]`: Array de estructuras con:
  - `role` (bytes32): Hash del rol solicitado
  - `account` (address): Dirección de la cuenta que solicitó el rol

**Tipo**: View

## Rol Default Admin

El rol administrador predeterminado (DEFAULT_ADMIN_ROLE) tiene el hash:
`0x0000000000000000000000000000000000000000000000000000000000000000`

Este rol es otorgado inicialmente al desplegador del contrato y permite gestionar todos los demás roles y funciones críticas del sistema.