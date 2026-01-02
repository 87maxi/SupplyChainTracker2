# Documentación: Cambios en la Arquitectura de Roles

## Introducción

Este documento describe los cambios realizados en la arquitectura de gestión de roles en la aplicación SupplyChainTracker. El objetivo principal fue eliminar la dependencia del contrato inteligente para obtener los hashes de roles, reemplazándola con constantes definidas en el frontend.

## Problemas Identificados

1. **Dependencia redundante**: El frontend estaba haciendo llamadas al contrato para obtener hashes de roles que son constantes conocidas (calculados con keccak256)
2. **Errores de tipado**: El contrato no tiene un método `readContract` implementado, lo que causaba errores en tiempo de ejecución
3. **Inconsistencias en el código**: Varias partes del código tenían definiciones duplicadas de los hashes de roles

## Solución Implementada

### 1. Creación de Constantes de Roles

Se creó un archivo `src/lib/constants/roles.ts` que define todos los hashes de roles como constantes. Esto elimina la necesidad de consultar al contrato para obtener esta información.

```typescript
// src/lib/constants/roles.ts
export const ROLE_HASHES = {
  // FABRICANTE_ROLE = keccak256("FABRICANTE_ROLE")
  FABRICANTE: "0xdf8b4c520affe6d5bd668f8a16ff439b2b3fe20527c8a5d5d7cd0f17c3aa9c5d" as const,
  
  // AUDITOR_HW_ROLE = keccak256("AUDITOR_HW_ROLE")
  AUDITOR_HW: "0xed8e002819d8cf1a851ca1db7d19c6848d2559e61bf51cf90a464bd116556c00" as const,
  
  // TECNICO_SW_ROLE = keccak256("TECNICO_SW_ROLE")
  TECNICO_SW: "0x2ed8949af5557e2edaec784b826d9da85a22565588342ae7b736d3e8ebd76bfe" as const,
  
  // ESCUELA_ROLE = keccak256("ESCUELA_ROLE")
  ESCUELA: "0x88a49b04486bc479c925034ad3947fb7a1dc63c11a4fc29c186b7efde141b141" as const,
  
  // DEFAULT_ADMIN_ROLE es 0x00...00
  ADMIN: "0x0000000000000000000000000000000000000000000000000000000000000000" as const
} as const;
```

### 2. Actualización del Servicio de Roles

Se implementó `RoleService` como una clase que hereda de `BaseContractService` y proporciona una interfaz segura para operaciones de roles. El servicio usa las constantes de roles en lugar de consultar al contrato.

### 3. Modificación de Componentes

Se actualizó `RoleManager.tsx` para usar las constantes de roles importadas desde `@/lib/constants/roles` en lugar de tener una definición duplicada.

```typescript
// Antes
const roleHashes: { [key: string]: string } = {
  fabricante: '0x69c9d0bc9936ff6c338514a41e3d5a3756816c733d2870f51f9b137bb0564731',
  // ...
};

// Después
import { ROLE_HASHES } from '@/lib/constants/roles';

const roleHashMap: Record<string, string> = {
  fabricante: ROLE_HASHES.FABRICANTE,
  // ...
};
```

## Beneficios

1. **Rendimiento mejorado**: No se necesitan llamadas de red para obtener hashes de roles
2. **Mayor fiabilidad**: Elimina puntos de fallo al comunicarse con el contrato
3. **Mantenibilidad**: Todos los hashes de roles están definidos en un solo lugar
4. **Tipado seguro**: Uso de tipos TypeScript para garantizar consistencia

## Próximos Pasos

1. Implementar pruebas unitarias para el `RoleService`
2. Añadir manejo de errores más robusto
3. Implementar un sistema de monitorización para operaciones de roles
4. Documentar la API completa de gestión de roles