# Mejoras de Arquitectura - DApp de Trazabilidad de Netbooks

## 🏗️ Estado Actual de la Arquitectura

### Estructura General
La aplicación sigue una arquitectura típica de Next.js con separación de concerns:
- **Frontend**: Next.js 16 con App Router
- **Web3**: Wagmi/Viem para interacción blockchain
- **UI**: Tailwind CSS + shadcn/ui
- **Backend**: Contratos inteligentes Solidity

### Patrones Implementados
1. **Context API** para gestión de estado global (Web3)
2. **Hooks personalizados** para lógica reutilizable
3. **Servicios** para abstracción de lógica de negocio
4. **Separación de tipos** en directorio dedicado

## ⚠️ Problemas Arquitectónicos Identificados

### 1. Incompletitud Funcional
- Múltiples funciones del contrato no implementadas en servicios
- Hooks con funciones parcialmente implementadas
- Páginas requeridas faltantes

### 2. Manejo de Estado
- Falta de persistencia en localStorage
- No hay mecanismo de caching para datos blockchain
- Estados de UI no persistidos entre navegaciones

### 3. Separación de Concerns
- Algunas responsabilidades están mezcladas en hooks
- Falta de utilidades compartidas para operaciones comunes
- No hay capa de validación de datos

### 4. Testing
- Configuración de testing básica sin implementación
- No hay tests unitarios ni de integración

## 🎯 Principios Arquitectónicos a Aplicar

### 1. Arquitectura Limpia
```
Presentación (UI) → Aplicación (Hooks) → Dominio (Servicios) → Infraestructura (Contratos)
```

### 2. Principio de Única Responsabilidad
Cada componente/módulo debe tener una única razón para cambiar.

### 3. Inversión de Dependencias
Las dependencias deben apuntar hacia adentro desde las capas externas hacia el núcleo.

## 🛠️ Propuesta de Mejora Arquitectónica

### 1. Reestructuración de Directorios

```
web/src/
├── app/                    # Páginas y layouts
│   ├── (auth)/            # Rutas de autenticación
│   ├── admin/             # Panel administrativo
│   ├── dashboard/         # Dashboard principal
│   ├── tokens/            # Gestión de tokens
│   └── transfers/         # Transferencias
├── components/            # Componentes UI
│   ├── layout/            # Componentes de layout
│   ├── admin/             # Componentes administrativos
│   ├── dashboard/         # Componentes de dashboard
│   ├── tokens/            # Componentes de tokens
│   └── transfers/         # Componentes de transferencias
├── hooks/                 # Hooks personalizados
│   ├── use-web3.ts        # Hook Web3 específico
│   ├── use-auth.ts        # Hook de autenticación
│   ├── use-tokens.ts      # Hook para gestión de tokens
│   └── use-transfers.ts   # Hook para transferencias
├── services/              # Servicios de negocio
│   ├── web3-service.ts    # Servicio Web3 central
│   ├── token-service.ts   # Servicio de gestión de tokens
│   ├── transfer-service.ts # Servicio de transferencias
│   └── role-service.ts    # Servicio de gestión de roles
├── lib/                   # Utilidades y configuraciones
│   ├── wagmi/            # Configuración Wagmi
│   ├── cache/            # Utilidades de caching
│   ├── validation/       # Validaciones con Zod
│   └── utils/            # Utilidades generales
├── stores/               # Manejo de estado (si se usa Zustand/Jotai)
├── types/                # Tipos TypeScript
└── contracts/            # ABIs y tipos de contratos
```

### 2. Patrón de Servicios Mejorado

#### Servicio Web3 Base
```typescript
// services/web3-service.ts
export class Web3Service {
  private static instance: Web3Service;
  private provider: PublicClient;
  private walletClient: WalletClient | undefined;

  private constructor() {
    this.provider = createPublicClient({
      chain: anvil,
      transport: http()
    });
  }

  public static getInstance(): Web3Service {
    if (!Web3Service.instance) {
      Web3Service.instance = new Web3Service();
    }
    return Web3Service.instance;
  }

  // Métodos comunes de lectura/escritura
}
```

#### Servicios Especializados
```typescript
// services/token-service.ts
export class TokenService {
  private web3Service: Web3Service;
  
  constructor() {
    this.web3Service = Web3Service.getInstance();
  }
  
  async registerNetbooks(serials: string[], batches: string[], specs: string[]) {
    // Implementación
  }
  
  async getNetbookState(serial: string) {
    // Implementación
  }
}
```

### 3. Sistema de Caching

#### Cache Service
```typescript
// lib/cache/cache-service.ts
export class CacheService {
  private static TTL = 5 * 60 * 1000; // 5 minutos
  
  static set(key: string, data: any, ttl?: number) {
    const item = {
      data,
      expiry: Date.now() + (ttl || this.TTL)
    };
    localStorage.setItem(key, JSON.stringify(item));
  }
  
  static get(key: string): any {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;
    
    const item = JSON.parse(itemStr);
    if (Date.now() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    
    return item.data;
  }
}
```

### 4. Manejo de Errores Centralizado

```typescript
// lib/errors/error-handler.ts
export class ErrorHandler {
  static handleWeb3Error(error: any): AppError {
    if (error.code === 4001) {
      return new AppError('Transaction rejected by user', 'USER_REJECTED');
    }
    
    if (error.code === -32603) {
      return new AppError('Internal error', 'INTERNAL_ERROR');
    }
    
    return new AppError(error.message || 'Unknown error', 'UNKNOWN');
  }
}

export class AppError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AppError';
  }
}
```

## 📋 Plan de Implementación

### Fase 1: Reestructuración Base (1-2 días)
- [ ] Reorganizar directorios según propuesta
- [ ] Crear servicios base (Web3Service)
- [ ] Implementar sistema de caching
- [ ] Crear manejador de errores centralizado

### Fase 2: Servicios Especializados (2-3 días)
- [ ] Implementar TokenService con todas las funciones
- [ ] Crear TransferService para gestión de transferencias
- [ ] Desarrollar RoleService para gestión de permisos
- [ ] Añadir validaciones con Zod

### Fase 3: Hooks Mejorados (1-2 días)
- [ ] Refactorizar hooks existentes
- [ ] Crear hooks especializados por dominio
- [ ] Implementar manejo de estados de carga/error
- [ ] Añadir caching a hooks

### Fase 4: Persistencia y Estado (1 día)
- [ ] Implementar persistencia en localStorage
- [ ] Crear sistema de notificaciones
- [ ] Añadir estado global para datos críticos

### Fase 5: Testing (2-3 días)
- [ ] Configurar tests unitarios para servicios
- [ ] Implementar tests para hooks
- [ ] Añadir tests de integración para componentes clave
- [ ] Configurar cobertura de código

## 🎯 Beneficios Esperados

1. **Mantenibilidad**: Código más organizado y fácil de mantener
2. **Escalabilidad**: Arquitectura que puede crecer con nuevas funcionalidades
3. **Performance**: Caching reduce llamadas innecesarias a blockchain
4. **Confianza**: Manejo de errores centralizado y consistente
5. **Colaboración**: Estructura clara para trabajo en equipo
6. **Testing**: Arquitectura que facilita la creación de tests