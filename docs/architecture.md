# SupplyChainTracker - Documentación de Arquitectura

Este documento describe la arquitectura, diseño y funcionalidad del contrato inteligente `SupplyChainTracker`, desarrollado para garantizar la trazabilidad y seguridad en la cadena de suministro de netbooks.

## 1. Visión General

El sistema `SupplyChainTracker` es un contrato inteligente basado en blockchain que registra de forma inmutable e inmutable el ciclo de vida de una netbook, desde su fabricación hasta su distribución final a un estudiante. Utiliza principios de **Control de Acceso Basado en Roles (RBAC)** y **Máquina de Estados (State Machine)** para asegurar integridad, autenticidad y privacidad.

---

## 2. Arquitectura de Diseño

### 2.1 Patrones de Diseño Clave

#### 2.1.1 Control de Acceso Basado en Roles (RBAC)

Se implementa utilizando la biblioteca `AccessControl` de OpenZeppelin. Cada acción crítica está restringida a un rol específico:

| Rol | Descripción |
|---|---|
| `DEFAULT_ADMIN_ROLE` | Gobernanza: puede otorgar y revocar cualquier rol. |
| `FABRICANTE_ROLE` | Puede registrar nuevas netbooks. |
| `AUDITOR_HW_ROLE` | Puede aprobar el hardware verificado. |
| `TECNICO_SW_ROLE` | Puede validar el software instalado. |
| `ESCUELA_ROLE` | Puede asignar la netbook a un estudiante final. |

#### 2.1.2 Máquina de Estados

Cada netbook avanza secuencialmente a través de los siguientes estados, sin permitir retrocesos o saltos:

1. `FABRICADA` → (auditoría) → 2. `HW_APROBADO` → (validación SW) → 3. `SW_VALIDADO` → (distribución) → 4. **`DISTRIBUIDA`**


Cada transición requiere el estado previo correcto, garantizando un flujo de trabajo coherente.

### 2.2 Diagrama UML de Clases

```plaintext
┌─────────────────────────────────────────────────────────────┐
│                     SupplyChainTracker                      │
├─────────────────────────────────────────────────────────────┤
│ - netbooks: mapping(string => Netbook)                      │
│ - allSerialNumbers: string[]                                │
├──────────────────────────────────┬──────────────────────────┤
│   // Roles                        │                          │
│   FABRICANTE_ROLE                │   DEFAULT_ADMIN_ROLE     │
│   AUDITOR_HW_ROLE                │   ESCUELA_ROLE           │
│   TECNICO_SW_ROLE                │                          │
├──────────────────────────────────┴──────────────────────────┤
│   // Estado de la Netbook                                    │
│   enum State { FABRICADA, HW_APROBADO, SW_VALIDADO, ... }    │
├─────────────────────────────────────────────────────────────┤
│   // Reporte de la Netbook                                     │
│   struct Netbook {                                           │
│       serialNumber, batchId, initialModelSpecs              │
│       hwAuditor, hwIntegrityPassed, hwReportHash            │
│       swTechnician, osVersion, swValidationPassed           │
│       destinationSchoolHash, studentIdHash, ...            │
│   }                                                        │
├─────────────────────────────────────────────────────────────┤
│   // Eventos Públicos                                         │
│   event NetbookRegistered(string serial);                   │
│   event HardwareAudited(string serial);                     │
│   event SoftwareValidated(string serial);                   │
│   event AssignedToStudent(string serial);                   │
├─────────────────────────────────────────────────────────────┤
│   // Funciones (Módulo de Gobernanza)                        │
│   + grantRole(role, account)                                │
│   + revokeRole(role, account)                               │
├─────────────────────────────────────────────────────────────┤
│   // Funciones (Módulo de Trazabilidad)                      │
│   + registerNetbooks(serials, batches, specs)               │
│   + auditHardware(serial, passed, reportHash)               │
│   + validateSoftware(serial, version, passed)               │
│   + assignToStudent(serial, schoolHash, studentHash)        │
├─────────────────────────────────────────────────────────────┤
│   // Funciones (Módulo de Reporte)                           │
│   + getNetbookState(serial): State                         │
│   + getNetbookReport(serial): Netbook                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Funcionalidad Detallada

### 3.1 Módulo de Gobernanza

- `grantRole(role, account)`: Permite al administrador otorgar un rol.
- `revokeRole(role, account)`: Permite al administrador revocar un rol.
- **Acceso**: Restringido solo a `DEFAULT_ADMIN_ROLE`.

### 3.2 Módulo de Trazabilidad (Escritura)


| Método | Rol Requerido | Precondición de Estado |
|---|---|---|
| `registerNetbooks` | `FABRICANTE_ROLE` | Ninguna | 
| `auditHardware` | `AUDITOR_HW_ROLE` | `FABRICADA` |
| `validateSoftware` | `TECNICO_SW_ROLE` | `HW_APROBADO` |
| `assignToStudent` | `ESCUELA_ROLE` | `SW_VALIDADO` |

### 3.3 Módulo de Reporte (Lectura)


- `getNetbookState(serial)`: Devuelve el estado actual (eficiente para verificaciones rápidas).
- `getNetbookReport(serial)`: Devuelve el estado completo del reporte de trazabilidad.

---

## 4. Consideraciones de Seguridad y Privacidad

- **Validación de Estado**: Se asegura de que las transiciones sean válidas usando modificadores `stateExpected`.
- **Validación de Rol**: Se utiliza `_checkRoleCustom` y `AccessControl` para autenticar al llamador.
- **Privacidad de Datos PII**: `studentIdHash` y `destinationSchoolHash` almacenan hashes criptográficos, no datos sensibles.
- **Inmutabilidad**: Una vez registrada una netbook, su historial no puede modificarse ni borrarse.
- **Auditoría Pública**: Cualquier entidad puede consultar el historial completo usando `getNetbookReport`.

---

## 5. Entidades de Datos

La estrucutura `Netbook` contiene:

- **Datos de Origen**: Registrados por el `FABRICANTE_ROLE`.
- **Datos de Hardware**: Registrados por el `AUDITOR_HW_ROLE`.
- **Datos de Software**: Registrados por el `TECNICO_SW_ROLE`.
- **Datos de Destino**: Registrados por el `ESCUELA_ROLE`.

---

## 6. Despliegue y Variables

Para detalles sobre direcciones, roles, y claves de despliegue, ver el archivo `variables.txt`.

---

# Generated with [Continue](https://continue.dev)
Co-Authored-By: Continue <noreply@continue.dev>