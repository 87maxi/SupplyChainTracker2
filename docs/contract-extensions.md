# Extensión del Contrato SupplyChainTracker

## 📋 Resumen

Este documento propone la extensión del contrato inteligente `SupplyChainTracker.sol` para soportar la gestión completa de roles de usuario necesaria para el panel de administración. Actualmente, el contrato no proporciona métodos para obtener todos los miembros de un rol, lo que impide una implementación completa del dashboard.

## 🆕 Métodos Propuestos para el Contrato

### 1. Método `getAllMembers`

**Propósito:** Obtener todos los miembros de un rol específico

```solidity
function getAllMembers(bytes32 role) public view returns (address[] memory) {
    uint256 count = getRoleMemberCount(role);
    address[] memory members = new address[](count);
    
    for (uint256 i = 0; i < count; i++) {
        members[i] = getRoleMember(role, i);
    }
    
    return members;
}
```

### 2. Método `getRoleMemberCount`

**Propósito:** Obtener el número de miembros en un rol

```solidity
function getRoleMemberCount(bytes32 role) public view returns (uint256) {
    return getRoleMemberCount(role);
}
```

Este método ya está disponible en `AccessControl` de OpenZeppelin, por lo que solo necesitamos exponerlo públicamente.

## 🔄 Implementación Extendida

Actualización propuesta para `SupplyChainTracker.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {AccessControl} from "openzeppelin-contracts/contracts/access/AccessControl.sol";

contract SupplyChainTracker is AccessControl {
    // --- Roles ---
    bytes32 public constant FABRICANTE_ROLE = keccak256("FABRICANTE_ROLE");
    bytes32 public constant AUDITOR_HW_ROLE = keccak256("AUDITOR_HW_ROLE");
    bytes32 public constant TECNICO_SW_ROLE = keccak256("TECNICO_SW_ROLE");
    bytes32 public constant ESCUELA_ROLE = keccak256("ESCUELA_ROLE");

    // --- Enums ---
    enum State {
        FABRICADA,
        HW_APROBADO,
        SW_VALIDADO,
        DISTRIBUIDA
    }

    // --- Estructuras de Datos ---
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
        uint distributionTimestamp;

        // Estado actual
        State currentState;
    }

    // --- Almacenamiento ---
    mapping(string => Netbook) private netbooks;
    string[] public allSerialNumbers;

    // Eventos y modificadores omitidos por brevedad...
    
    // --- Funciones de Soporte de Roles ---
    
    /**
     * @dev Retorna todos los miembros de un rol específico.
     * @param role El rol del cual obtener los miembros.
     * @return address[] Un array con todas las direcciones que tienen el rol.
     */
    function getAllMembers(bytes32 role) public view returns (address[] memory) {
        uint256 count = getRoleMemberCount(role);
        address[] memory members = new address[](count);
        
        for (uint256 i = 0; i < count; i++) {
            members[i] = getRoleMember(role, i);
        }
        
        return members;
    }
    
    /**
     * @dev Retorna el número de miembros en un rol específico.
     * @param role El rol del cual obtener el conteo.
     * @return uint256 El número de miembros en el rol.
     */
    function getRoleMemberCount(bytes32 role) public view returns (uint256) {
        return getRoleMemberCount(role);
    }

    /**
     * @dev Verifica si una dirección tiene un rol específico.
     * @param role El rol a verificar.
     * @param account La dirección a verificar.
     * @return bool Verdadero si la cuenta tiene el rol.
     */
    function hasRole(bytes32 role, address account) public view override returns (bool) {
        return super.hasRole(role, account);
    }

    // Resto del contrato...
}
```

## 🔄 Actualización del Backend

Vamos a actualizar `web/src/lib/api/serverRpc.ts` para usar el nuevo método `getAllMembers`:

```typescript
'use server';

import { revalidateTag } from 'next/cache';
import { SupplyChainContract } from '@/lib/contracts/SupplyChainContract';

const cache = new Map();

// Server-only RPC functions
export const serverRpc = {
  // ... otros métodos ...

  async getRoleMembers(roleHash: string): Promise<string[]> {
    try {
      return await SupplyChainContract.getAllMembers(roleHash);
    } catch (error) {
      console.error(`Error getting members for role ${roleHash}:`, error);
      throw error;
    }
  },
  
  async getRoleMemberCount(roleHash: string): Promise<number> {
    try {
      const count = await SupplyChainContract.getRoleMemberCount(roleHash);
      return Number(count);
    } catch (error) {
      console.error(`Error getting member count for role ${roleHash}:`, error);
      throw error;
    }
  }
};
```

## 🔄 Actualización del Dashboard

Vamos a actualizar `getDashboardData` para incluir información de usuarios:

```typescript
// web/src/app/admin/components/server/actions.ts

export async function getDashboardData() {
  try {
    // Get all serial numbers
    const serialNumbers = await serverRpc.getAllSerialNumbers();
    
    // Get role members
    const fabricanteRole = '0x77158a1a868f1a2c65d799578edd3b70d91fe41d35a0873530f1675e734b03ea';
    const auditorHwRole = '0x1b936a89e5e4bda7649c98d9e9505d97f27e27d48c04ee16fe3626e927b10223';
    const tecnicoSwRole = '0x82c5ab743a5cc7f634910cb398752a71d2d53dfaf4533e36bea6a488818753ab';
    const escuelaRole = '0xc1a00cfc59ca80abcf3bceb0faa0349adfbe88d3298de8601c5e848e293322e7';
    
    // Fetch role members concurrently
    const [fabricanteCount, auditorHwCount, tecnicoSwCount, escuelaCount] = await Promise.all([
      serverRpc.getRoleMemberCount(fabricanteRole),
      serverRpc.getRoleMemberCount(auditorHwRole),
      serverRpc.getRoleMemberCount(tecnicoSwRole),
      serverRpc.getRoleMemberCount(escuelaRole)
    ]);
    
    // Initialize counters
    const stats = {
      fabricanteCount,
      auditorHwCount,
      tecnicoSwCount,
      escuelaCount,
      totalFabricadas: 0,
      totalHwAprobadas: 0,
      totalSwValidadas: 0,
      totalDistribuidas: 0
    };
    
    // Process each netbook state
    const stateStats = [];
    for (const serial of serialNumbers) {
      stateStats.push(
        serverRpc.getNetbookState(serial).then(state => {
          switch (state) {
            case 0: // FAB