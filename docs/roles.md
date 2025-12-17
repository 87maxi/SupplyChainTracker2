# Sistema de Roles - Supply Chain Tracker

Este documento detalla la implementación del sistema de control de acceso basado en roles (RBAC) para el contrato `SupplyChainTracker`.

## 🛡️ Arquitectura de Seguridad

El sistema utiliza `AccessControl` de OpenZeppelin para gestionar permisos, proporcionando un control granular sobre quién puede ejecutar qué funciones.

### **Roles Definidos**

| Rol | Descripción | Funciones Asociadas |
|--------|-------------|-----------------|
| **DEFAULT_ADMIN_ROLE** | Rol administrador raíz con todos los privilegios | Gestión total del sistema, asignación de roles |
| **FABRICANTE_ROLE** | Responsable de la fabricación y registro inicial | `registerNetbooks()` |
| **AUDITOR_HW_ROLE** | Encargado de verificar el hardware | `auditHardware()` |
| **TECNICO_SW_ROLE** | Responsable de la instalación y validación del software | `validateSoftware()` |
| **ESCUELA_ROLE** | Responsable de la distribución final a estudiantes | `assignToStudent()` |

> **Nota**: Solamente el administrador (DEFAULT_ADMIN_ROLE) puede asignar o revocar roles. Este privilegio no puede ser delegado.

## 🔐 Implementación de Control de Acceso

### **Mecanismo de Verificación**

Se utiliza la función interna `_checkRole` de AccessControl para validaciones eficientes:

```solidity
function _checkRoleCustom(bytes32 role) internal view {
    if (!hasRole(role, msg.sender)) {
        revert("Acceso denegado: rol requerido");
    }
}
```

### **Sistema de Estados Secuenciales**

La progresión del ciclo de vida de las netbooks es estrictamente secuencial y verificada mediante modificadores:

| Estado Actual → Próximo Estado | Rol Requerido |
|-------------------------------|---------------|
| `FABRICADA` → `HW_APROBADO` | `AUDITOR_HW_ROLE` |
| `HW_APROBADO` → `SW_VALIDADO` | `TECNICO_SW_ROLE` |
| `SW_VALIDADO` → `DISTRIBUIDA` | `ESCUELA_ROLE` |

Los modificadores `stateExpected` garantizan que no se puedan saltar estados ni regresar a estados anteriores.

## 📱 Funcionalidades de Gestión

### **Asignación de Roles**

Un administrador puede asignar roles mediante funciones heredadas de AccessControl:

```typescript
// Ejemplo en frontend
await contract.grantRole(FABRICANTE_ROLE, direccionFabricante);
```

### **Revocación de Roles**

Los roles pueden ser revocados cuando ya no son necesarios:

```typescript
// Ejemplo en frontend
await contract.revokeRole(AUDITOR_HW_ROLE, direccionAuditorAnterior);
```

## 📚 Estados del Ciclo de Vida

| Estado | Descripción | Rol Responsable |
|--------|-------------|-----------------|
| **FABRICADA** | Registro inicial por el fabricante | FABRICANTE_ROLE |
| **HW_APROBADO** | Hardware verificado y aprobado | AUDITOR_HW_ROLE |
| **SW_VALIDADO** | Software instalado y validado | TECNICO_SW_ROLE |
| **DISTRIBUIDA** | Asignada a estudiante final | ESCUELA_ROLE |

> **Restricción**: Progresión secuencial obligatoria. No se pueden saltar estados.

## ✅ Mejoras de Seguridad Implementadas

1. **Validación de Serial**: Todas las funciones críticas verifican que el número de serie no esté vacío.
2. **Detección de Duplicados**: `registerNetbooks` previene el registro duplicado de netbooks.
3. **Mensajes de Error Claros**: Reverts con mensajes descriptivos para mejorar la experiencia de depuración.
4. **Separación de Lectura/Escritura**: Funciones públicas de solo lectura accesibles sin restricciones.

## 📄 Referencias

- [OpenZeppelin AccessControl](https://docs.openzeppelin.com/contracts/4.x/access-control)
- [Best Practices for Secure Smart Contracts](https://consensys.github.io/smart-contract-best-practices/)