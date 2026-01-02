# Implementación de Soporte para Múltiples Contratos

Este documento detalla cómo implementar soporte para múltiples contratos inteligentes en la aplicación web.

## Introducción

Actualmente, la aplicación solo interactúa con un único contrato `SupplyChainTracker`. Este documento presenta una arquitectura para soportar múltiples contratos, lo que permite la extensibilidad del sistema.

## Arquitectura Propuesta

### 1. Sistema de Registro de Contratos

Creamos un servicio centralizado que registra y gestiona múltiples contratos:

```typescript
// web/src/services/contract-registry.service.ts
import { BaseContractService } from './contracts/base-contract.service';

// Interfaz para la configuración de un contrato
export interface ContractConfig {
  address: `0x${string}`;
  abi: any;
  version?: string;
  deployBlock?: number;
}

// Registro central de contratos
export class ContractRegistry {
  private contracts = new Map<string, BaseContractService>();
  private config = new Map<string, ContractConfig>();

  // Registrar un contrato
  register(name: string, service: BaseContractService, config: ContractConfig) {
    this.contracts.set(name, service);
    this.config.set(name, config);
  }

  // Obtener un contrato por nombre
  get(name: string): BaseContractService | undefined {
    return this.contracts.get(name);
  }

  // Verificar si un contrato está registrado
  has(name: string): boolean {
    return this.contracts.has(name);
  }

  // Listar todos los contratos registrados
  list(): string[] {
    return Array.from(this.contracts.keys());
  }
}

// Instancia singleton
export const contractRegistry = new ContractRegistry();
```

### 2. Servicios de Contratos Específicos

Cada contrato tendrá su propio servicio que extiende `BaseContractService`:

```typescript
// web/src/services/supply-chain.service.ts
import { BaseContractService } from './contracts/base-contract.service';
import SupplyChainTrackerABI from '@/lib/contracts/abi/SupplyChainTracker.json';
import { contractRegistry, ContractConfig } from './contract-registry.service';

export class SupplyChainService extends BaseContractService {
  static instance: SupplyChainService | null = null;

  static getInstance(): SupplyChainService {
    if (!SupplyChainService.instance) {
      SupplyChainService.instance = new SupplyChainService();
    }
    return SupplyChainService.instance;
  }

  constructor() {
    super(
      process.env.NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS as `0x${string}`,
      SupplyChainTrackerABI,
      'supply-chain'
    );

    // Registrar este contrato en el registro
    const config: ContractConfig = {
      address: this.contractAddress,
      abi: this.abi,
      version: '1.0.0',
      deployBlock: 123456 // Este valor vendría del despliegue
    };
    contractRegistry.register('SupplyChainTracker', this, config);
  }

  // Métodos específicos del contrato...
}
```

### 3. Configuración de Variables de Entorno

Agregar soporte para múltiples contratos en las variables de entorno:

```env
# Contrato principal de Supply Chain
NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

# Nuevo contrato de Tokens (por ejemplo)
NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS=0xe7f1725E7734CE288F8368f2E04C4400557EA640

# Contrato de Registro de Nombres
NEXT_PUBLIC_NAME_REGISTRY_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
```

### 4. Hook para Acceso a Contratos

Crear un hook para acceder fácilmente a cualquier contrato registrado:

```typescript
// web/src/hooks/useContract.ts
import { useContext, useMemo } from 'react';
import { contractRegistry } from '@/services/contract-registry.service';

export const useContract = <T extends BaseContractService>(name: string): T | null => {
  return useMemo(() => {
    const contract = contractRegistry.get(name);
    return contract as T || null;
  }, [name]);
};

// Hook específico para SupplyChainTracker
export const useSupplyChainContract = () => {
  return useContract<SupplyChainService>('SupplyChainTracker');
};
```

## Implementación Paso a Paso

### Paso 1: Crear el Registro de Contratos

```bash
touch web/src/services/contract-registry.service.ts
```

### Paso 2: Modificar los Servicios de Contratos

Actualizar `SupplyChainService` para registrarse automáticamente al instanciarse.

### Paso 3: Crear Servicios para Nuevos Contratos

Para cada nuevo contrato, crear un servicio similar:

```bash
# Para un contrato de tokens
touch web/src/services/token.service.ts
```

### Paso 4: Actualizar Variables de Entorno

Agregar las nuevas variables al `.env.local`.

### Paso 5: Crear Hooks Personalizados

Implementar hooks para facilitar el acceso a los contratos.

## Beneficios

- **Extensibilidad**: Fácil agregar nuevos contratos
- **Centralización**: Gestión centralizada de todos los contratos
- **Tipado**: Soporte completo de TypeScript
- **Flexibilidad**: Cada contrato puede tener su propia lógica

## Consideraciones

- Asegurarse de que el ABI esté correctamente generado para cada contrato
- Manejar los errores de red de manera adecuada
- Implementar caché para llamadas frecuentes
- Considerar los límites de gas en transacciones

## Conclusión

Este sistema permite una arquitectura modular y escalable para la interacción con múltiples contratos inteligentes, preparando la aplicación para futuras extensiones y funcionalidades.