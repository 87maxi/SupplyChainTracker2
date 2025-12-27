# Componentes del Sistema

## Componentes Principales

### HardwareAuditForm
- **Ubicación**: `web/src/components/contracts/HardwareAuditForm.tsx`
- **Propósito**: Formulario completo para auditoría de hardware con campos específicos
- **Estado**: State-of-the-art, completamente funcional con mejoras de UX
- **Características**:
  - Campos específicos para Serial, Modelo, Fecha, Auditor, Componentes Verificados, Observaciones
  - Diseño responsive con mejoras de scroll
  - Manejo adecuado de errores y validación
  - Integración con servicios de cadena de suministro

### FormUploader
- **Ubicación**: `web/src/components/ipfs/FormUploader.tsx`
- **Propósito**: Componente legacy para subir JSON a IPFS
- **Estado**: Obsoleto, debe ser reemplazado
- **Características**:
  - Sube formulario en formato JSON a IPFS
  - Muestra textarea con JSON crudo
  - Interfaz confusa para usuarios finales

## Páginas

### audit/page.tsx
- **Ubicación**: `web/src/app/audit/page.tsx`
- **Propósito**: Página principal de auditoría de hardware
- **Estado**: Utiliza componente legacy FormUploader
- **Flujo actual**:
  1. Usuario completa formulario en FormUploader (JSON)
  2. Formulario se sube a IPFS
  3. Usuario registra Serial y resultado en blockchain

### dashboard/page.tsx
- **Ubicación**: `web/src/app/dashboard/page.tsx`
- **Propósito**: Página de dashboard que utiliza HardwareAuditForm
- **Estado**: Utiliza el nuevo componente funcional
- **Flujo actual**:
  1. Usuario interactúa con HardwareAuditForm con campos específicos
  2. Formulario se procesa y registra en blockchain

## Recomendación

El sistema tiene dos flujos paralelos para auditoría de hardware:
1. **Nuevo flujo** (recomendado): HardwareAuditForm con campos específicos (usado en dashboard)
2. **Flujo legacy**: FormUploader con JSON crudo (usado en página de audit)

Se recomienda migrar la página `/audit` para utilizar HardwareAuditForm en lugar de FormUploader para mantener consistencia en UX y eliminar redundancia.