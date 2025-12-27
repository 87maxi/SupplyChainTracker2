# API Reference - SupplyChainTracker

Esta documentación detalla las funciones del contrato inteligente, servicios de backend y hooks de React disponibles en el sistema.

## 📄 Contrato Inteligente

Contrato: `SupplyChainTracker`

### Funciones de Escritura

#### registerNetbooks
```solidity
function registerNetbooks(
    string[] calldata serials,
    string[] calldata batches,
    string[] calldata specs
) external
```

**Descripción**: Registra múltiples netbooks en el sistema con sus especificaciones iniciales.

**Parámetros**:
- `serials`: Array de números de serie únicos
- `batches`: Array de IDs de lote correspondientes
- `specs`: Array de especificaciones del modelo inicial

**Requisitos**:
- El llamador debe tener el rol `FABRICANTE_ROLE`
- Todos los arrays deben tener la misma longitud
- Los números de serie no pueden estar vacíos
- Los números de serie no pueden estar ya registrados

**Transiciones de Estado**:
- Crea una nueva `Netbook` con estado `FABRICADA`
- Emite evento `NetbookRegistered` para cada dispositivo

**Eventos**:
```solidity
event NetbookRegistered(string serialNumber, string batchId, address manufacturer);
```

---

#### auditHardware
```solidity
function auditHardware(
    string calldata serial,
    bool passed,
    bytes32 reportHash
) external
```

**Descripción**: Realiza la auditoría de hardware para una netbook específica.

**Parámetros**:
- `serial`: Número de serie de la netbook
- `passed`: Indica si la auditoría fue exitosa
- `reportHash`: Hash del reporte de auditoría (almacenado en IPFS o sistema similar)

**Requisitos**:
- El llamador debe tener el rol `AUDITOR_HW_ROLE`
- La netbook debe existir
- El estado actual debe ser `FABRICADA`

**Transiciones de Estado**:
- Actualiza el estado de la netbook a `HW_APROBADO`
- Registra el auditor, resultado y hash del reporte
- Emite evento `HardwareAudited`

**Eventos**:
```solidity
event HardwareAudited(string serialNumber, address auditor, bool passed);
```

---

#### validateSoftware
```solidity
function validateSoftware(
    string calldata serial,
    string calldata osVersion,
    bool passed
) external
```

**Descripción**: Valida el software instalado en una netbook.

**Parámetros**:
- `serial`: Número de serie de la netbook
- `osVersion`: Versión del sistema operativo instalado
- `passed`: Indica si la validación fue exitosa

**Requisitos**:
- El llamador debe tener el rol `TECNICO_SW_ROLE`
- La netbook debe existir
- El estado actual debe ser `HW_APROBADO`

**Transiciones de Estado**:
- Actualiza el estado de la netbook a `SW_VALIDADO`
- Registra el técnico, versión de OS y resultado
- Emite evento `SoftwareValidated`

**Eventos**:
```solidity
event SoftwareValidated(string serialNumber, address technician, string osVersion);
```

---

#### assignToStudent
```solidity
function assignToStudent(
    string calldata serial,
    bytes32 schoolHash,
    bytes32 studentHash
) external
```

**Descripción**: Asigna una netbook a un estudiante específico en una escuela.

**Parámetros**:
- `serial`: Número de serie de la netbook
- `schoolHash`: Hash del identificador de la escuela (para privacidad)
- `studentHash`: Hash del identificador del estudiante (para privacidad)

**Requisitos**:
- El llamador debe tener el rol `ESCUELA_ROLE`
- La netbook debe existir
- El estado actual debe ser `SW_VALIDADO`

**Transiciones de Estado**:
- Actualiza el estado de la netbook a `DISTRIBUIDA`
- Registra la escuela, estudiante y timestamp de distribución
- Emite evento `NetbookAssigned`

**Eventos**:
```solidity
event NetbookAssigned(string serialNumber, bytes32 schoolHash, bytes32 studentHash);
```

---

### Funciones de Lectura

#### getNetbookState
```solidity
function getNetbookState(string calldata serial) external view returns (State)
```

**Descripción**: Obtiene el estado actual de una netbook específica.

**Parámetros**:
- `serial`: Número de serie de la netbook

**Retorna**:
- `State`: Enum del estado actual (FABRICADA, HW_APROBADO, SW_VALIDADO, DISTRIBUIDA)

**Requisitos**:
- La netbook debe existir

---

#### getNetbookReport
```solidity
function getNetbookReport(string calldata serial) external view returns (Netbook memory)
```

**Descripción**: Obtiene el informe completo de una netbook, incluyendo todos sus datos de trazabilidad.

**Parámetros**:
- `serial`: Número de serie de la netbook

**Retorna**:
- `Netbook`: Estructura completa con todos los datos de la netbook

**Estructura Netbook**:
```solidity
struct Netbook {
    // A. Datos de Origen
    string serialNumber;
    string batchId;
    string initialModelSpecs;

    // B. Datos de Hardware
    address hwAuditor;
    bool hwIntegrityPassed;
    bytes32 hwReportHash;

    // C. Datos de Software
    address swTechnician;
    string osVersion;
    bool swValidationPassed;

    // D. Datos de Destino
    bytes32 destinationSchoolHash;
    bytes32 studentIdHash;
    uint256 distributionTimestamp;

    // Estado actual
    State currentState;
    bool exists;
}
```

---

#### getAllSerialNumbers
```solidity
function getAllSerialNumbers() external view returns (string[] memory)
```

**Descripción**: Obtiene todos los números de serie registrados en el sistema.

**Retorna**:
- `string[]`: Array de todos los números de serie

---

#### totalNetbooks
```solidity
function totalNetbooks() external view returns (uint256)
```

**Descripción**: Obtiene el número total de netbooks registradas en el sistema.

**Retorna**:
- `uint256`: Cantidad total de netbooks

---

#### getNetbooksByState
```solidity
function getNetbooksByState(State state) external view returns (string[] memory)
```

**Descripción**: Obtiene todos los números de serie que se encuentran en un estado específico.

**Parámetros**:
- `state`: Estado a filtrar (FABRICADA, HW_APROBADO, etc.)

**Retorna**:
- `string[]`: Array de números de serie en el estado especificado

---

#### getAllMembers
```solidity
function getAllMembers(bytes32 role) public view returns (address[] memory)
```

**Descripción**: Obtiene todas las direcciones que tienen un rol específico.

**Parámetros**:
- `role`: Hash del rol a consultar

**Retorna**:
- `address[]`: Array de direcciones que tienen el rol especificado

---

## 💻 Servicios de Backend

### SupplyChainService

Servicio principal para interactuar con el contrato `SupplyChainTracker`.

```typescript
// src/services/SupplyChainService.ts
import { getContract } from 'viem';
import { config } from '@/lib/wagmi/config';
import { publicClient, walletClient } from '@/lib/wagmi/clients';
import SupplyChainTrackerABI from '@/contracts/abi/SupplyChainTracker.json';
import {
  NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS
} from '@/lib/env';

const contractAddress = NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS as `0x${string}`;

// Clientes
const contractPublicClient = getContract({
  address: contractAddress,
  abi: SupplyChainTrackerABI,
  client: publicClient
});
