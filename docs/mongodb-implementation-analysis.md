# Análisis de Implementación: Integración con MongoDB

## 1. Situación Actual

Se ha identificado un problema crítico de arquitectura en la integración con MongoDB que está causando errores en el entorno de desarrollo con Turbopack:

- **Dos implementaciones duplicadas** del servicio de MongoDB:
  - `src/services/server/mongodb-service.ts`
  - `src/lib/mongodb.ts`

- **Error de seguridad grave**: La variable de entorno de MongoDB (`NEXT_PUBLIC_MONGODB_URI`) está expuesta al cliente, lo que representa un riesgo de seguridad significativo.

- **Uso incorrecto de `"use server"`**: Se está exportando una instancia de clase en lugar de funciones asíncronas.

- **Fuga de dependencias**: Módulos de Node.js (`mongodb`, `net`, `fs`, etc.) se están importando accidentalmente en el cliente.

## 2. Origen del Problema

El problema surge principalmente porque:

1. El archivo `RoleDataService.ts` importa el servicio de MongoDB desde `@/services/server/mongodb-service`
2. Este servicio exporta tanto la instancia como las interfaces
3. Esto causa que TypeScript importe todo el módulo (incluyendo el driver de MongoDB) en el cliente
4. Además, hay variables de entorno públicas que exponen la URI de la base de datos

## 3. Solución Propuesta

### Paso 1: Separar Tipos e Implementación

Crear un archivo de tipos independiente que no dependa del driver de MongoDB:

```typescript
// src/types/mongodb.ts
export interface RoleData {
  _id?: string;
  transactionHash: `0x${string}`;
  role: string;
  userAddress: string;
  data: Record<string, unknown>;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface NetbookData {
  _id?: string;
  serialNumber: string;
  transactionHash: `0x${string}`;
  role: string;
  userAddress: string;
  data: Record<string, unknown>;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Paso 2: Corregir el Servicio de MongoDB

1. Usar `MONGODB_URI` en lugar de `NEXT_PUBLIC_MONGODB_URI`
2. Asegurar que el servicio esté correctamente configurado con `"use server"`
3. Exportar solo funciones asíncronas o mantener la instancia pero asegurando que no se importe en el cliente

### Paso 3: Actualizar RoleDataService

Modificar las importaciones para que no importen tipos del servicio de MongoDB, sino de los tipos independientes.

### Paso 4: Eliminar Implementación Duplicada

Eliminar `src/services/server/mongodb-service.ts` y consolidar en `src/lib/mongodb.ts`

### Paso 5: Corregir variables de entorno

Renombrar `NEXT_PUBLIC_MONGODB_URI` a `MONGODB_URI` y eliminar el prefijo público.