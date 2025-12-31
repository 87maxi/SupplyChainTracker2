# Sistema de Trazabilidad de Netbooks - Visión General

## 🏗️ Arquitectura del Sistema

El sistema de trazabilidad de netbooks es una aplicación web3 completa que combina un contrato inteligente en Solidity con una interfaz de usuario moderna basada en Next.js. La arquitectura sigue un diseño modular con separación clara entre los componentes de blockchain y frontend.

### Estructura General
```
SupplyChainTracker2/
├── sc/                       # Contratos inteligentes (Foundry)
│   ├── src/                  # Código Solidity
│   │   └── SupplyChainTracker.sol
│   ├── lib/                  # Dependencias (OpenZeppelin)
│   └── foundry.toml          # Configuración de Foundry
├── web/                      # Aplicación frontend (Next.js)
│   ├── src/
│   │   ├── app/              # Páginas (App Router)
│   │   ├── components/       # Componentes UI
│   │   ├── contexts/         # Contextos de React
│   │   ├── contracts/        # ABIs de contratos
│   │   ├── hooks/            # Hooks personalizados
│   │   ├── lib/              # Utilidades y configuración
│   │   ├── services/         # Servicios de negocio
│   │   └── types/            # Tipos TypeScript
│   ├── .env.local          # Variables de entorno
│   └── package.json
└── docs/                   # Documentación del proyecto
```

## 🔗 Integración Blockchain-Frontend

El sistema utiliza una pila tecnológica moderna para la interacción entre la interfaz y la blockchain:

- **Wagmi**: Abstracción de bajo nivel para interacción con Ethereum
- **RainbowKit**: Componentes UI para conexión de wallets
- **Viem**: Cliente TypeScript para Ethereum con tipado estricto
- **Ethers**: Biblioteca para operaciones criptográficas

Diagrama de arquitectura:
```puml
@startuml
skinparam componentStyle uml2

title Arquitectura del Sistema

database "Blockchain (Anvil)" as blockchain {
  ["Contrato\nSupplyChainTracker"] as contract
}

package "Frontend Web" {
  ["App Router\n(Next.js)"] as app
  ["Componentes UI\n(shadcn)"] as ui
  ["Hooks"] as hooks
  ["Servicios"] as services
  ["Librerías\n(Wagmi/Viem)"] as lib
}

app --> hooks : Usa
hooks --> services : Invoca
services --> lib : Interactúa
lib --> contract : Comunica via RPC
contract --> blockchain : Almacena estado

note right of lib
  Configurado con:\n- NEXT_PUBLIC_ANVIL_RPC_URL\n- NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS
end note

@enduml
```

---

## 🔄 Flujo de Datos End-to-End

El sistema opera con un flujo de datos coherente entre frontend, blockchain y base de datos, gestionado mediante hooks, servicios y API REST:

```puml
@startuml
' Arquitectura de Flujo de Datos del Sistema de Trazabilidad de Netbooks

skinparam componentStyle uml2
skinparam defaultTextAlignment center

package "Usuario Final (Web3)" {
  [Wallet Connect] as wallet
  [Frontend UI] as frontend
}

package "Frontend Web (Next.js)" {
  [Wagmi/Viem] as wagmi
  [RoleMapper] as roleMapper
  [SupplyChainService] as service
  [MongoDB API] as mongoApi
}

package "Backend" {
  [Blockchain (Anvil)] as blockchain
  [MongoDB] as mongodb
}

' Flujo de conexión de wallet
wallet --> frontend : Conexión con MetaMask
frontend --> wagmi : Inicializa conexión
wagmi --> blockchain : RPC (http://localhost:8545)

' Flujo de registro de netbook
frontend --> service : registerNetbooks(serial, batch, specs)
service --> wagmi : writeContract(grantRole)
wagmi --> blockchain : Transacción (grantRole)
blockchain --> mongodb : Escribe en netbook_data

' Flujo de auditoría de hardware
frontend --> service : auditHardware(serial, passed, hash)
service --> wagmi : writeContract(auditHardware)
wagmi --> blockchain : Transacción (auditHardware)
blockchain --> mongodb : Escribe en transactions

' Flujo de validación de software
frontend --> service : validateSoftware(serial, osVersion, passed)
service --> wagmi : writeContract(validateSoftware)
wagmi --> blockchain : Transacción (validateSoftware)
blockchain --> mongodb : Escribe en transactions

' Flujo de asignación a estudiante
frontend --> service : assignToStudent(serial, schoolHash, studentHash)
service --> wagmi : writeContract(assignToStudent)
wagmi --> blockchain : Transacción (assignToStudent)
blockchain --> mongodb : Escribe en netbook_data

' Flujo de gestión de roles (Admin)
frontend --> roleMapper : normalizeRoleName("AUDITOR_HW")
roleMapper --> service : getRoleHash("AUDITOR_HW")
service --> wagmi : readContract(getRoleByName)
wagmi --> blockchain : readContract(getRoleByName)
blockchain --> service : Devuelve hash
service --> wagmi : writeContract(grantRole)
wagmi --> blockchain : Transacción (grantRole)
blockchain --> mongodb : Escribe en role_data

' Flujo de consulta de estado
frontend --> service : getNetbookState(serial)
service --> wagmi : readContract(getNetbookState)
wagmi --> blockchain : readContract(getNetbookState)
blockchain --> service : Devuelve estado
service --> frontend : Renderiza estado

' Flujo de sincronización de datos
mongoApi --> mongodb : GET /api/mongodb/netbooks
mongodb --> mongoApi : Devuelve netbooks
mongoApi --> frontend : Renderiza tabla

note right of blockchain
  Contrato: SupplyChainTracker.sol
  Roles: FABRICANTE, AUDITOR_HW,
        TECNICO_SW, ESCUELA, ADMIN
  Estados: FABRICADA → HW_APROBADO →
           SW_VALIDADO → DISTRIBUIDA
end note

note right of mongodb
  Colecciones:
  - netbook_data
  - role_data
  - transactions
  - users
end note

@enduml
```
```

## 📦 Contrato Inteligente Principal

### SupplyChainTracker.sol

Contrato que implementa el seguimiento del ciclo de vida de netbooks educativas con control de acceso basado en roles.

**Herencia**:
- `AccessControlEnumerable` (OpenZeppelin)

**Roles**:
- `FABRICANTE_ROLE`: Registro de dispositivos
- `AUDITOR_HW_ROLE`: Aprobación de hardware
- `TECNICO_SW_ROLE`: Validación de software
- `ESCUELA_ROLE`: Asignación a estudiantes
- `DEFAULT_ADMIN_ROLE`: Gestión de roles

**Estados de Netbook**:
1. `FABRICADA`
2. `HW_APROBADO` 
3. `SW_VALIDADO`
4. `DISTRIBUIDA`

**Flujo de Estado**:
```puml
@startuml
state FABRICADA
state HW_APROBADO
state SW_VALIDADO 
state DISTRIBUIDA

[*] --> FABRICADA
FABRICADA --> HW_APROBADO : auditHardware()
HW_APROBADO --> SW_VALIDADO : validateSoftware()
SW_VALIDADO --> DISTRIBUIDA : assignToStudent()

note right of FABRICADA
  Verificación de integridad
  de hardware completada
end note

note right of SW_VALIDADO
  Sistema operativo y
  software validados
end note

@enduml
```

## 💻 Frontend - Estructura de Componentes

### Estructura de Directorios
```
src/
├── app/
│   ├── page.tsx            # Página principal
│   └── admin/
│       ├── page.tsx        # Panel administrativo
│       └── roles/
│           └── page.tsx    # Gestión de roles
├── components/
│   ├── ui/                 # Componentes shadcn
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   └── layout/
│       └── Header.tsx      # Navegación principal
├── contexts/
│   └── Web3Context.tsx     # Estado de conexión Web3
├── contracts/
│   └── abi/
│       └── SupplyChainTracker.json
├── hooks/
│   └── useUserRoles.ts     # Verificación de roles
├── lib/
│   ├── wagmi/
│   │   └── config.ts       # Configuración Wagmi
│   └── env.ts              # Variables de entorno
├── services/
│   └── SupplyChainService.ts # Servicio principal
└── types/
    └── supply-chain-types.ts
```

## 🔐 Control de Acceso y Roles

El sistema implementa un mecanismo robusto de control de acceso basado en roles (RBAC) tanto en la blockchain como en el frontend.

### Mapeo de Roles

| Rol | Dirección/Búsqueda | Contrato | Frontend |
|------|-------------------|----------|----------|
| Administrador | `DEFAULT_ADMIN_ROLE` | `hasRole()` | `useUserRoles` |
| Fabricante | `FABRICANTE_ROLE` | `hasRole()` | `useUserRoles` |
| Auditor HW | `AUDITOR_HW_ROLE` | `hasRole()` | `useUserRoles` |
| Técnico SW | `TECNICO_SW_ROLE` | `hasRole()` | `useUserRoles` |
| Escuela | `ESCUELA_ROLE` | `hasRole()` | `useUserRoles` |

### Hook useUserRoles

Hook personalizado que determina los permisos del usuario actual basado en la conexión a wallet:

```typescript
export const useUserRoles = (): UseUserRoles => {
  const { address, isConnected } = useWeb3();
  
  // Obtiene hashes de roles del contrato
  const rolePromises = [
    readContract(config, {
      address: contractAddress,
      abi: SupplyChainTrackerABI,
      functionName: 'FABRICANTE_ROLE'
    }),
    // ... otros roles
  ];
  
  // Verifica roles del usuario actual
  const [isAdmin, isManufacturer, /* ... */] = await Promise.all([
    SupplyChainService.hasRole('0x000...000', address),
    SupplyChainService.hasRole(fabricanteRoleStr, address),
    // ... otros roles
  ]);
  
  return {
    isAdmin,
    isManufacturer,
    isHardwareAuditor,
    isSoftwareTechnician,
    isSchool,
    isLoading,
    hasRole,
    activeRoleNames
  };
};
```

## ⚙️ Configuración y Variables de Entorno

### Archivo .env.local

```env
# RPC URL for Anvil connection
NEXT_PUBLIC_ANVIL_RPC_URL=http://127.0.0.1:8545

# Deployed contract address
NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

# WalletConnect Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=3f2061443d834950482da0873d6e32d6

# Default admin address
NEXT_PUBLIC_DEFAULT_ADMIN_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

#