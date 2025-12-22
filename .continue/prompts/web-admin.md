

# Web Admin Platform


### **🌐 FRONTEND**
- [ ] `Web3Context` programado con localStorage
- [ ] Hook `useWallet` implementado
- [ ] Servicio `Web3Service` creado
- [ ] Configuración del contrato actualizada
- [ ] Todas las páginas creadas y funcionando:
  - [ ] `/` - Landing con conexión wallet
  - [ ] `/dashboard` - Panel principal
  - [ ] `/tokens` y `/tokens/create` - Gestión tokens
  - [ ] `/tokens/[id]` y `/tokens/[id]/transfer` - Detalles y transferencias
  - [ ] `/transfers` - Transferencias pendientes
  - [ ] `/admin` y `/admin/users` - Panel administración
  - [ ] `/profile` - Perfil usuario
- [ ] Header con navegación implementado
- [ ] Componentes UI base creados

### **🔗 INTEGRACIÓN**
- [ ] Conexión wallet funcionando
- [ ] Registro de usuarios por rol implementado
- [ ] Aprobación por admin operativa
- [ ] Creación de tokens con metadatos
- [ ] Sistema de transferencias completo
- [ ] Aceptar/rechazar transferencias funcionando
- [ ] Trazabilidad de productos visible
- [ ] Persistencia en localStorage implementada

### **📱 FUNCIONALIDAD COMPLETA**
- [ ] Flujo completo FABRICADA→HW_APROBADO→SW_VALIDADO→DISTRIBUIDA
- [ ] Validaciones de permisos por rol
- [ ] Estados visuales correctos (pending, approved, etc.)
- [ ] Manejo de errores implementado
- [ ] Design responsive funcionando
- [ ] Build de producción sin errores





# Sistema de Trazabilidad de Netbooks - Panel de Administración

## 🎯 Descripción del Sistema

Este sistema web3 implementa un contrato inteligente de trazabilidad para el ciclo de vida completo de netbooks educativas. **Solo el administrador designado** tiene control total sobre la gestión de roles y la supervisión del sistema.

## 🔐 Acceso Exclusivo del Administrador

### **Privilegios Únicos del Administrador**
- ✅ **Gestión de Roles**: Otorgar o revocar permisos a direcciones de blockchain
- ✅ **Supervisión Total**: Visualización completa de todas las transacciones y estados
- ✅ **Configuración del Sistema**: Definir parámetros y estructuras de datos JSON
- ❌ **Usuarios regulares**: Solo pueden consultar información (lectura pública)

## 🏗️ Arquitectura del Sistema

### **Control de Acceso Basado en Roles (RBAC)**
- Sistema de permisos granular usando `AccessControl` de OpenZeppelin
- Cada función requiere un rol específico asignado por el administrador
- Trazabilidad pública para auditoría, datos sensibles protegidos

### **Máquina de Estados con Tokens NFT**
- **Token por máquina**: Cada netbook representa un NFT único
- **Estados secuenciales**: Flujo predefinido que no permite regresiones
- **Historial inmutable**: Todos los cambios quedan registrados en el token

## 📊 Estados del Ciclo de Vida

| Estado | Descripción | Rol Responsable |
|--------|-------------|-----------------|
| **FABRICADA** | Registro inicial por el fabricante | FABRICANTE_ROLE |
| **HW_APROBADO** | Hardware verificado y aprobado | AUDITOR_HW_ROLE |
| **SW_VALIDADO** | Software instalado y validado | TECNICO_SW_ROLE |
| **DISTRIBUIDA** | Asignada a estudiante final | ESCUELA_ROLE |

> **Restricción**: Progresión secuencial obligatoria. No se pueden saltar estados.

## ⚙️ Funcionalidades del Panel Administrativo





### **🌐 FRONTEND**
- [ ] Proyecto Next.js inicializado con TypeScript
- [ ] Dependencias instaladas (ethers, tailwind, radix-ui)
- [ ] `Web3Context` programado con localStorage
- [ ] Hook `useWallet` implementado
- [ ] Servicio `Web3Service` creado
- [ ] Configuración del contrato actualizada
- [ ] Todas las páginas creadas y funcionando:
  - [ ] `/` - Landing con conexión wallet
  - [ ] `/dashboard` - Panel principal
  - [ ] `/tokens` y `/tokens/create` - Gestión tokens
  - [ ] `/tokens/[id]` y `/tokens/[id]/transfer` - Detalles y transferencias
  - [ ] `/transfers` - Transferencias pendientes
  - [ ] `/admin` y `/admin/users` - Panel administración
  - [ ] `/profile` - Perfil usuario
- [ ] Header con navegación implementado
- [ ] Componentes UI base creados

### **🔗 INTEGRACIÓN**
- [ ] Conexión wallet funcionando
- [ ] Registro de usuarios por rol implementado
- [ ] Aprobación por admin operativa
- [ ] Creación de tokens con metadatos
- [ ] Sistema de transferencias completo
- [ ] Aceptar/rechazar transferencias funcionando
- [ ] Trazabilidad de productos visible
- [ ] Persistencia en localStorage implementada

### **📱 FUNCIONALIDAD COMPLETA** 
- [ ] Validaciones de permisos por rol
- [ ] Estados visuales correctos (pending, approved, etc.)
- [ ] Manejo de errores implementado
- [ ] Design responsive funcionando




