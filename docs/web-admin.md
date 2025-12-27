# Sistema de Administración de Roles - Guía para Administradores

## Introducción

Este documento describe el flujo completo del sistema de gestión de roles para el sistema de trazabilidad de netbooks. El sistema utiliza un modelo basado en roles (RBAC) con autorización tanto en la blockchain como en la interfaz web, asegurando que solo los usuarios autorizados puedan realizar acciones específicas.

---

## Roles del Sistema

El sistema define cinco roles principales según sus responsabilidades en el ciclo de vida de las netbooks:

### 1. Administrador del Sistema (DEFAULT_ADMIN_ROLE)
**Responsabilidades:**
- Aprobar solicitudes de acceso para todos los roles
- Gestionar el rol de otros administradores
- Supervisar todo el sistema

**Acciones permitidas:**
- Aprobar/rechazar solicitudes de roles
- Revocar roles existentes
- Ver todas las solicitudes pendientes
- Monitorear el estado del sistema

### 2. Fabricante (FABRICANTE_ROLE)
**Responsabilidades:**
- Registrar nuevas netbooks en el sistema
- Añadir especificaciones técnicas iniciales
- Iniciar el ciclo de vida del dispositivo

**Datos que debe cargar:**
- Número de serie único (32 caracteres alfanuméricos)
- ID de lote (16 caracteres alfanuméricos)
- Especificaciones técnicas iniciales (JSON)
  ```json
  {
    "cpu": "Intel Core i3",
    "ram": "8GB",
    "storage": "256GB SSD",
    "display": "11.6\" HD"
  }
  ```

### 3. Auditor de Hardware (AUDITOR_HW_ROLE)
**Responsabilidades:**
- Verificar la integridad física de las netbooks
- Validar que el hardware coincida con las especificaciones
- Registrar resultados de auditoría en el sistema

**Proceso de Auditoría (sin formulario directo):**

A diferencia de lo que podría sugerirse, el auditor de hardware **no carga directamente** el hash del reporte técnico a través de un formulario en el dashboard. En su lugar, sigue un proceso indirecto basado en la blockchain:

1. El auditor realiza la inspección física del dispositivo
2. Documenta sus hallazgos en un informe técnico externo
3. Genera el hash criptográfico (SHA-256) de su informe completo
4. Registra el resultado básico de la auditoría en el sistema

**Datos que se registran en el sistema:**
- Número de serie del dispositivo
- Resultado de la auditoría (pasó/no pasó)
- Hash del reporte técnico (generado externamente)
- Firma digital del auditor

**Verificación por otros roles:**

El proceso está diseñado para ser verificable por otros roles:

1. **Representantes de escuela** pueden verificar que el dispositivo pasó la auditoría de hardware antes de la distribución
2. **Administradores** pueden revisar todos los resultados de auditoría
3. **Técnicos de software** pueden verificar que el hardware fue aprobado antes de instalar el software

**Acceso a la información completa:**

El informe técnico completo (no solo el hash) no se almacena en la blockchain por razones de costo y privacidad, sino que:
- Se almacena en un sistema de almacenamiento externo (IPFS, almacenamiento criptografiado, etc.)
- El hash almacenado en la blockchain sirve como prueba de integridad
- Cualquier parte autorizada puede solicitar el informe completo y verificar que su hash coincide con el almacenado en la blockchain

**Beneficios del diseño actual:**
- ✅ **Eficiencia**: No se almacenan grandes cantidades de datos en la blockchain
- ✅ **Privacidad**: La información sensible del informe no es completamente pública
- ✅ **Verificación**: Cualquier parte puede verificar la autenticidad del informe
- ✅ **Integridad**: Cualquier alteración del informe se detecta mediante el hash

### 4. Técnico de Software (TECNICO_SW_ROLE)
**Responsabilidades:**
- Validar la instalación del sistema operativo
- Verificar la compatibilidad del software
- Aprobar el dispositivo para su distribución

**Datos que debe cargar:**
- Número de serie
- Versión del sistema operativo
- Resultado de la validación (pasó/no pasó)
- Fecha y hora de validación
- Firma del técnico

### 5. Representante de Escuela (ESCUELA_ROLE)
**Responsabilidades:**
- Asignar netbooks a estudiantes
- Registrar información de distribución
- Mantener el registro de dispositivos asignados

**Datos que debe cargar:**
- Número de serie
- Hash del nombre/ID de la escuela (SHA-256)
- Hash del ID del estudiante (SHA-256)
- Fecha de asignación

---

## Flujo de Solicitudes de Acceso

### Paso 1: Solicitud de Acceso
1. El usuario accede al sistema con su wallet
2. Navega a la página de solicitudes de roles
3. Selecciona el rol deseado
4. Confirma la solicitud con su wallet

**Datos enviados automáticamente:**
- Dirección de wallet
- Rol solicitado
- Timestamp
- Firma digital

### Paso 2: Procesamiento del Administrador
1. Acceder al panel de administración
2. Navegar a "Solicitudes Pendientes"
3. Revisar cada solicitud
4. Verificar la identidad del solicitante
5. Aprovar o rechazar la solicitud

### Paso 3: Validación de la Transacción
1. El sistema espera la confirmación en la blockchain
2. Verifica que el rol se haya asignado correctamente
3. Actualiza el estado de la solicitud
4. Notifica al usuario

---

## Guía de Interfaz de Administración

### Panel Principal
- **Tarjetas de Métricas:**
  - Solicitudes pendientes
  - Usuarios totales
  - Roles activos
  - Alertas del sistema

- **Resumen de Roles:**
  - Administradores
  - Fabricantes
  - Auditores de Hardware
  - Técnicos de Software
  - Escuelas

### Gestión de Solicitudes
**Pantalla: "Solicitudes Pendientes"

1. Filtrar por rol si es necesario
2. Buscar por dirección de wallet
3. Para cada solicitud:
   - Ver detalles del solicitante
   - Verificar el rol solicitado
   - Hacer clic en "Aprobar" o "Rechazar"
   - Confirmar la acción en la wallet

**Proceso de Aprobación:**
1. El administrador hace clic en "Aprobar"
2. Se abre la interfaz de la wallet
3. El administrador confirma la transacción
4. El sistema muestra:
   - Estado: "Transacción enviada"
   - Hash de la transacción
   - Enlace al explorador de bloques
5. Una vez confirmada en la blockchain:
   - Estado: "Rol asignado"
   - Notificación de éxito

### Gestión de Usuarios Aprobados

**Pantalla: "Cuentas Aprobadas"

1. Ver lista completa de usuarios
2. Filtrar por rol
3. Buscar por dirección
4. Para revocar un rol:
   - Hacer clic en el botón de eliminar
   - Confirmar en la wallet
   - Esperar confirmación en blockchain

---

## Procedimientos Específicos

### 1. Aprobar una Solicitud

1. Iniciar sesión con la wallet de administrador
2. Navegar a `/admin`
3. Ir a la sección "Solicitudes Pendientes"
4. Localizar la solicitud deseada
5. Hacer clic en "Aprobar"
6. Confirmar la transacción en la wallet
7. Esperar la confirmación (aprox. 30 segundos)
8. Verificar que la solicitud desaparezca de la lista

### 2. Revocar un Rol

1. Navegar a "Cuentas Aprobadas"
2. Buscar al usuario cuyo rol desea revocar
3. Hacer clic en el botón de eliminar
4. Confirmar en la wallet
5. Esperar confirmación en blockchain
6. Verificar que el usuario ya no aparezca en la lista

### 3. Registrar una Nueva Netbook

1. Estar logueado con rol de FABRICANTE_ROL
2. Navegar a "Registrar Netbooks"
3. Completar el formulario:
   - Número de serie: `SN-ABC123XYZ789` (único)
   - ID de lote: `L-2024-001` (formato L-año-número)
   - Especificaciones técnicas (formulario)
4. Hacer clic en "Registrar"
5. Confirmar transacción en la wallet
6. Esperar confirmación

### 4. Auditar Hardware

1. Estar logueado con rol de AUDITOR_HW_ROL
2. Navegar a "Auditar Hardware"
3. Ingresar número de serie
4. Seleccionar resultado: "Pasó" o "No pasó"
5. Cargar hash del reporte técnico
6. Firmar el informe
7. Enviar para procesamiento

---

## Mensajes de Error y Soluciones

| Error | Causa | Solución |
|-------|-------|----------|
| "Transacción rechazada" | El usuario rechazó en la wallet | Solicitar al usuario que apruebe |
| "Fondos insuficientes" | Saldo bajo en la wallet | Agregar ETH a la wallet |
| "Sin permisos de administrador" | La wallet no tiene rol de administrador | Usar una wallet con rol adecuado |
| "Rol ya asignado" | El usuario ya tiene ese rol | Verificar en "Cuentas Aprobadas" |
| "Número de serie duplicado" | El número ya existe en el sistema | Verificar el número e ingresar uno nuevo |

---

## Mejores Prácticas

1. **Verificación de Identidad:**
   - Siempre verificar la identidad del solicitante antes de aprobar
   - Mantener comunicación externa para confirm