# Documentación Funcional del Código

Este documento proporciona una descripción detallada de todas las funcionalidades implementadas en el sistema SupplyChainTracker, incluyendo tanto el contrato inteligente como la interfaz frontend.

## 1. Contrato Inteligente (SupplyChainTracker.sol)

### 1.1 Arquitectura General

El contrato `SupplyChainTracker` es un sistema de trazabilidad para netbooks que utiliza un patrón de máquina de estados con control de acceso basado en roles (RBAC). Cada netbook avanza secuencialmente a través de cuatro estados:

1. **FABRICADA**: Estado inicial cuando se registra una nueva netbook
2. **HW_APROBADO**: Después de la auditoría de hardware
3. **SW_VALIDADO**: Después de la validación del software
4. **DISTRIBUIDA**: Cuando se asigna a un estudiante final

### 1.2 Roles y Permisos

El contrato implementa un sistema de autorización basado en roles utilizando OpenZeppelin AccessControl:

| Rol | Función | Requiere Estado Previo |
|-----|--------|-------------------|
| `DEFAULT_ADMIN_ROLE` | Gobernanza: otorgar/revocar otros roles | N/A |
| `FABRICANTE_ROLE` | Registrar nuevas netbooks | N/A |
| `AUDITOR_HW_ROLE` | Auditar hardware | `FABRICADA` |
| `TECNICO_SW_ROLE` | Validar software | `HW_APROBADO` |
| `ESCUELA_ROLE` | Asignar a estudiante | `SW_VALIDADO` |

### 1.3 Estructura de Datos

La estructura `Netbook` almacena todos los datos relevantes del ciclo de vida:

```solidity
struct Netbook {
    // Datos de Origen
    string serialNumber;
    string batchId;
    string initialModelSpecs;

    // Datos de Hardware
    address hwAuditor;
    bool hwIntegrityPassed;
    bytes32 hwReportHash;

    // Datos de Software
    address swTechnician;
    string osVersion;
    bool swValidationPassed;

    // Datos de Destino
    bytes32 destinationSchoolHash;
    bytes32 studentIdHash;
    uint distributionTimestamp;

    // Estado actual
    State currentState;
}
```

### 1.4 Funciones Principales

#### Funciones de Escritura (Transacciones)

- **`registerNetbooks`**: Registra múltiples netbooks a la vez con sus datos iniciales
- **`auditHardware`**: Registra los resultados de la auditoría de hardware
- **`validateSoftware`**: Valida el software instalado en la netbook
- **`assignToStudent`**: Asigna la netbook finalizada a un estudiante

#### Funciones de Lectura (Consultas)

- **`getNetbookState`**: Obtiene el estado actual de una netbook
- **`getNetbookReport`**: Obtiene el reporte completo de trazabilidad

### 1.5 Eventos

El contrato emite eventos para cada transición importante:

- `NetbookRegistered`: Cuando se registra una nueva netbook
- `HardwareAudited`: Cuando se completa la auditoría de hardware
- `SoftwareValidated`: Cuando se valida el software
- `AssignedToStudent`: Cuando se asigna a un estudiante

## 2. Interfaz Frontend

### 2.1 Arquitectura del Cliente

La interfaz frontend está construida con Next.js y sigue una arquitectura modular:

```
web/
├── src/
│   ├── app/
│   ├── components/
│   ├── contexts/
│   ├── contracts/
│   ├── hooks/
│   ├── lib/
│   ├── services/
│   └── types/
```

### 2.2 Servicios de Web3

#### Web3Service (web/src/services/Web3Service.ts)

Servicio base que maneja la conexión con la blockchain:

- Inicializa el proveedor Ethereum desde el navegador
- Gestiona la conexión con la wallet del usuario
- Proporciona acceso al proveedor, signer y contrato
- Implementa funciones de utilidad para red y balance

#### SupplyChainService (web/src/services/SupplyChainService.ts)

Servicio especializado para interactuar con SupplyChainTracker:

- Wrapper tipo-safe alrededor de Web3Service
- Métodos para todas las funciones del contrato
- Manejo de errores y logging
- Funciones de utilidad para conectividad y cuenta actual

### 2.3 Componentes Principales

#### Dashboard

- **`ManagerDashboard`**: Componente principal que muestra métricas clave
  - Tarjetas de resumen con conteos por estado
  - Lista de seguimiento de netbooks
  - Diseño responsive con Tailwind CSS

#### UI/UX

- Uso de shadcn/ui para componentes modernos y accesibles
- Diseño completamente responsive
- Iconos SVG integrados para indicadores de estado
- Estilo coherente con Tailwind CSS

## 3. Configuración y Despliegue

### 3.1 Variables de Entorno

```env
# RPC URL para conexión con Anvil
NEXT_PUBLIC_ANVIL_RPC_URL=http://127.0.0.1:8545

# Dirección del contrato desplegado
NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### 3.2 Arquitectura de Contratos

```
sc/
├── src/
│   ├── SupplyChainTracker.sol
│   └── Counter.sol
├── lib/
│   ├── forge-std
│   └── openzeppelin-contracts
```

## 4. Diagramas

### 4.1 Diagrama de Flujo de Estado

```plaintext
      +------------+
      |  FABRICADA |
      +------------+
           |
           | auditHardware()
           ↓
+-------------------+
|   HW_APROBADO     |
+-------------------+
           |
           | validateSoftware()
           ↓
+-------------------+
|   SW_VALIDADO     |
+-------------------+
           |
           | assignToStudent()
           ↓
+-------------------+
|   DISTRIBUIDA     |
+-------------------+
```

### 4.2 Diagrama de Arquitectura del Sistema

```plaintext
+----------------+     +---------------------+     +-----------------------+
|                |     |                     |     |                       |
|   Navegador    |<--->|   Aplicación Web    |<--->|   Blockchain (Anvil)  |
|   (Frontend)   |     |   (Next.js + Web3)  |     |   (SupplyChainTracker) |
|                |     |                     |     |                       |
+----------------+     +---------------------+     +-----------------------+
```

## 5. Consideraciones de Seguridad

- Validación exhaustiva de roles antes de cada operación
- Chequeo de estado previo para garantizar flujos de trabajo correctos
- Uso de hashes criptográficos para proteger datos sensibles
- Inmutabilidad del historial de trazabilidad
- Auditoría pública de todo el ciclo de vida

# Generated with [Continue](https://continue.dev)
Co-Authored-By: Continue <noreply@continue.dev>